# Firebase Auth System

## Features

### Authentication providers

- Sign in with email and password
- Sign up with email and password
- Sign in with Google
- Sign in with GitHub

### Password recovery

- Forgot-password flow that sends a reset email
- In-app password reset page (from the email link)
- Clear validation for password requirements and confirmation matching

### Email verification

- Send verification email from profile or from an in-app banner
- Dedicated verify-email page that completes verification from the email link
- Verified / not-verified status shown on the profile

### Multi-factor authentication (MFA)

- Enable TOTP (authenticator app) with QR code and manual setup key
- MFA challenge on sign-in (email/password, Google, or GitHub)
- Disable MFA with reauthentication (and authenticator code when required)
- Email must be verified before MFA can be enabled

### Account linking

- Link Google to an existing account
- Link GitHub to an existing account
- Profile view of which sign-in methods are linked

### Session and access control

- Persistent auth state with a loading screen while the session is restored
- Signed-out users see the auth screens; signed-in users enter the app
- Sign out from the app sidebar
- Email action links (reset password / verify email) work even when logged out

### Profile

- View email, verification status, account created time, and last sign-in
- Manage linked providers and two-factor authentication from one place

### Security and UX

- Reauthentication before sensitive MFA changes
- Friendly, user-facing error messages for common Firebase Auth failures
- Loading and disabled states on auth and profile actions
- Accessible form patterns (alerts, MFA step indicators, focus styles)

## Architecture

This system is built on **Firebase Authentication**. The React app talks to Firebase through the Web SDK; Firebase owns user identity, sessions, and the security settings below.

### Sign-in providers

Enabled and used in the app:

| Provider | How it is used |
| -------- | -------------- |
| Email / password | Register, sign in, password reset |
| Google | OAuth popup sign-in and account linking |
| GitHub | OAuth popup sign-in and account linking |

### Firebase Auth capabilities in use

- **User accounts** — each signed-in user has a Firebase `uid`, email, verification status, and metadata (created / last sign-in)
- **Email verification** — Firebase sends verification emails; the app completes them with action codes
- **Password reset** — Firebase sends reset emails; the app verifies the code and sets a new password in-app
- **Multi-factor authentication (TOTP)** — authenticator-app second factor, enrolled and challenged through Firebase MFA APIs
- **Account linking** — Google / GitHub can be linked onto an existing user so one account supports multiple sign-in methods
- **Reauthentication** — required before sensitive MFA changes
- **Auth state** — `onAuthStateChanged` drives session restore, signed-in / signed-out routing, and sign-out

### Password policy

Firebase Auth password policy is enabled for email/password accounts. New passwords must satisfy the project’s strength rules, including:

- At least one lowercase character
- At least one uppercase character
- At least one numeric character
- At least one non-alphanumeric (special) character

If a password fails the policy, Firebase returns `auth/password-does-not-meet-requirements`, and the app surfaces the missing requirements to the user.

## Infrastructure Cost Estimation

Most Firebase services used by this project sit inside the [Spark (free) plan](https://firebase.google.com/pricing) limits.

| Service | Used for | Free-tier coverage |
| ------- | -------- | ------------------ |
| Firebase Authentication | Sign-in providers, email verification, password reset, MFA, account linking | Covered on the free plan for the current usage |
| Firebase Hosting | Serving the web app | Covered on the free plan for the current usage |

At the moment, this project does not use any Firebase product that requires a paid plan. Costs stay at **$0** while traffic and usage remain within free-tier quotas.

## Tech stack

| Layer | Choice |
| ----- | ------ |
| UI | React |
| Language | TypeScript |
| Auth & backend services | [Firebase Web SDK](https://firebase.google.com/docs/web/setup) (Auth, Firestore, and related APIs) |
| Tooling | Vite (or equivalent) per project, plus the Firebase Console / CLI as needed |

Every project in this repo follows this stack unless a project README says otherwise.

---
