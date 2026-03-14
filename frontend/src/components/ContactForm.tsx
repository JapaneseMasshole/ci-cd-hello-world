import { useState } from 'react';
import type { ContactCreate } from '../api/client';

interface ContactFormProps {
  prefectures: string[];
  onSubmit: (contact: ContactCreate) => Promise<void>;
}

const initial: ContactCreate = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  prefecture: '',
  postal_code: '',
};

export function ContactForm({ prefectures, onSubmit }: ContactFormProps) {
  const [form, setForm] = useState<ContactCreate>(initial);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof ContactCreate, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onSubmit(form);
      setForm(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3>Add contact</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            type="text"
            value={form.first_name}
            onChange={(e) => update('first_name', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            type="text"
            value={form.last_name}
            onChange={(e) => update('last_name', e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="prefecture">Prefecture</label>
          <select
            id="prefecture"
            value={form.prefecture}
            onChange={(e) => update('prefecture', e.target.value)}
            required
          >
            <option value="">Select...</option>
            {prefectures.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="postal_code">Postal code</label>
          <input
            id="postal_code"
            type="text"
            value={form.postal_code}
            onChange={(e) => update('postal_code', e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={isLoading} className="btn btn-primary">
        {isLoading ? 'Adding...' : 'Add contact'}
      </button>
    </form>
  );
}
