import { FirebaseError } from 'firebase/app'
import {
  TotpMultiFactorGenerator,
  multiFactor,
  type MultiFactorError,
  type MultiFactorInfo,
  type User,
} from 'firebase/auth'

export type ReauthProviderId = 'password' | 'google.com' | 'github.com'
export type LinkableProviderId = 'google.com' | 'github.com'

export function isMultiFactorError(error: unknown): error is MultiFactorError {
  return error instanceof FirebaseError && error.code === 'auth/multi-factor-auth-required'
}

export function isEmailPasswordUser(user: User) {
  return user.providerData.some((provider) => provider.providerId === 'password')
}

export function linkedProviderIds(user: User): string[] {
  return user.providerData.map((provider) => provider.providerId)
}

function isReauthProviderId(value: string | null | undefined): value is ReauthProviderId {
  return value === 'password' || value === 'google.com' || value === 'github.com'
}

export function reauthProviderId(
  user: User,
  signInProvider?: string | null,
): ReauthProviderId | null {
  if (isReauthProviderId(signInProvider)) {
    return signInProvider
  }

  const ids = user.providerData.map((provider) => provider.providerId)
  if (ids.includes('google.com')) return 'google.com'
  if (ids.includes('github.com')) return 'github.com'
  if (ids.includes('password')) return 'password'
  return null
}

export function enrolledFactorCount(user: User) {
  return multiFactor(user).enrolledFactors.length
}

export function findTotpFactor<T extends Pick<MultiFactorInfo, 'factorId'>>(factors: T[]) {
  return factors.find((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID)
}

export function formatPasswordRequirementsError(message: string): string {
  const match = message.match(/\[([^\]]+)\]/)
  if (!match) {
    return 'Password does not meet the requirements.'
  }

  const requirements = match[1]
    .split(',')
    .map((requirement) => requirement.trim().replace(/^Password\s+/i, ''))
    .filter(Boolean)

  if (requirements.length === 0) {
    return 'Password does not meet the requirements.'
  }

  return `Password does not meet requirements:\n${requirements
    .map((requirement) => `• ${requirement}`)
    .join('\n')}`
}

function providerLabel(providerId: string): string | null {
  switch (providerId) {
    case 'google.com':
      return 'Google sign-in'
    case 'github.com':
      return 'GitHub sign-in'
    case 'password':
      return 'email/password'
    default:
      return null
  }
}

function formatExistingAccountMessage(methods: string[]): string {
  const labels = methods
    .map(providerLabel)
    .filter((label): label is string => label !== null)

  if (labels.length === 1) {
    return `An account already exists with this email using ${labels[0]}.`
  }

  if (labels.length > 1) {
    return `An account already exists with this email using ${labels.join(' or ')}.`
  }

  return 'An account already exists with this email.'
}

/** Providers already linked to this email, from the failed signInWithIdp response. */
function verifiedProvidersFromError(error: FirebaseError): string[] {
  const tokenResponse = (
    error.customData as { _tokenResponse?: Record<string, unknown> } | undefined
  )?._tokenResponse
  if (!tokenResponse) {
    return []
  }

  const raw =
    tokenResponse.verifiedProvider ?? tokenResponse.verifiedProviders ?? []
  return Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === 'string')
    : []
}

function messageForExistingAccount(error: FirebaseError): string {
  return formatExistingAccountMessage(verifiedProvidersFromError(error))
}

export function getSignInErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
    case 'auth/account-exists-with-different-credential':
      return messageForExistingAccount(error)
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/password-does-not-meet-requirements':
      return formatPasswordRequirementsError(error.message)
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.'
    case 'auth/user-disabled':
      return 'Account temporarily disabled.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Allow pop-ups and try again.'
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled yet.'
    case 'auth/invalid-verification-code':
    case 'auth/code-expired':
      return 'That code is invalid or expired. Enter the current code from your authenticator app.'
    default:
      return error.message
  }
}

export function getMfaErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : 'Could not update two-factor authentication.'
  }

  switch (error.code) {
    case 'auth/requires-recent-login':
      return 'Confirm your identity again, then retry.'
    case 'auth/unverified-email':
      return 'Verify your email before enabling two-factor authentication.'
    case 'auth/invalid-verification-code':
      return 'That code is invalid or expired. Enter the current code from your authenticator app.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect password.'
    case 'auth/operation-not-allowed':
      return 'Two-factor authentication is not enabled for this Firebase project yet.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Allow pop-ups and try again.'
    case 'auth/multi-factor-auth-required':
      return 'Enter the code from your authenticator app to continue.'
    default:
      return error.message
  }
}

export function getLinkErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : 'Could not link that sign-in method.'
  }

  switch (error.code) {
    case 'auth/credential-already-in-use':
    case 'auth/email-already-in-use':
      return 'That sign-in method is already used by another account.'
    case 'auth/provider-already-linked':
      return 'That sign-in method is already linked to this account.'
    case 'auth/requires-recent-login':
      return 'Confirm your identity again, then retry linking.'
    case 'auth/popup-closed-by-user':
      return 'Linking was cancelled.'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Allow pop-ups and try again.'
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled yet.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.'
    default:
      return error.message
  }
}

export function getPasswordResetErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/expired-action-code':
      return 'This reset link has expired. Request a new one from the sign-in page.'
    case 'auth/invalid-action-code':
      return 'This reset link is invalid or has already been used.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/password-does-not-meet-requirements':
      return formatPasswordRequirementsError(error.message)
    default:
      return error.message
  }
}
