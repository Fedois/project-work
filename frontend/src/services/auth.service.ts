import type { SignUpData, SignInData, User, Session } from '../types/auth';
import { apiFetch } from '../lib/api';

export async function signUpUser({ email, password, firstName, lastName }: SignUpData) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  return {
    user: data.user as User,
    session: (data.session || null) as Session | null,
    confirmationRequired: Boolean(data.confirmationRequired),
  };
}

export async function signInUser({ email, password }: SignInData) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return {
    user: data.user as User,
    session: (data.session || null) as Session | null,
  };
}

export async function signOutUser() {
  await apiFetch('/api/auth/logout', {
    method: 'POST',
  });
}

export async function fetchMe(): Promise<User | null> {
  try {
    const data = await apiFetch('/api/auth/me', {
      method: 'GET',
    });

    return (data.user || data) as User;
  } catch {
    return null;
  }
}