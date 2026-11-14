import { useState, type FormEvent, type ReactNode } from 'react'
import { toDataURL } from 'qrcode'
import {
  auth,
  type AuthUser,
  type LinkableProviderId,
  type ReauthProviderId,
} from '../lib/firebase/auth'
import { Alert, Badge, Button, Card, GithubIcon, GoogleIcon, PageHeader, TextField } from './ui'
import { cn } from './ui/cn'

const LINKABLE_PROVIDERS: {
  id: LinkableProviderId
  label: string
  linkLabel: string
  Icon: typeof GoogleIcon
}[] = [
  { id: 'google.com', label: 'Google', linkLabel: 'Link Google', Icon: GoogleIcon },
  { id: 'github.com', label: 'GitHub', linkLabel: 'Link GitHub', Icon: GithubIcon },
]

type ProfilePanelProps = {
  user: AuthUser
}

type MfaFlow =
  | { mode: 'idle' }
  | { mode: 'enable'; step: 'reauth' | 'device' }
  | { mode: 'disable'; step: 'reauth' | 'code' }

function ProfileRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 px-6 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-6">
      <dt className="text-[13px] font-semibold text-muted">{label}</dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  )
}

function formatProfileDateTime(value?: string) {
  if (!value) return 'Unknown'

  const date = new Date(value)
  const day = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${day}, ${time}`
}

function reauthPrompt(providerId: ReauthProviderId, purpose: 'enable' | 'disable') {
  if (purpose === 'disable') {
    if (providerId === 'password') {
      return 'Enter your password to confirm it is you before turning off two-factor authentication.'
    }
    if (providerId === 'google.com') {
      return 'Sign in with Google again to confirm it is you before turning off two-factor authentication.'
    }
    return 'Sign in with GitHub again to confirm it is you before turning off two-factor authentication.'
  }

  if (providerId === 'password') {
    return 'Enter your password to confirm it is you. After this, you can add an authenticator app.'
  }
  if (providerId === 'google.com') {
    return 'Sign in with Google again to confirm it is you. After this, you can add an authenticator app.'
  }
  return 'Sign in with GitHub again to confirm it is you. After this, you can add an authenticator app.'
}

function SetupSteps({ step }: { step: 'reauth' | 'device' }) {
  const steps = [
    { id: 'reauth', label: 'Confirm your identity' },
    { id: 'device', label: 'Add authenticator' },
  ] as const
  const currentIndex = step === 'reauth' ? 0 : 1

  return (
    <ol className="grid gap-2 sm:grid-cols-2">
      {steps.map((item, index) => {
        const complete = index < currentIndex
        const current = index === currentIndex
        return (
          <li
            key={item.id}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5',
              current ? 'border-accent/40 bg-accent-soft' : 'border-line bg-paper',
            )}
          >
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                complete || current ? 'bg-accent text-white' : 'bg-line text-ink-soft',
              )}
            >
              {complete ? '✓' : index + 1}
            </span>
            <span className={cn('text-[13px] font-semibold', current ? 'text-ink' : 'text-ink-soft')}>
              {item.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ReauthActions({
  providerId,
  password,
  onPasswordChange,
  working,
  continueLabel,
  workingLabel,
  onContinue,
  onCancel,
}: {
  providerId: ReauthProviderId
  password: string
  onPasswordChange: (value: string) => void
  working: boolean
  continueLabel: string
  workingLabel: string
  onContinue: () => void
  onCancel: () => void
}) {
  if (providerId === 'password') {
    return (
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          onContinue()
        }}
      >
        <TextField
          label="Password"
          required
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={working} disabled={working}>
            {working ? workingLabel : continueLabel}
          </Button>
          <Button variant="secondary" disabled={working} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  const isGoogle = providerId === 'google.com'

  return (
    <div className="flex flex-wrap gap-3">
      <Button loading={working} disabled={working} onClick={onContinue}>
        {isGoogle ? <GoogleIcon /> : <GithubIcon />}
        {working ? workingLabel : isGoogle ? 'Sign in with Google' : 'Sign in with GitHub'}
      </Button>
      <Button variant="secondary" disabled={working} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export function ProfilePanel({ user }: ProfilePanelProps) {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [flow, setFlow] = useState<MfaFlow>({ mode: 'idle' })
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [totpSecretKey, setTotpSecretKey] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [working, setWorking] = useState(false)
  const [linkingProvider, setLinkingProvider] = useState<LinkableProviderId | null>(null)
  const [providerId, setProviderId] = useState<ReauthProviderId | null>(null)
  const [enrolledCount, setEnrolledCount] = useState(() => user.enrolledFactorCount)
  const [providers, setProviders] = useState(() => user.providers)

  const createdAt = formatProfileDateTime(user.createdAt)
  const lastSignIn = formatProfileDateTime(user.lastSignInAt)
  const mfaEnabled = enrolledCount > 0
  const passwordLinked = providers.includes('password')

  function resetFlow() {
    auth.cancelMfaChallenge()
    auth.cancelTotpSetup()
    setFlow({ mode: 'idle' })
    setProviderId(null)
    setPassword('')
    setVerificationCode('')
    setTotpSecretKey('')
    setQrDataUrl('')
  }

  async function handleSendVerification() {
    setMessage('')
    setError('')
    setSending(true)

    try {
      await auth.sendVerificationEmail()
      setMessage('Verification email sent. Check your inbox.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not send verification email.',
      )
    } finally {
      setSending(false)
    }
  }

  async function startEnable() {
    setMessage('')
    setError('')

    if (!user.emailVerified) {
      setError('Verify your email before enabling two-factor authentication.')
      return
    }

    setWorking(true)
    try {
      const nextProvider = await auth.getReauthProvider()
      if (!nextProvider) {
        setError('Sign in with email, Google, or GitHub to enable two-factor authentication.')
        return
      }

      setPassword('')
      setProviderId(nextProvider)
      setFlow({ mode: 'enable', step: 'reauth' })
    } catch (err) {
      setError(auth.getMfaErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  async function startDisable() {
    setMessage('')
    setError('')
    setWorking(true)

    try {
      const nextProvider = await auth.getReauthProvider()
      if (!nextProvider) {
        setError('Sign in with email, Google, or GitHub to turn off two-factor authentication.')
        return
      }

      setPassword('')
      setVerificationCode('')
      setProviderId(nextProvider)
      setFlow({ mode: 'disable', step: 'reauth' })
    } catch (err) {
      setError(auth.getMfaErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  async function handleEnableReauth() {
    if (!providerId) {
      setError('Sign in with email, Google, or GitHub to enable two-factor authentication.')
      return
    }

    setMessage('')
    setError('')
    setWorking(true)

    try {
      await auth.reauthenticate(providerId, password)
      const setup = await auth.beginTotpSetup('AI Notetaker')
      const qrUrl = await toDataURL(setup.otpauthUrl, { margin: 1, width: 196 })

      setTotpSecretKey(setup.secretKey)
      setQrDataUrl(qrUrl)
      setVerificationCode('')
      setPassword('')
      setFlow({ mode: 'enable', step: 'device' })
    } catch (err) {
      setError(auth.getMfaErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  async function handleDisableReauth() {
    if (!providerId) {
      setError('Sign in with email, Google, or GitHub to turn off two-factor authentication.')
      return
    }

    setMessage('')
    setError('')
    setWorking(true)

    try {
      await auth.reauthenticate(providerId, password)
      const nextUser = await auth.unenrollAllFactors()
      setEnrolledCount(nextUser.enrolledFactorCount)
      resetFlow()
      setMessage('Two-factor authentication is off.')
    } catch (err) {
      if (auth.captureMfaChallenge(err)) {
        setVerificationCode('')
        setPassword('')
        setFlow({ mode: 'disable', step: 'code' })
        return
      }
      setError(auth.getMfaErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  async function handleDisableCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auth.hasTotpMfaChallenge()) {
      setError('This account uses a second factor this app cannot complete.')
      return
    }

    setMessage('')
    setError('')
    setWorking(true)

    try {
      await auth.completeMfaChallenge(verificationCode.trim())
      const nextUser = await auth.unenrollAllFactors()
      setEnrolledCount(nextUser.enrolledFactorCount)
      resetFlow()
      setMessage('Two-factor authentication is off.')
    } catch (err) {
      setError(auth.getMfaErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  async function handleEnroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!totpSecretKey) {
      setError('Start authenticator setup again.')
      return
    }

    setMessage('')
    setError('')
    setWorking(true)

    try {
      const nextUser = await auth.enrollTotp(verificationCode.trim())
      setEnrolledCount(nextUser.enrolledFactorCount)
      resetFlow()
      setMessage(
        'Two-factor authentication is on. You will be asked for a code the next time you sign in.',
      )
    } catch (err) {
      setError(auth.getMfaErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  async function copySecret() {
    if (!totpSecretKey) return

    try {
      await navigator.clipboard.writeText(totpSecretKey)
      setMessage('Setup key copied.')
      setError('')
    } catch {
      setError('Could not copy the setup key. Select it and copy it manually.')
    }
  }

  async function handleLinkProvider(provider: LinkableProviderId) {
    setMessage('')
    setError('')
    setLinkingProvider(provider)

    try {
      const nextUser = await auth.linkProvider(provider)
      setProviders(nextUser.providers)
      setMessage(
        provider === 'google.com'
          ? 'Google is linked. You can sign in with Google next time.'
          : 'GitHub is linked. You can sign in with GitHub next time.',
      )
    } catch (err) {
      setError(auth.getLinkErrorMessage(err))
    } finally {
      setLinkingProvider(null)
    }
  }

  return (
    <div className="grid w-full max-w-3xl animate-rise gap-8">
      <PageHeader title="Profile" description="Your Firebase Auth user information." />

      {error || message ? (
        <div className="grid gap-3">
          {error ? <Alert status="danger">{error}</Alert> : null}
          {message ? <Alert status="success">{message}</Alert> : null}
        </div>
      ) : null}

      <Card>
        <dl className="divide-y divide-line">
          <ProfileRow label="Email">{user.email}</ProfileRow>
          <ProfileRow label="Email verified">
            <span className="flex flex-wrap items-center gap-3">
              <Badge tone={user.emailVerified ? 'success' : 'warning'}>
                {user.emailVerified ? 'Verified' : 'Not verified'}
              </Badge>
              {!user.emailVerified ? (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={sending}
                  disabled={sending}
                  onClick={handleSendVerification}
                >
                  {sending ? 'Sending…' : 'Send Verification Email'}
                </Button>
              ) : null}
            </span>
          </ProfileRow>
          <ProfileRow label="Account created">{createdAt}</ProfileRow>
          <ProfileRow label="Last sign-in">{lastSignIn}</ProfileRow>
        </dl>
      </Card>

      <Card className="grid gap-5 p-6">
        <div className="grid gap-1.5">
          <h2 className="text-xl">Sign-in methods</h2>
          <p className="text-sm leading-6 text-ink-soft">
            Link Google or GitHub to this account so you can sign in with any connected method.
          </p>
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line">
          <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
            <span className="text-[15px] font-medium text-ink">Email/password</span>
            <Badge tone={passwordLinked ? 'success' : 'warning'}>
              {passwordLinked ? 'Linked' : 'Not linked'}
            </Badge>
          </li>
          {LINKABLE_PROVIDERS.map(({ id, label, linkLabel, Icon }) => {
            const linked = providers.includes(id)
            const busy = linkingProvider === id
            return (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
              >
                <span className="flex items-center gap-2.5 text-[15px] font-medium text-ink">
                  <Icon />
                  {label}
                </span>
                {linked ? (
                  <Badge tone="success">Linked</Badge>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy}
                    disabled={linkingProvider !== null || working}
                    onClick={() => void handleLinkProvider(id)}
                  >
                    <Icon />
                    {busy ? 'Linking…' : linkLabel}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card className="grid gap-5 p-6">
        <div className="grid gap-1.5">
          <h2 className="text-xl">Two-factor authentication</h2>
          <p className="text-sm leading-6 text-ink-soft">
            Add an authenticator app so signing in requires a one-time code as well as your password
            or linked provider.
          </p>
        </div>

        {flow.mode === 'idle' ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5">
            <span className="flex flex-wrap items-center gap-3">
              <span className="text-[15px] font-medium text-ink">Authenticator app</span>
              <Badge tone={mfaEnabled ? 'success' : 'warning'}>
                {mfaEnabled ? 'Enabled' : 'Not enabled'}
              </Badge>
            </span>
            {mfaEnabled ? (
              <Button variant="secondary" size="sm" disabled={working} onClick={startDisable}>
                Disable
              </Button>
            ) : user.emailVerified ? (
              <Button variant="secondary" size="sm" disabled={working} onClick={startEnable}>
                Enable
              </Button>
            ) : (
              <span className="text-[13px] text-muted">Verify your email to enable this.</span>
            )}
          </div>
        ) : null}

        {flow.mode === 'enable' && providerId ? (
          <div className="grid gap-5">
            <div className="grid gap-1.5">
              <h3 className="text-lg font-semibold text-ink">Enable two-factor authentication</h3>
              <p className="text-sm leading-6 text-ink-soft">
                {flow.step === 'reauth'
                  ? reauthPrompt(providerId, 'enable')
                  : 'Scan the QR code with your authenticator app, or enter the setup key manually. Then enter the 6-digit code the app shows.'}
              </p>
            </div>
            <SetupSteps step={flow.step} />
            {flow.step === 'reauth' ? (
              <ReauthActions
                providerId={providerId}
                password={password}
                onPasswordChange={setPassword}
                working={working}
                continueLabel="Continue"
                workingLabel="Confirming…"
                onContinue={() => void handleEnableReauth()}
                onCancel={resetFlow}
              />
            ) : totpSecretKey ? (
              <>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Authenticator setup QR code"
                    className="size-48 rounded-xl border border-line bg-white p-2"
                  />
                ) : null}
                <div className="grid gap-2">
                  <p className="text-[13px] font-semibold text-ink">Setup key</p>
                  <p className="font-mono text-[13px] break-all text-ink-soft">{totpSecretKey}</p>
                  <div>
                    <Button variant="secondary" size="sm" onClick={() => void copySecret()}>
                      Copy key
                    </Button>
                  </div>
                </div>
                <form className="grid gap-5" onSubmit={handleEnroll}>
                  <TextField
                    label="Authenticator code"
                    required
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" loading={working} disabled={working}>
                      {working ? 'Enabling…' : 'Enable two-factor authentication'}
                    </Button>
                    <Button variant="secondary" disabled={working} onClick={resetFlow}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        ) : null}

        {flow.mode === 'disable' && providerId ? (
          <div className="grid gap-5">
            <div className="grid gap-1.5">
              <h3 className="text-lg font-semibold text-ink">Turn off two-factor authentication</h3>
              <p className="text-sm leading-6 text-ink-soft">
                {flow.step === 'code'
                  ? 'Enter the code from your authenticator app to confirm it is you.'
                  : reauthPrompt(providerId, 'disable')}
              </p>
            </div>
            {flow.step === 'reauth' ? (
              <ReauthActions
                providerId={providerId}
                password={password}
                onPasswordChange={setPassword}
                working={working}
                continueLabel="Continue"
                workingLabel="Confirming…"
                onContinue={() => void handleDisableReauth()}
                onCancel={resetFlow}
              />
            ) : (
              <form className="grid gap-5" onSubmit={handleDisableCode}>
                <TextField
                  label="Authenticator code"
                  required
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(event) =>
                    setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={working} disabled={working}>
                    {working ? 'Turning off…' : 'Turn off'}
                  </Button>
                  <Button variant="secondary" disabled={working} onClick={resetFlow}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  )
}
