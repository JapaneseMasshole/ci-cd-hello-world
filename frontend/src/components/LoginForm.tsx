import { useState } from 'react';
import { login } from '../api/client';

interface LoginFormProps {
  onLogin: (token: string) => void;
  onRegister?: () => void;
}

export function LoginForm({ onLogin, onRegister }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { access_token } = await login(username, password);
      onLogin(access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-form">
      <h2>Address Book</h2>
      <p className="login-subtitle">Sign in to manage your contacts</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {onRegister && (
        <p className="login-footer">
          Don&apos;t have an account?{' '}
          <button type="button" className="btn-link" onClick={onRegister}>
            Register
          </button>
        </p>
      )}
    </div>
  );
}
