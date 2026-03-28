import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  sender: string;
  subject: string;
  date: number;
  isUnread: boolean;
  bodyHtml?: string;
  bodyPlain?: string;
}

interface AppState {
  accessToken: string | null;
  sources: string[];
  emails: EmailMessage[];
  lastChecked: number | null;
  setAccessToken: (token: string | null) => void;
  addSource: (source: string) => void;
  removeSource: (source: string) => void;
  setEmails: (emails: EmailMessage[]) => void;
  markEmailRead: (id: string) => void;
  setLastChecked: (time: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      accessToken: null,
      sources: [],
      emails: [],
      lastChecked: null,
      setAccessToken: (token) => set({ accessToken: token }),
      addSource: (source) =>
        set((state) => ({
          sources: state.sources.includes(source)
            ? state.sources
            : [...state.sources, source],
        })),
      removeSource: (source) =>
        set((state) => ({
          sources: state.sources.filter((s) => s !== source),
        })),
      setEmails: (emails) => set({ emails }),
      markEmailRead: (id) =>
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === id ? { ...e, isUnread: false } : e
          ),
        })),
      setLastChecked: (time) => set({ lastChecked: time }),
      logout: () => set({ accessToken: null, sources: [], emails: [], lastChecked: null }),
    }),
    {
      name: 'leadstream-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        sources: state.sources,
      }),
    }
  )
);
