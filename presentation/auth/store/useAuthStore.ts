import { create } from 'zustand';
import { authLogin, authRegister } from '@/core/auth/actions/auth-actions';
import { Rol, User } from '@/core/auth/interface/user';
import { SecureStorage } from '@/helpers/adapters/secure-storage';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

interface AuthState {
  status: AuthStatus;
  user?: User;
  token?: string;

  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string, rol: Rol) => Promise<boolean>;
  loginAsGuest: () => void;
  checkStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  user: undefined,
  token: undefined,

  login: async (email, password) => {
    const resp = await authLogin(email, password);
    if (!resp) {
      set({ status: 'unauthenticated', user: undefined, token: undefined });
      return false;
    }
    set({ status: 'authenticated', user: resp.user, token: resp.token });
    await SecureStorage.setItem('token', resp.token);
    await SecureStorage.setItem('user', JSON.stringify(resp.user));
    return true;
  },

  register: async (nombre, email, password, rol) => {
    const resp = await authRegister(nombre, email, password, rol);
    if (!resp) {
      set({ status: 'unauthenticated', user: undefined, token: undefined });
      return false;
    }
    set({ status: 'authenticated', user: resp.user, token: resp.token });
    await SecureStorage.setItem('token', resp.token);
    await SecureStorage.setItem('user', JSON.stringify(resp.user));
    return true;
  },

  loginAsGuest: () => {
    set({ status: 'authenticated', user: undefined, token: undefined });
  },

  checkStatus: async () => {
    const token = await SecureStorage.getItem('token');
    const userString = await SecureStorage.getItem('user');

    if (!token || !userString) {
      set({ status: 'unauthenticated', user: undefined, token: undefined });
      return;
    }

    try {
      const user: User = JSON.parse(userString);
      set({ status: 'authenticated', user, token });
    } catch {
      set({ status: 'unauthenticated', user: undefined, token: undefined });
    }
  },

  logout: async () => {
    set({ status: 'unauthenticated', user: undefined, token: undefined });
    await SecureStorage.deleteItem('token');
    await SecureStorage.deleteItem('user');
  },
}));
