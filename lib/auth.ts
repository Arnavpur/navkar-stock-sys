// Simple authentication context and helper
import { User } from './db';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('secura_current_user');
  return stored ? JSON.parse(stored) : null;
};

export const setStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('secura_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('secura_current_user');
  }
};
