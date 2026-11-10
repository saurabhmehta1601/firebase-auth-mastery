import type { Profile } from '../data/dummy'

type ProfilePanelProps = {
  profile: Profile
}

export function ProfilePanel({ profile }: ProfilePanelProps) {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">Dummy profile data for the current user.</p>
        </div>
      </header>

      <section className="profile-card">
        <dl className="profile-grid">
          <div>
            <dt>Name</dt>
            <dd>{profile.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd className="mono">{profile.userId}</dd>
          </div>
          <div>
            <dt>Joined</dt>
            <dd>{profile.joinedAt}</dd>
          </div>
          <div>
            <dt>Bio</dt>
            <dd>{profile.bio}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
