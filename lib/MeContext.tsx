import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { UserMe } from './api';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

interface MeContextValue {
  me: UserMe | null;
  loading: boolean;
  setMe: (me: UserMe) => void;
}

const MeContext = createContext<MeContextValue>({
  me: null,
  loading: true,
  setMe: () => {},
});

export function MeProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [me, setMeState] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch /api/me ONCE when the user signs in. Re-runs only when isSignedIn or
  // isLoaded changes — never on navigation, never on segment changes.
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setMeState(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getToken()
      .then(token => {
        if (cancelled || !token) return null;
        return fetch(`${BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => (r.ok ? r.json() : null));
      })
      .then(data => {
        if (!cancelled) {
          setMeState(data ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMeState(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MeContext.Provider value={{ me, loading, setMe: setMeState }}>
      {children}
    </MeContext.Provider>
  );
}

export function useMe() {
  return useContext(MeContext);
}
