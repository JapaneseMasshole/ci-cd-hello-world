import { useState } from 'react';
import type { Contact } from '../api/client';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => Promise<void>;
}

export function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="contact-list">
      <h3>Contacts</h3>
      {contacts.length === 0 ? (
        <p className="empty-state">No contacts yet. Add one above.</p>
      ) : (
        <div className="contact-table-wrap">
          <table className="contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.first_name} {c.last_name}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    {[c.street_address_1, c.street_address_2].filter(Boolean).join(', ')}
                    {[c.street_address_1, c.street_address_2].some(Boolean) && ', '}
                    {c.city}, {c.prefecture} {c.postal_code}
                  </td>
                  <td>
                    <div className="contact-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                      >
                        {deleting === c.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
