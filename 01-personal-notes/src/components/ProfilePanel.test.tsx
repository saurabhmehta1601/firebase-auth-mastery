import { fireEvent, render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { describe, expect, it, vi } from 'vitest'
import { ProfilePanel } from './ProfilePanel'

vi.mock('../lib/firebase/auth', () => ({
  auth: {
    getCurrentUser: vi.fn(),
    sendVerificationEmail: vi.fn(),
    reauthenticate: vi.fn(),
    beginTotpEnrollment: vi.fn(),
    enrollTotp: vi.fn(),
    unenrollAllFactors: vi.fn(),
    resolverFromError: vi.fn(),
    resolveTotpSignIn: vi.fn(),
  },
}))

vi.mock('../lib/firebase/utils', async () => {
  const actual = await vi.importActual<typeof import('../lib/firebase/utils')>(
    '../lib/firebase/utils',
  )
  return {
    ...actual,
    enrolledFactorCount: () => 0,
  }
})

function userWith(signInProvider: string, providerIds: string[]) {
  return {
    email: 'ada@example.com',
    emailVerified: true,
    uid: 'uid-1',
    metadata: {
      creationTime: '2024-01-01T00:00:00.000Z',
      lastSignInTime: '2024-01-02T00:00:00.000Z',
    },
    providerData: providerIds.map((providerId) => ({ providerId })),
    getIdTokenResult: vi.fn(async () => ({ signInProvider })),
  } as unknown as User
}

async function openEnable(user: User) {
  render(<ProfilePanel user={user} />)
  fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
  expect(
    await screen.findByRole('heading', { name: 'Enable two-factor authentication' }),
  ).toBeInTheDocument()
}

describe('two-factor reauthentication step', () => {
  it('asks a Google session to sign in with Google again', async () => {
    await openEnable(userWith('google.com', ['password', 'google.com']))

    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with GitHub' })).not.toBeInTheDocument()
  })

  it('asks a GitHub session to sign in with GitHub again', async () => {
    await openEnable(userWith('github.com', ['password', 'github.com']))

    expect(screen.getByRole('button', { name: 'Sign in with GitHub' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument()
  })

  it('asks an email session for the password', async () => {
    await openEnable(userWith('password', ['password', 'google.com', 'github.com']))

    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with GitHub' })).not.toBeInTheDocument()
  })
})
