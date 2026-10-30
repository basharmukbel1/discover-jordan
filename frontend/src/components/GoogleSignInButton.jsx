import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

export default function GoogleSignInButton({ onCredential }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [status, setStatus] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return undefined;
    let active = true;

    const renderGoogleButton = () => {
      if (!active || !window.google?.accounts?.id || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential) callbackRef.current(credential);
          else setStatus('Google did not return a sign-in credential. Try again.');
        },
        auto_select: false,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: Math.min(containerRef.current.clientWidth || 320, 360),
      });
    };
    const handleScriptError = () => {
      if (active) setStatus('Google sign-in could not load. Check your connection and try again.');
    };

    let script = document.getElementById(GOOGLE_SCRIPT_ID);
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      if (!script) {
        script = document.createElement('script');
        script.id = GOOGLE_SCRIPT_ID;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderGoogleButton);
      script.addEventListener('error', handleScriptError);
    }

    return () => {
      active = false;
      script?.removeEventListener('load', renderGoogleButton);
      script?.removeEventListener('error', handleScriptError);
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <p className="small text-secondary mb-0">
        Google sign-in will be available after the OAuth client is configured.
      </p>
    );
  }

  return (
    <div className="google-signin">
      <div ref={containerRef} className="d-flex justify-content-center" />
      {status && <p className="small text-danger mt-2 mb-0" role="status">{status}</p>}
    </div>
  );
}
