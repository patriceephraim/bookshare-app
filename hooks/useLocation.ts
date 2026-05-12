import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export interface LatLng {
  lat: number;
  lng: number;
}

const GLEBE: LatLng = { lat: 45.4185, lng: -75.6973 };

export function useLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const didSet = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setPermissionDenied(true);
            setLocation(GLEBE);
            setUsingFallback(true);
            setLoading(false);
          }
          return;
        }

        // Try high-accuracy first, fall back to lower accuracy on timeout
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
        ]);

        if (cancelled) return;

        if (loc) {
          setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          setUsingFallback(false);
          didSet.current = true;
        } else {
          // Timed out — try low accuracy as a fallback
          try {
            const fast = await Location.getLastKnownPositionAsync();
            if (!cancelled && fast) {
              setLocation({ lat: fast.coords.latitude, lng: fast.coords.longitude });
              setUsingFallback(false);
            } else if (!cancelled) {
              setLocation(GLEBE);
              setUsingFallback(true);
            }
          } catch {
            if (!cancelled) { setLocation(GLEBE); setUsingFallback(true); }
          }
        }
      } catch {
        if (!cancelled) { setLocation(GLEBE); setUsingFallback(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return {
    location: location ?? GLEBE,
    loading,
    permissionDenied,
    usingFallback,
  };
}
