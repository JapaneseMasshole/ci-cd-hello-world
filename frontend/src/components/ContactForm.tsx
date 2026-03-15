import { useState, useEffect } from 'react';
import type { Contact, ContactCreate } from '../api/client';

interface ContactFormProps {
  prefectures: string[];
  editing?: Contact | null;
  onSubmit: (contact: ContactCreate) => Promise<void>;
  onSubmitUpdate?: (id: number, contact: ContactCreate) => Promise<void>;
  onCancelEdit?: () => void;
}

const initial: ContactCreate = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  street_address_1: '',
  street_address_2: '',
  city: '',
  prefecture: '',
  postal_code: '',
};

export function ContactForm({ prefectures, editing, onSubmit, onSubmitUpdate, onCancelEdit }: ContactFormProps) {
  const [form, setForm] = useState<ContactCreate>(initial);

  useEffect(() => {
    if (editing) {
      setForm({
        first_name: editing.first_name,
        last_name: editing.last_name,
        email: editing.email,
        phone: editing.phone,
        street_address_1: editing.street_address_1 ?? '',
        street_address_2: editing.street_address_2 ?? '',
        city: editing.city,
        prefecture: editing.prefecture,
        postal_code: editing.postal_code,
      });
    } else {
      setForm(initial);
    }
  }, [editing]);
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
      if (editing && onSubmitUpdate) {
        await onSubmitUpdate(editing.id, form);
      } else {
        await onSubmit(form);
      }
      setForm(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : (editing ? 'Failed to update contact' : 'Failed to add contact'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3>{editing ? 'Edit contact' : 'Add contact'}</h3>
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
        <div className="form-group form-group-full">
          <label htmlFor="street_address_1">Street Address 1</label>
          <input
            id="street_address_1"
            type="text"
            value={form.street_address_1}
            onChange={(e) => update('street_address_1', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group form-group-full">
          <label htmlFor="street_address_2">Street Address 2</label>
          <input
            id="street_address_2"
            type="text"
            value={form.street_address_2}
            onChange={(e) => update('street_address_2', e.target.value)}
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
      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update contact' : 'Add contact')}
        </button>
        {editing && onCancelEdit && (
          <button type="button" className="btn btn-outline" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
