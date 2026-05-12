import { useAuth } from '@clerk/clerk-expo';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types matching backend schemas ────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BookPublic {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
}

export interface UserPublic {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface ListingPublic {
  id: string;
  book: BookPublic;
  user: UserPublic;
  condition: 'like_new' | 'good' | 'worn';
  status: 'available' | 'on_loan' | 'hidden';
  location: GeoPoint;
  notes: string | null;
  created_at: string;
}

export interface ListingNearby extends ListingPublic {
  distance_meters: number;
}

export interface LoanPublic {
  id: string;
  listing: ListingPublic;
  borrower: UserPublic;
  lender: UserPublic;
  status: 'requested' | 'active' | 'returned' | 'declined';
  message: string | null;
  requested_at: string;
  accepted_at: string | null;
  returned_at: string | null;
}

export interface MessagePublic {
  id: string;
  loan_id: string;
  sender: UserPublic;
  content: string;
  created_at: string;
}

export interface IdentifyResponse {
  book: BookPublic;
  confidence: 'high' | 'medium' | 'low';
  new_book: boolean;
}

export interface UserMe {
  id: string;
  clerk_id: string;
  username: string;
  avatar_url: string | null;
  home_lat: number | null;
  home_lng: number | null;
  created_at: string;
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function req<T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Hook-based API client ─────────────────────────────────────────────────────

export function useApi() {
  const { getToken } = useAuth();
  const tok = () => getToken();

  return {
    // Public — token included if available, not required
    listingsNearby(lat: number, lng: number, radiusM = 2000) {
      return tok().then(t =>
        req<ListingNearby[]>(
          `/api/listings/nearby/search?lat=${lat}&lng=${lng}&radius_m=${radiusM}`,
          t,
        ),
      );
    },

    semanticSearch(q: string, lat: number, lng: number, radiusM = 5000) {
      return tok().then(t =>
        req<ListingNearby[]>(
          `/api/listings/search/semantic?q=${encodeURIComponent(q)}&lat=${lat}&lng=${lng}&radius_m=${radiusM}`,
          t,
        ),
      );
    },

    getListing(id: string) {
      return tok().then(t => req<ListingPublic>(`/api/listings/${id}`, t));
    },

    // Auth-required
    identifyBook(imageUri: string, mimeType = 'image/jpeg') {
      return tok().then(t => {
        const form = new FormData();
        form.append('image', { uri: imageUri, type: mimeType, name: 'cover.jpg' } as any);
        return req<IdentifyResponse>('/api/books/identify', t, { method: 'POST', body: form });
      });
    },

    createListing(payload: {
      book_id: string;
      location: GeoPoint;
      condition: string;
      notes?: string;
    }) {
      return tok().then(t =>
        req<ListingPublic>('/api/listings', t, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      );
    },

    getMe() {
      return tok().then(t => req<UserMe>('/api/me', t));
    },

    updateMe(payload: { username?: string; avatar_url?: string; home_lat?: number; home_lng?: number }) {
      return tok().then(t =>
        req<UserMe>('/api/me', t, { method: 'PATCH', body: JSON.stringify(payload) }),
      );
    },

    createBook(title: string, author: string) {
      return tok().then(t =>
        req<BookPublic>('/api/books/create', t, {
          method: 'POST',
          body: JSON.stringify({ title, author }),
        }),
      );
    },

    getMyListings() {
      return tok().then(t => req<ListingPublic[]>('/api/listings/mine', t));
    },

    createLoan(listing_id: string, message?: string) {
      return tok().then(t =>
        req<LoanPublic>('/api/loans', t, {
          method: 'POST',
          body: JSON.stringify({ listing_id, message: message ?? null }),
        }),
      );
    },

    getMyLoans() {
      return tok().then(t => req<LoanPublic[]>('/api/loans', t));
    },

    getLoan(id: string) {
      return tok().then(t => req<LoanPublic>(`/api/loans/${id}`, t));
    },

    acceptLoan(id: string) {
      return tok().then(t => req<LoanPublic>(`/api/loans/${id}/accept`, t, { method: 'POST' }));
    },

    declineLoan(id: string) {
      return tok().then(t => req<LoanPublic>(`/api/loans/${id}/decline`, t, { method: 'POST' }));
    },

    returnLoan(id: string) {
      return tok().then(t => req<LoanPublic>(`/api/loans/${id}/return`, t, { method: 'POST' }));
    },

    getLoanMessages(loanId: string) {
      return tok().then(t => req<MessagePublic[]>(`/api/loans/${loanId}/messages`, t));
    },

    sendMessage(loanId: string, content: string) {
      return tok().then(t =>
        req<MessagePublic>(`/api/loans/${loanId}/messages`, t, {
          method: 'POST',
          body: JSON.stringify({ content }),
        }),
      );
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function conditionLabel(c: ListingPublic['condition']) {
  return { like_new: 'Like New', good: 'Good', worn: 'Well Loved' }[c] ?? c;
}

export function distanceLabel(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
