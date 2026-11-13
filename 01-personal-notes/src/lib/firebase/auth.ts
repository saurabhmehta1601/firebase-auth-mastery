import {
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TotpMultiFactorGenerator,
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  multiFactor,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  verifyPasswordResetCode,
  type MultiFactorError,
  type MultiFactorResolver,
  type TotpSecret,
  type User,
} from 'firebase/auth'
import { auth as firebaseAuth } from './firebase'
import type { ReauthProviderId } from './utils'

function actionCodeSettings(handleCodeInApp: boolean) {
  return {
    url: window.location.origin,
    handleCodeInApp,
  }
}

async function register(email: string, password: string) {
  await createUserWithEmailAndPassword(firebaseAuth, email, password)
}

async function login(email: string, password: string) {
  await signInWithEmailAndPassword(firebaseAuth, email, password)
}

async function loginWithGoogle() {
  await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
}

async function loginWithGithub() {
  await signInWithPopup(firebaseAuth, new GithubAuthProvider())
}

async function logout() {
  await signOut(firebaseAuth)
}

async function sendVerificationEmail() {
  if (!firebaseAuth.currentUser) {
    throw new Error('No signed-in user to verify.')
  }
  await sendEmailVerification(firebaseAuth.currentUser, actionCodeSettings(false))
}

async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings(true))
}

async function applyEmailVerification(oobCode: string) {
  await applyActionCode(firebaseAuth, oobCode)
  if (firebaseAuth.currentUser) {
    await firebaseAuth.currentUser.reload()
  }
}

async function checkPasswordResetCode(oobCode: string) {
  return verifyPasswordResetCode(firebaseAuth, oobCode)
}

async function completePasswordReset(oobCode: string, password: string) {
  await confirmPasswordReset(firebaseAuth, oobCode, password)
}

function getCurrentUser() {
  return firebaseAuth.currentUser
}

async function reauthenticate(user: User, providerId: ReauthProviderId, password = '') {
  if (providerId === 'password') {
    if (!user.email) {
      throw new Error('This account has no email address.')
    }
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
    return
  }

  if (providerId === 'google.com') {
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
    return
  }

  await reauthenticateWithPopup(user, new GithubAuthProvider())
}

async function beginTotpEnrollment(user: User) {
  const session = await multiFactor(user).getSession()
  return TotpMultiFactorGenerator.generateSecret(session)
}

async function enrollTotp(user: User, secret: TotpSecret, code: string) {
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, code)
  await multiFactor(user).enroll(assertion, 'Authenticator')
  await user.reload()
  return multiFactor(user).enrolledFactors.length
}

async function unenrollAllFactors(user: User) {
  const factors = [...multiFactor(user).enrolledFactors]
  for (const factor of factors) {
    await multiFactor(user).unenroll(factor)
  }
  await user.reload()
  return multiFactor(user).enrolledFactors.length
}

function resolverFromError(error: MultiFactorError) {
  return getMultiFactorResolver(firebaseAuth, error)
}

async function resolveTotpSignIn(resolver: MultiFactorResolver, code: string) {
  const hint = resolver.hints.find(
    (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
  )
  if (!hint) {
    throw new Error('This account uses a second factor this app cannot complete.')
  }
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code)
  await resolver.resolveSignIn(assertion)
}

export const auth = {
  register,
  login,
  loginWithGoogle,
  loginWithGithub,
  logout,
  sendVerificationEmail,
  sendPasswordReset,
  applyEmailVerification,
  checkPasswordResetCode,
  completePasswordReset,
  getCurrentUser,
  reauthenticate,
  beginTotpEnrollment,
  enrollTotp,
  unenrollAllFactors,
  resolverFromError,
  resolveTotpSignIn,
}
