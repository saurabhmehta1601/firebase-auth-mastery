import type { FormEvent } from 'react'
import {
  Alert,
  Button,
  Card,
  Input,
  Label,
  Separator,
  TextField,
} from '@heroui/react'
import { GithubIcon, GoogleIcon } from './icons'

export type AuthMode = 'login' | 'register'

type AuthFormProps = {
  mode: AuthMode
  email: string
  password: string
  error: string
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
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleAuth,
  onGithubAuth,
  onModeChange,
}: AuthFormProps) {
  const isLogin = mode === 'login'

  return (
    <div className="grid min-h-svh place-items-center p-6">
      <Card className="w-full max-w-[420px]">
        <Card.Header className="gap-1">
          <h1 className="text-3xl">{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <Card.Description>
            {isLogin
              ? 'Sign in with email and password, Google, or GitHub.'
              : 'Register with email and password, Google, or GitHub.'}
          </Card.Description>
        </Card.Header>

        <form className="contents" onSubmit={onSubmit}>
          <Card.Content>
            <div className="grid gap-4">
              {error ? (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description className="whitespace-pre-line">
                      {error}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}

              <TextField
                isRequired
                fullWidth
                variant="secondary"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={onEmailChange}
              >
                <Label>Email</Label>
                <Input />
              </TextField>

              <TextField
                isRequired
                fullWidth
                variant="secondary"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={6}
                value={password}
                onChange={onPasswordChange}
              >
                <Label>Password</Label>
                <Input />
              </TextField>

              <Button type="submit" fullWidth isDisabled={submitting}>
                {submitting
                  ? isLogin
                    ? 'Signing in…'
                    : 'Creating account…'
                  : isLogin
                    ? 'Sign in'
                    : 'Register'}
              </Button>

              <div className="flex items-center gap-3 text-sm text-muted">
                <Separator className="flex-1" />
                <span>or</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid gap-2">
                <Button
                  variant="tertiary"
                  fullWidth
                  isDisabled={submitting}
                  onPress={onGoogleAuth}
                >
                  <GoogleIcon />
                  {isLogin ? 'Continue with Google' : 'Sign up with Google'}
                </Button>

                <Button
                  variant="tertiary"
                  fullWidth
                  isDisabled={submitting}
                  onPress={onGithubAuth}
                >
                  <GithubIcon />
                  {isLogin ? 'Continue with GitHub' : 'Sign up with GitHub'}
                </Button>
              </div>

              <div className="flex justify-center">
                {isLogin ? (
                  <Button variant="ghost" onPress={() => onModeChange('register')}>
                    Create an account
                  </Button>
                ) : (
                  <Button variant="ghost" onPress={() => onModeChange('login')}>
                    Already have an account? Sign in
                  </Button>
                )}
              </div>
            </div>
          </Card.Content>
        </form>
      </Card>
    </div>
  )
}
