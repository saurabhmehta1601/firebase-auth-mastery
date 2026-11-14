import {
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TotpMultiFactorGenerator,
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  linkWithPopup,
  multiFactor,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  verifyPasswordResetCode,
  type MultiFactorResolver,
  type TotpSecret,
  type User,
} from 'firebase/auth'
import { auth as firebaseAuth } from './firebase'
import {
  findTotpFactor,
  getLinkErrorMessage,
  getMfaErrorMessage,
  getPasswordResetErrorMessage,
  getSignInErrorMessage,
  isMultiFactorError,
  linkedProviderIds,
  reauthProviderId,
  type LinkableProviderId,
  type ReauthProviderId,
} from './utils'

export type { LinkableProviderId, ReauthProviderId }
export type AuthProviderId = ReauthProviderId

/** App-facing signed-in user. UI should never need Firebase's User type. */
export type AuthUser = {
  uid: string
  email: string | null
  emailVerified: boolean
  createdAt?: string
  lastSignInAt?: string
  providers: string[]
  enrolledFactorCount: number
  hasPasswordProvider: boolean
}

export type TotpSetup = {
  secretKey: string
  otpauthUrl: string
}

let pendingMfaResolver: MultiFactorResolver | null = null
let pendingTotpSecret: TotpSecret | null = null

function toAuthUser(user: User): AuthUser {
  const providers = linkedProviderIds(user)
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.metadata.creationTime,
    lastSignInAt: user.metadata.lastSignInTime,
    providers,
    enrolledFactorCount: multiFactor(user).enrolledFactors.length,
    hasPasswordProvider: providers.includes('password'),
  }
}

function requireFirebaseUser() {
  const user = firebaseAuth.currentUser
  if (!user) {
    throw new Error('No signed-in user.')
  }
  return user
}

function actionCodeSettings(handleCodeInApp: boolean) {
  return {
    url: window.location.origin,
    handleCodeInApp,
  }
}

function clearMfaChallenge() {
  pendingMfaResolver = null
}

function clearTotpSetup() {
  pendingTotpSecret = null
}

function subscribe(onChange: (user: AuthUser | null) => void) {
  return onAuthStateChanged(firebaseAuth, (user) => {
    onChange(user ? toAuthUser(user) : null)
  })
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
  clearMfaChallenge()
  clearTotpSetup()
  await signOut(firebaseAuth)
}

async function sendVerificationEmail() {
  await sendEmailVerification(requireFirebaseUser(), actionCodeSettings(false))
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

async function getReauthProvider(): Promise<ReauthProviderId | null> {
  const user = requireFirebaseUser()
  const result = await user.getIdTokenResult()
  return reauthProviderId(user, result.signInProvider)
}

async function reauthenticate(providerId: ReauthProviderId, password = '') {
  const user = requireFirebaseUser()

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

async function linkProvider(provider: LinkableProviderId): Promise<AuthUser> {
  const user = requireFirebaseUser()
  if (provider === 'google.com') {
    await linkWithPopup(user, new GoogleAuthProvider())
  } else {
    await linkWithPopup(user, new GithubAuthProvider())
  }
  await user.reload()
  return toAuthUser(user)
}

async function beginTotpSetup(appName: string): Promise<TotpSetup> {
  const user = requireFirebaseUser()
  const session = await multiFactor(user).getSession()
  const secret = await TotpMultiFactorGenerator.generateSecret(session)
  pendingTotpSecret = secret
  return {
    secretKey: secret.secretKey,
    otpauthUrl: secret.generateQrCodeUrl(user.email ?? user.uid, appName),
  }
}

async function enrollTotp(code: string): Promise<AuthUser> {
  const user = requireFirebaseUser()
  if (!pendingTotpSecret) {
    throw new Error('Start authenticator setup again.')
  }
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
    pendingTotpSecret,
    code,
  )
  await multiFactor(user).enroll(assertion, 'Authenticator')
  await user.reload()
  clearTotpSetup()
  return toAuthUser(user)
}

async function unenrollAllFactors(): Promise<AuthUser> {
  const user = requireFirebaseUser()
  const factors = [...multiFactor(user).enrolledFactors]
  for (const factor of factors) {
    await multiFactor(user).unenroll(factor)
  }
  await user.reload()
  return toAuthUser(user)
}

/** Capture an MFA challenge from a sign-in/reauth error. Firebase resolver stays inside this module. */
function captureMfaChallenge(error: unknown): boolean {
  if (!isMultiFactorError(error)) {
    return false
  }
  pendingMfaResolver = getMultiFactorResolver(firebaseAuth, error)
  return true
}

function hasTotpMfaChallenge() {
  return !!pendingMfaResolver && !!findTotpFactor(pendingMfaResolver.hints)
}

function mfaChallengeLabel() {
  if (!pendingMfaResolver) return null
  return findTotpFactor(pendingMfaResolver.hints)?.displayName ?? null
}

async function completeMfaChallenge(code: string) {
  if (!pendingMfaResolver) {
    throw new Error('No multi-factor challenge in progress.')
  }
  const hint = findTotpFactor(pendingMfaResolver.hints)
  if (!hint) {
    throw new Error('This account uses a second factor this app cannot complete.')
  }
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code)
  await pendingMfaResolver.resolveSignIn(assertion)
  clearMfaChallenge()
}

function cancelMfaChallenge() {
  clearMfaChallenge()
}

function cancelTotpSetup() {
  clearTotpSetup()
}

export const auth = {
  subscribe,
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
  getReauthProvider,
  reauthenticate,
  linkProvider,
  beginTotpSetup,
  enrollTotp,
  unenrollAllFactors,
  captureMfaChallenge,
  hasTotpMfaChallenge,
  mfaChallengeLabel,
  completeMfaChallenge,
  cancelMfaChallenge,
  cancelTotpSetup,
  getSignInErrorMessage,
  getMfaErrorMessage,
  getLinkErrorMessage,
  getPasswordResetErrorMessage,
}
