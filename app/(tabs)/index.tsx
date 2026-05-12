import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useApi, ListingNearby, distanceLabel, conditionLabel } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { StatusPill } from '@/components/ui/StatusPill';
import { Avatar } from '@/components/ui/Avatar';

// Maps API status → our StatusPill's expected values
function pillStatus(s: string): 'available' | 'on-loan' {
  return s === 'available' ? 'available' : 'on-loan';
}

const PIN_COLORS: Record<string, { bg: string; border: string }> = {
  available: { bg: '#3F7C6E', border: '#2E5C52' },
  on_loan: { bg: '#B5AB99', border: '#7A6F5E' },
};

// Deterministic scatter so pins don't overlap — offset by index
function pinPosition(
  index: number,
  listing: ListingNearby,
  centerLat: number,
  centerLng: number,
  mapWidth: number,
  mapHeight: number,
) {
  // Scale lat/lng delta to screen pixels — rough but visually correct at city scale
  const scale = 40000; // pixels per degree
  const dx = (listing.location.lng - centerLng) * scale;
  const dy = (listing.location.lat - centerLat) * scale;
  const left = mapWidth / 2 + dx;
  const top = mapHeight / 2 - dy;
  // Clamp to safe area with index-based jitter as fallback
  const jitterPositions = [
    { x: 0.22, y: 0.28 }, { x: 0.55, y: 0.42 }, { x: 0.38, y: 0.62 },
    { x: 0.70, y: 0.22 }, { x: 0.15, y: 0.70 }, { x: 0.80, y: 0.58 },
  ];
  const j = jitterPositions[index % jitterPositions.length];
  const fallback = { left: mapWidth * j.x, top: mapHeight * j.y };
  const isOnScreen = left > 20 && left < mapWidth - 20 && top > 20 && top < mapHeight - 20;
  return isOnScreen ? { left, top } : fallback;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mapHeight = 340;
  const api = useApi();
  const { location } = useLocation();
  const { user } = useUser();

  const avatarInitials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase()
    || user?.username?.slice(0, 2).toUpperCase()
    || '?';

  const [listings, setListings] = useState<ListingNearby[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listingsNearby(location.lat, location.lng, 3000)
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location.lat, location.lng]);

  return (
    <View className="flex-1 bg-cream-50">
      {/* Map area */}
      <View style={[styles.mapArea, { height: mapHeight + insets.top }]}>
        {/* Grid overlay */}
        <View style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridH, { top: `${14 * i}%` as any }]} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridV, { left: `${14 * i}%` as any }]} />
          ))}
        </View>

        <View style={styles.roadH} />
        <View style={styles.roadV} />

        {/* Book pins */}
        {listings.map((listing, i) => {
          const pos = pinPosition(i, listing, location.lat, location.lng, width, mapHeight);
          const pinColor = PIN_COLORS[listing.status] ?? PIN_COLORS.available;
          return (
            <TouchableOpacity
              key={listing.id}
              onPress={() => router.push(`/listing/${listing.id}` as any)}
              style={[styles.pin, { left: pos.left, top: pos.top + insets.top }]}
              activeOpacity={0.8}
            >
              <View style={[styles.pinDot, { backgroundColor: pinColor.bg, borderColor: pinColor.border }]} />
              <View style={styles.pinLabel}>
                <Text style={styles.pinText} numberOfLines={1}>{listing.book.title}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {loading && (
          <View style={[styles.loadingOverlay, { top: insets.top }]}>
            <ActivityIndicator color="#3F7C6E" />
          </View>
        )}

        {/* Top bar */}
        <View style={{ paddingTop: insets.top + 12 }} className="absolute top-0 left-0 right-0 px-5">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
              className="flex-1 flex-row items-center gap-3 bg-cream-50 rounded-button px-4 py-3 border border-cream-200"
              activeOpacity={0.85}
              style={styles.searchBar}
            >
              <Search size={16} color="#B5AB99" strokeWidth={1.75} />
              <Text className="font-sans text-base text-ink-300">Search nearby books…</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.iconBtn}
              activeOpacity={0.8}
            >
              <Avatar initials={avatarInitials} size="md" colorIndex={0} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter chips */}
        <View className="absolute bottom-3 left-0 right-0">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}>
            {['All', 'Available', 'Fiction', 'Non-fiction', 'Under 1 km'].map((chip) => (
              <View
                key={chip}
                className={`rounded-pill px-4 py-2 border ${chip === 'All' ? 'bg-teal-500 border-teal-700' : 'bg-cream-50 border-cream-200'}`}
                style={styles.chip}
              >
                <Text className={`font-sans-medium text-sm ${chip === 'All' ? 'text-white' : 'text-ink-700'}`}>
                  {chip}
                </Text>
              </View>
            ))}
            <TouchableOpacity className="flex-row items-center gap-2 rounded-pill px-4 py-2 border bg-cream-50 border-cream-200" style={styles.chip}>
              <SlidersHorizontal size={13} color="#3D362C" strokeWidth={1.75} />
              <Text className="font-sans-medium text-sm text-ink-700">Filter</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Nearby list */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 4 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-baseline justify-between mb-2">
          <Text className="font-serif text-xl text-ink-900">Nearby</Text>
          <Text className="font-sans text-sm text-ink-500">{listings.length} book{listings.length !== 1 ? 's' : ''}</Text>
        </View>

        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#3F7C6E" />
            <Text className="font-sans text-sm text-ink-500 mt-3">Finding books near you…</Text>
          </View>
        ) : listings.length === 0 ? (
          <View className="py-8 items-center gap-2">
            <Text className="font-serif text-lg text-ink-700">No books nearby yet</Text>
            <Text className="font-sans text-sm text-ink-500 text-center">Be the first to share a book in your neighbourhood!</Text>
          </View>
        ) : (
          listings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              onPress={() => router.push(`/listing/${listing.id}` as any)}
              className="flex-row items-center gap-4 py-3 border-b border-cream-200"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-teal-50 rounded-lg items-center justify-center">
                <Text className="font-serif-bold text-base text-teal-500">{listing.book.title[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-serif text-base text-ink-900" numberOfLines={1}>{listing.book.title}</Text>
                <Text className="font-sans text-sm text-ink-500">
                  {listing.book.author} · {distanceLabel(listing.distance_meters)} · {conditionLabel(listing.condition)}
                </Text>
              </View>
              <StatusPill status={pillStatus(listing.status)} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapArea: { backgroundColor: '#E4EDEA', overflow: 'hidden' },
  gridH: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#C8D8D4' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: '#C8D8D4' },
  roadH: { position: 'absolute', top: '52%', left: 0, right: 0, height: 6, backgroundColor: '#D0DDD9', opacity: 0.8 },
  roadV: { position: 'absolute', left: '35%', top: 0, bottom: 0, width: 6, backgroundColor: '#D0DDD9', opacity: 0.8 },
  pin: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -12 }, { translateY: -12 }] },
  pinDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  pinLabel: { backgroundColor: '#FBF8F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2, maxWidth: 120, borderWidth: StyleSheet.hairlineWidth, borderColor: '#EAE0CB' },
  pinText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#1F1B16' },
  searchBar: { shadowColor: '#1F1B16', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  iconBtn: { shadowColor: '#1F1B16', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  chip: { shadowColor: '#1F1B16', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  loadingOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
});
