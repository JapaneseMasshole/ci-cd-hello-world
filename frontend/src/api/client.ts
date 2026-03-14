const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getHeaders(includeAuth = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (includeAuth && token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(username: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function register(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed');
  }
}

export async function getPrefectures(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/prefectures`);
  if (!res.ok) throw new Error('Failed to fetch prefectures');
  return res.json();
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  prefecture: string;
  postal_code: string;
  created_at: string;
}

export interface ContactCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  prefecture: string;
  postal_code: string;
}

export async function getContacts(): Promise<Contact[]> {
  const res = await fetch(`${API_BASE}/contacts`, {
    headers: getHeaders(true),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch contacts');
  }
  return res.json();
}

export async function createContact(contact: ContactCreate): Promise<Contact> {
  const res = await fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(contact),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create contact');
  }
  return res.json();
}

export async function deleteContact(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to delete contact');
  }
}
