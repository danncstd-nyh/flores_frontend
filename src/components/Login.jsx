import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now Log-in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand" aria-label="Parker Stockroom">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">🕷</span>
          <span>PARKER<span className="brand-divider">/</span>STOCKROOM</span>
        </div>
        <div className="brand-copy">
          <p className="eyebrow">Queens, New York · Since 1962</p>
          <h1>Your friendly neighborhood <span>stockroom.</span></h1>
          <p>A little order in a city that never sits still.</p>
        </div>
        <div className="city-stamp">New York inventory desk · 40°43' N</div>
      </section>

      <section className="auth-panel">
        <p className="eyebrow">Parker Industries · Staff access</p>
        <h2>{mode === 'login' ? 'Welcome back' : 'Join the team'}</h2>
        <p className="auth-intro">{mode === 'login' ? 'Sign in to your account to continue.' : 'Create an account for view access to the catalog.'}</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        {notice && <div className="alert success" role="status">{notice}</div>}

        <form onSubmit={submit}>
          <label>Username
            <input autoComplete="username" value={form.username} onChange={set('username')} required autoFocus />
          </label>
          {mode === 'register' && (
            <label>Email address
              <input type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
            </label>
          )}
          <label>Password
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} required minLength={6} />
          </label>
          <button className="button" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!busy && <span aria-hidden="true">↗</span>}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? 'No account yet? ' : 'Already registered? '}
          <button className="text-link" type="button" onClick={() => { setError(''); setNotice(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
        <div className="auth-foot">Authorized access only <span aria-hidden="true">·</span> Great responsibility, great inventory</div>
      </section>
    </main>
  );
}
