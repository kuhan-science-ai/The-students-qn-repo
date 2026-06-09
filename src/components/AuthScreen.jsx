import React, { useState } from 'react';
import { GraduationCap, UserRound, ShieldCheck } from 'lucide-react';
import { isFirebaseConfigured, signInWithGoogle } from '../utils/firebaseAuth';

export default function AuthScreen({ onSignIn }) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSigningIn(true);

    try {
      const user = await signInWithGoogle();
      onSignIn(user);
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setAuthError('Google sign-in failed. Check Firebase setup and authorized domains.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestSignIn = () => {
    onSignIn({
      provider: 'guest',
      name: 'Guest Student',
      email: '',
      picture: '',
      signedInAt: new Date().toISOString()
    });
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel glass-panel">
        <div className="auth-brand">
          <div className="auth-logo">
            <GraduationCap size={34} />
          </div>
          <div>
            <p className="auth-kicker">StudySpace</p>
            <h1>Sign in to your study hub</h1>
          </div>
        </div>

        <div className="auth-actions">
          <button
            className={`auth-button ${isFirebaseConfigured ? 'auth-button-google' : 'auth-button-muted'}`}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!isFirebaseConfigured || isSigningIn}
          >
            <ShieldCheck size={19} />
            {isFirebaseConfigured
              ? (isSigningIn ? 'Opening Google...' : 'Continue with Google')
              : 'Firebase Google sign-in needs setup'}
          </button>

          {!isFirebaseConfigured && (
            <p className="auth-warning">
              <ShieldCheck size={19} />
              Add Firebase env variables in Render to enable real Google login.
            </p>
          )}

          <button className="auth-button auth-button-primary" type="button" onClick={handleGuestSignIn}>
            <UserRound size={19} />
            Continue as guest
          </button>
        </div>

        <p className="auth-note">
          Guest mode keeps your binder and notes in this browser only.
        </p>
        {authError && <p className="auth-error">{authError}</p>}
      </section>

      <style>{`
        .auth-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background:
            radial-gradient(circle at top left, rgba(236, 72, 153, 0.16), transparent 32rem),
            radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.14), transparent 28rem),
            var(--bg-primary);
        }

        .auth-panel {
          width: min(100%, 430px);
          padding: 2rem;
          border-radius: 18px;
        }

        .auth-brand {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.75rem;
        }

        .auth-logo {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: white;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 16px 35px rgba(99, 102, 241, 0.28);
          flex: 0 0 auto;
        }

        .auth-kicker {
          margin-bottom: 0.2rem;
          color: var(--accent-primary);
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .auth-brand h1 {
          font-size: clamp(1.65rem, 5vw, 2.2rem);
          line-height: 1.05;
          letter-spacing: 0;
        }

        .auth-actions {
          display: grid;
          gap: 0.85rem;
        }

        .auth-button {
          width: 100%;
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, filter 0.2s ease, border-color 0.2s ease;
        }

        .auth-button-primary {
          color: #ffffff;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
          border-color: transparent;
        }

        .auth-button-muted {
          color: var(--text-muted);
          background: var(--bg-tertiary);
          cursor: not-allowed;
        }

        .auth-button-google {
          color: var(--text-primary);
          background: var(--bg-secondary);
          border-color: var(--border-color);
        }

        .auth-button-google:hover:not(:disabled) {
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .auth-button-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .auth-note {
          margin-top: 1.35rem;
          font-size: 0.86rem;
          color: var(--text-muted);
          text-align: center;
        }

        .auth-warning,
        .auth-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          line-height: 1.4;
          text-align: center;
          color: var(--text-muted);
        }

        .auth-error {
          margin-top: 0.85rem;
          color: var(--color-article);
        }
      `}</style>
    </main>
  );
}
