import { create } from 'zustand';
import { SecureStorage } from '@/helpers/adapters/secure-storage';

const STORAGE_KEY = 'app_theme_color';

export const THEME_PRESETS = [
  { label: 'Teja',    value: '#571D11' },
  { label: 'Bosque',  value: '#1a5c2e' },
  { label: 'Océano',  value: '#0f3460' },
  { label: 'Violeta', value: '#4a1a6b' },
  { label: 'Pizarra', value: '#1e2d3d' },
  { label: 'Ámbar',   value: '#7c3a0e' },
];

interface ThemeState {
  primaryColor: string;
  setColor: (color: string) => Promise<void>;
  loadColor: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  primaryColor: '#571D11',

  setColor: async (color) => {
    set({ primaryColor: color });
    await SecureStorage.setItem(STORAGE_KEY, color);
  },

  loadColor: async () => {
    const saved = await SecureStorage.getItem(STORAGE_KEY);
    if (saved) set({ primaryColor: saved });
  },
}));
