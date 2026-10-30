import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying your email…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };

    api.post('/api/auth/verify-email', { token })
      .then(({ data }) => {
        if (active) setMessage(data.message);
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.response?.data?.message || 'Could not verify your email. Request a new link and try again.');
        setFailed(true);
      });
    return () => { active = false; };
  }, [token]);

  return (
    <section className="card mx-auto auth-card">
      <div className="card-body p-4 p-md-5">
        <p className="eyebrow mb-2">Email verification</p>
        <h1 className="h2 fw-bold">Confirm your email</h1>
        <p className={`mb-4 ${!token || failed ? 'text-danger' : 'text-secondary'}`} role="status">
          {token ? message : 'This verification link is missing its token.'}
        </p>
        <Link className="btn btn-warning" to="/login">Continue to sign in</Link>
      </div>
    </section>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSending(true);
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not request a password reset. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card mx-auto auth-card">
      <div className="card-body p-4 p-md-5">
        <p className="eyebrow mb-2">Account recovery</p>
        <h1 className="h2 fw-bold">Reset your password</h1>
        <p className="text-secondary">We’ll email a secure reset link if an account matches that address.</p>
        <form className="vstack gap-3 mt-4" onSubmit={submit}>
          <label className="form-label">Email
            <input className="form-control mt-1" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {message && <div className="alert alert-success" role="status">{message}</div>}
          <button className="btn btn-warning" disabled={sending}>{sending ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <p className="mt-3 mb-0 small"><Link to="/login">Return to sign in</Link></p>
      </div>
    </section>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const { data } = await api.post('/api/auth/reset-password', { token, password });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not reset your password. Request a new link and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card mx-auto auth-card">
      <div className="card-body p-4 p-md-5">
        <p className="eyebrow mb-2">Account recovery</p>
        <h1 className="h2 fw-bold">Choose a new password</h1>
        {!token && <div className="alert alert-danger">This reset link is missing its token. Request a new link to continue.</div>}
        <form className="vstack gap-3 mt-4" onSubmit={submit}>
          <label className="form-label">New password
            <input className="form-control mt-1" type="password" autoComplete="new-password" minLength="6" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {message && <div className="alert alert-success" role="status">{message}</div>}
          <button className="btn btn-warning" disabled={!token || saving || Boolean(message)}>{saving ? 'Saving…' : 'Update password'}</button>
        </form>
        {message && <Link className="btn btn-outline-secondary mt-3" to="/login">Continue to sign in</Link>}
      </div>
    </section>
  );
}
