import type { FormEvent } from 'react'
import { Alert } from './Alert'
import { AuthShell } from './AuthShell'
import { Button } from './Button'
import { Divider } from './Divider'
import { ArrowLeftIcon, GithubIcon, GoogleIcon } from './icons'
import { LinkButton } from './LinkButton'
import { TextField } from './TextField'

export type AuthMode = 'login' | 'register' | 'forgot-password'

type AuthFormProps = {
  mode: AuthMode
  email: string
  password: string
  error: string
  success: string
  submitting: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onGoogleAuth: () => void
  onGithubAuth: () => void
  onModeChange: (mode: AuthMode) => void
}

export function AuthForm({
  mode,
  email,
  password,
  error,
  success,
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleAuth,
  onGithubAuth,
  onModeChange,
}: AuthFormProps) {
  const isLogin = mode === 'login'
  const isForgotPassword = mode === 'forgot-password'

  const title = isForgotPassword
    ? 'Forgot password'
    : isLogin
      ? 'Welcome back'
      : 'Create account'

  const description = isForgotPassword
    ? 'Enter your email and we will send a password reset link.'
    : isLogin
      ? 'Sign in with email and password, Google, or GitHub.'
      : 'Register with email and password, Google, or GitHub.'

  const submitLabel = submitting
    ? isForgotPassword
      ? 'Sending…'
      : isLogin
        ? 'Signing in…'
        : 'Creating account…'
    : isForgotPassword
      ? 'Send reset link'
      : isLogin
        ? 'Sign in'
        : 'Register'

  return (
    <AuthShell>
      <div className="grid gap-2 text-center">
        <h1 className="text-[28px] leading-tight">{title}</h1>
        <p className="text-sm leading-6 text-ink-soft">{description}</p>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
        {error ? (
          <Alert status="danger">
            <span className="whitespace-pre-line">{error}</span>
          </Alert>
        ) : null}

        {success ? <Alert status="success">{success}</Alert> : null}

        <TextField
          label="Email"
          required
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />

        {!isForgotPassword ? (
          <TextField
            label="Password"
            labelAction={
              isLogin ? (
                <LinkButton
                  className="text-[13px]"
                  onClick={() => onModeChange('forgot-password')}
                >
                  Forgot password?
                </LinkButton>
              ) : null
            }
            required
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={6}
            placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        ) : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-1"
          loading={submitting}
          disabled={submitting}
        >
          {submitLabel}
        </Button>
      </form>

      {!isForgotPassword ? (
        <>
          <Divider className="my-7">or</Divider>

          <div className="grid gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              disabled={submitting}
              onClick={onGoogleAuth}
            >
              <GoogleIcon />
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              disabled={submitting}
              onClick={onGithubAuth}
            >
              <GithubIcon />
              {isLogin ? 'Continue with GitHub' : 'Sign up with GitHub'}
            </Button>
          </div>
        </>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 border-t border-line pt-6 text-sm text-ink-soft">
        {isForgotPassword ? (
          <LinkButton onClick={() => onModeChange('login')}>
            <ArrowLeftIcon />
            Back to sign in
          </LinkButton>
        ) : isLogin ? (
          <>
            <span>New here?</span>
            <LinkButton onClick={() => onModeChange('register')}>
              Create an account
            </LinkButton>
          </>
        ) : (
          <>
            <span>Already have an account?</span>
            <LinkButton onClick={() => onModeChange('login')}>Sign in</LinkButton>
          </>
        )}
      </div>
    </AuthShell>
  )
}
