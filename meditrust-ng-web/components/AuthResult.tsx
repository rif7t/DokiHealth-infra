import { User, Session } from '@supabase/supabase-js';

// The function will accept one of two modes: 'signIn' or 'signUp'
export type AuthMode = 'signIn' | 'signUp';

// The successful result of our function will be the user and session
export type AuthResult = {
  user: User;
  session: Session | null; // Session can be null if email confirmation is required
};