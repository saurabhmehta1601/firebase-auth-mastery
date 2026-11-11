import { fireEvent, render, screen } from '@testing-library/react'
import type { FormEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthForm, type AuthMode } from './AuthForm'

type AuthFormProps = {
  mode?: AuthMode
  email?: string
  password?: string
  error?: string
  submitting?: boolean
}

function renderAuthForm({
  mode = 'login',
  email = '',
  password = '',
  error = '',
  submitting = false,
}: AuthFormProps = {}) {
  const props = {
    mode,
    email,
    password,
    error,
    submitting,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
    }),
    onGoogleAuth: vi.fn(),
    onGithubAuth: vi.fn(),
    onModeChange: vi.fn(),
  }

  render(<AuthForm {...props} />)
  return props
}

describe('AuthForm', () => {
  it('renders the sign-in form and reports field changes', () => {
    const props = renderAuthForm({ email: 'ada@example.com', password: 'secret' })

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(
      screen.getByText('Sign in with email and password, Google, or GitHub.'),
    ).toBeInTheDocument()

    const email = screen.getByLabelText('Email')
    const password = screen.getByLabelText('Password')
    expect(email).toHaveValue('ada@example.com')
    expect(email).toHaveAttribute('autocomplete', 'email')
    expect(password).toHaveValue('secret')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
    expect(password).toHaveAttribute('minLength', '6')

    fireEvent.change(email, { target: { value: 'grace@example.com' } })
    fireEvent.change(password, { target: { value: 'longer-secret' } })

    expect(props.onEmailChange).toHaveBeenCalledWith('grace@example.com')
    expect(props.onPasswordChange).toHaveBeenCalledWith('longer-secret')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeEnabled()
  })

  it('submits the form and starts provider sign-in', () => {
    const props = renderAuthForm({
      email: 'ada@example.com',
      password: 'secret',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue with GitHub' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }))

    expect(props.onSubmit).toHaveBeenCalledOnce()
    expect(props.onGoogleAuth).toHaveBeenCalledOnce()
    expect(props.onGithubAuth).toHaveBeenCalledOnce()
    expect(props.onModeChange).toHaveBeenCalledWith('register')
  })

  it('shows the error and disables actions while a sign-in is in progress', () => {
    renderAuthForm({ error: 'Incorrect email or password.', submitting: true })

    expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeDisabled()
  })

  it('renders the registration form and switches back to sign-in', () => {
    const props = renderAuthForm({ mode: 'register', submitting: true })

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    expect(
      screen.getByText('Register with email and password, Google, or GitHub.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Sign up with GitHub' })).toBeDisabled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Already have an account? Sign in' }),
    )
    expect(props.onModeChange).toHaveBeenCalledWith('login')
  })
})
