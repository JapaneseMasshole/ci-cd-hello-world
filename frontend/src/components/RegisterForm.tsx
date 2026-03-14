import { useState } from 'react';
import { register as registerUser } from '../api/client';

interface RegisterFormProps {
  onRegistered: () => void;
  onBack: () => void;
}

export function RegisterForm({ onRegistered, onBack }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await registerUser(username, password);
      onRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-form">
      <h2>Create account</h2>
      <p className="login-subtitle">Register to start using the address book</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="login-footer">
        <button type="button" className="btn-link" onClick={onBack}>
          Back to sign in
        </button>
      </p>
    </div>
  );
}
