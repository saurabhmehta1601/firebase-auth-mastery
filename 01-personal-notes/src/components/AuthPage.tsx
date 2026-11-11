import { useState, type FormEvent } from 'react'
import { FirebaseError } from 'firebase/app'
import { useAuth } from '../context/AuthContext'
import { AuthForm, type AuthMode } from './ui'

function formatPasswordRequirementsError(message: string): string {
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

function getErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
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
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.'
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled yet.'
    default:
      return error.message
  }
}

export function AuthPage() {
  const { login, register, loginWithGoogle, loginWithGithub } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleAuth() {
    setError('')
    setSubmitting(true)

    try {
      await loginWithGoogle()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGithubAuth() {
    setError('')
    setSubmitting(true)

    try {
      await loginWithGithub()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthForm
      mode={mode}
      email={email}
      password={password}
      error={error}
      submitting={submitting}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onGoogleAuth={handleGoogleAuth}
      onGithubAuth={handleGithubAuth}
      onModeChange={(nextMode) => {
        setMode(nextMode)
        setError('')
      }}
    />
  )
}
