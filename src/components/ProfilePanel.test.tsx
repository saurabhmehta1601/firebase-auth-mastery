import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { auth, type AuthUser } from '../lib/firebase/auth'
import { ProfilePanel } from './ProfilePanel'

vi.mock('../lib/firebase/auth', () => ({
  auth: {
    sendVerificationEmail: vi.fn(),
    getReauthProvider: vi.fn(),
    reauthenticate: vi.fn(),
    linkProvider: vi.fn(),
    beginTotpSetup: vi.fn(),
    enrollTotp: vi.fn(),
    unenrollAllFactors: vi.fn(),
    captureMfaChallenge: vi.fn(),
    hasTotpMfaChallenge: vi.fn(),
    completeMfaChallenge: vi.fn(),
    cancelMfaChallenge: vi.fn(),
    cancelTotpSetup: vi.fn(),
    getMfaErrorMessage: vi.fn((err: unknown) =>
      err instanceof Error ? err.message : 'MFA error',
    ),
    getLinkErrorMessage: vi.fn((err: unknown) =>
      err instanceof Error ? err.message : 'Link error',
    ),
  },
}))

function userWith(providers: string[]): AuthUser {
  return {
    uid: 'uid-1',
    email: 'ada@example.com',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastSignInAt: '2024-01-02T00:00:00.000Z',
    providers,
    enrolledFactorCount: 0,
    hasPasswordProvider: providers.includes('password'),
  }
}

async function openEnable(user: AuthUser, reauthProvider: 'password' | 'google.com' | 'github.com') {
  vi.mocked(auth.getReauthProvider).mockResolvedValue(reauthProvider)
  render(<ProfilePanel user={user} />)
  fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
  expect(
    await screen.findByRole('heading', { name: 'Enable two-factor authentication' }),
  ).toBeInTheDocument()
}

describe('two-factor reauthentication step', () => {
  it('asks a Google session to sign in with Google again', async () => {
    await openEnable(userWith(['password', 'google.com']), 'google.com')

    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with GitHub' })).not.toBeInTheDocument()
  })

  it('asks a GitHub session to sign in with GitHub again', async () => {
    await openEnable(userWith(['password', 'github.com']), 'github.com')

    expect(screen.getByRole('button', { name: 'Sign in with GitHub' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument()
  })

  it('asks an email session for the password', async () => {
    await openEnable(userWith(['password', 'google.com', 'github.com']), 'password')

    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with GitHub' })).not.toBeInTheDocument()
  })
})

describe('sign-in method linking', () => {
  it('shows link actions for providers that are not connected yet', () => {
    render(<ProfilePanel user={userWith(['password'])} />)

    expect(screen.getByRole('heading', { name: 'Sign-in methods' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link Google' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link GitHub' })).toBeInTheDocument()
    expect(screen.getAllByText('Linked')).toHaveLength(1)
  })

  it('marks already-linked providers without offering another link action', () => {
    render(<ProfilePanel user={userWith(['password', 'google.com'])} />)

    expect(screen.queryByRole('button', { name: 'Link Google' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link GitHub' })).toBeInTheDocument()
    expect(screen.getAllByText('Linked')).toHaveLength(2)
  })
})
