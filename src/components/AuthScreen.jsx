import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, UserRound, ShieldCheck } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized));
  } catch (err) {
    console.error('Unable to decode Google sign-in token:', err);
    return null;
  }
}

export default function AuthScreen({ onSignIn }) {
  const googleButtonRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const profile = decodeJwtPayload(response.credential);
          if (!profile) return;

          onSignIn({
            provider: 'google',
            name: profile.name || 'Google Student',
            email: profile.email || '',
            picture: profile.picture || '',
            signedInAt: new Date().toISOString()
          });
        }
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleButtonRef.current.offsetWidth || 320,
        text: 'continue_with',
        shape: 'rectangular'
      });

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [onSignIn]);

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
          {GOOGLE_CLIENT_ID ? (
            <div className="google-button-wrap" ref={googleButtonRef}>
              {!googleReady && <span className="google-loading">Loading Google sign-in...</span>}
            </div>
          ) : (
            <button className="auth-button auth-button-muted" type="button" disabled>
              <ShieldCheck size={19} />
              Google sign-in needs setup
            </button>
          )}

          <button className="auth-button auth-button-primary" type="button" onClick={handleGuestSignIn}>
            <UserRound size={19} />
            Continue as guest
          </button>
        </div>

        <p className="auth-note">
          Guest mode keeps your binder and notes in this browser only.
        </p>
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

        .google-button-wrap {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .google-loading {
          color: var(--text-secondary);
          font-size: 0.9rem;
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
      `}</style>
    </main>
  );
}
