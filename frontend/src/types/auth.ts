export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<{
    user: User | null;
    session: Session | null;
    confirmationRequired: boolean;
    error: Error | null;
  }>;
  signIn: (data: SignInData) => Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
}
