import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, getErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Name is required';
  if (!/^[\p{L}\p{M}\s'-]+$/u.test(trimmed)) return 'Name can only contain letters, spaces, hyphens and apostrophes';
  return null;
}

function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return 'Phone number is required';
  if (digits.length !== 10) return 'Phone number must be exactly 10 digits';
  return null;
}

export function Login() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const nErr = validateName(name);
    const pErr = validatePhone(phone);
    setNameError(nErr ?? '');
    setPhoneError(pErr ?? '');
    if (nErr || pErr) return;
    setLoading(true);
    try {
      const { data } = await authApi.login(name.trim(), phone);
      setToken(data.data.token);
      setUser(data.data.user);
      setLoading(false);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-name">Name</label>
          <input
            id="login-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            required
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'login-name-error' : undefined}
          />
          {nameError && <p id="login-name-error" className="error-msg form-field-error">{nameError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="login-phone">Phone</label>
          <input
            id="login-phone"
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
            required
            autoComplete="tel"
            placeholder="Your phone number"
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? 'login-phone-error' : undefined}
          />
          {phoneError && <p id="login-phone-error" className="error-msg form-field-error">{phoneError}</p>}
        </div>
        {error && <p className="error-msg">{String(error)}</p>}
        <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Log in'}
        </button>
      </form>
      <p className="auth-footer">
        No account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
