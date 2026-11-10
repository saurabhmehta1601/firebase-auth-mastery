# Firebase Auth Mastery

A hands-on curriculum for learning **Firebase Authentication** and **Authorization** in React web apps — from first login form to production-ready access control.

This repository is a collection of progressive projects built with **React**, **TypeScript**, and the **Firebase Web SDK**. Each one builds on the last, so you can start at the beginning or jump to the level that matches where you are.

---

## Why this exists

Most Firebase tutorials stop at “sign in with Google.” Real apps need more: protected routes, role-based access, secure session handling, and rules that keep data safe even when the client is compromised.

This repo walks that path in small, focused React projects so you learn by building — not by reading another wall of docs.

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| UI | React |
| Language | TypeScript |
| Auth & backend services | [Firebase Web SDK](https://firebase.google.com/docs/web/setup) (Auth, Firestore, and related APIs) |
| Tooling | Vite (or equivalent) per project, plus the Firebase Console / CLI as needed |

Every project in this repo follows this stack unless a project README says otherwise.

---

## What you will learn

- Email/password and social sign-in with the Firebase Web SDK
- Auth state in React (`onAuthStateChanged`, context/hooks patterns)
- Session persistence, sign-out, and typed user state
- Protecting client routes and UI based on auth status
- Custom claims and role-based authorization
- Firestore Security Rules that enforce who can read and write
- Patterns that keep secrets off the client and trust the server (or rules) instead

---

## Learning path

Projects are ordered from beginner to advanced. Complete them in sequence for the best experience.

| Level | Project | Focus |
| ----- | ------- | ----- |
| 01 · Beginner | Email & password auth | Sign up, sign in, sign out, auth state |
| 02 · Beginner | Social providers | Google (and other) OAuth sign-in |
| 03 · Intermediate | Protected routes | Client-side guards and redirects |
| 04 · Intermediate | User profiles | Storing profile data securely in Firestore |
| 05 · Intermediate | Security Rules basics | Read/write rules tied to `request.auth` |
| 06 · Advanced | Roles & custom claims | Admin vs member access patterns |
| 07 · Advanced | Production auth patterns | Token refresh, error handling, hardening |

> Project folders will land under this repo as they are added. Each project includes its own README with setup steps and learning goals.

---

## Repository structure

```text
firebase-auth-mastery/
├── README.md                 # You are here
├── 01-email-password/        # Beginner
├── 02-social-providers/      # Beginner
├── 03-protected-routes/      # Intermediate
├── 04-user-profiles/         # Intermediate
├── 05-security-rules/        # Intermediate
├── 06-roles-claims/          # Advanced
└── 07-production-patterns/   # Advanced
```

Exact folder names may evolve; the numbering and difficulty order stay the same.

---

## Prerequisites

- Comfortable with React fundamentals (components, props, state, hooks)
- Basic TypeScript (types, interfaces; generics help but are not required on day one)
- Node.js installed locally
- A free [Firebase](https://firebase.google.com/) project
- Willingness to use the Firebase Console and (later) the Firebase CLI

No prior Firebase experience is required for Project 01.

---

## How to use this repo

1. Clone the repository.
2. Open the project folder for your current level.
3. Follow that project’s README for install, env setup, and Firebase Console steps.
4. Build and break things — then harden them with the patterns in the next project.

Never commit API keys meant for private use, service account files, or `.env` files with secrets. Prefer Firebase web config that is safe to expose client-side, and keep privileged credentials out of the repo.

---

## Security mindset

Firebase Auth identifies *who* a user is. Authorization decides *what* they can do.

- Treat the client as untrusted.
- Enforce access in **Security Rules** (and/or your backend), not only in the UI.
- Prefer least privilege: grant only the access each role needs.
- Validate tokens and claims on every sensitive operation.

Each project calls out the security lesson it is meant to teach.

---

## Contributing

Issues and pull requests that improve clarity, fix bugs, or add well-scoped exercises are welcome. Keep new material aligned with the beginner → advanced path and include a short project README when adding a new folder.

---

## License

MIT — free to use for learning and teaching.
