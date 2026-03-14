import { useState, useEffect, useCallback } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ContactForm } from './components/ContactForm';
import { ContactList } from './components/ContactList';
import {
  getPrefectures,
  getContacts,
  createContact,
  deleteContact,
  type Contact,
} from './api/client';
import './App.css';

const TOKEN_KEY = 'token';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [showRegister, setShowRegister] = useState(false);
  const [prefectures, setPrefectures] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsError, setContactsError] = useState<string | null>(null);

  const handleLogin = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    getPrefectures().then(setPrefectures).catch(console.error);
  }, []);

  const refreshContacts = useCallback(() => {
    if (!token) return;
    setContactsError(null);
    getContacts()
      .then(setContacts)
      .catch((err) => setContactsError(err instanceof Error ? err.message : 'Failed to load'));
  }, [token]);

  useEffect(() => {
    if (token) refreshContacts();
  }, [token, refreshContacts]);

  if (!token) {
    return (
      <div className="app auth-screen">
        {showRegister ? (
          <RegisterForm
            onRegistered={() => setShowRegister(false)}
            onBack={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm
            onLogin={handleLogin}
            onRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Address Book</h1>
        <button type="button" className="btn btn-outline" onClick={handleLogout}>
          Sign out
        </button>
      </header>
      <main className="app-main">
        <section className="form-section">
          <ContactForm
            prefectures={prefectures}
            onSubmit={async (c) => {
              await createContact(c);
              refreshContacts();
            }}
          />
        </section>
        <section className="list-section">
          {contactsError && <p className="form-error">{contactsError}</p>}
          <ContactList
            contacts={contacts}
            onDelete={async (id) => {
              await deleteContact(id);
              refreshContacts();
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
