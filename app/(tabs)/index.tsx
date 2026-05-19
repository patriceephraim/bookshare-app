import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'under_1km'>('all');

  const displayedListings =
    activeFilter === 'under_1km'
      ? listings.filter(l => l.distance_meters <= 1000)
      : listings;

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
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              coordinate={{
                latitude: listing.location.lat,
                longitude: listing.location.lng,
              }}
              title={listing.book.title}
              description={listing.book.author}
              pinColor={listing.status === 'available' ? '#3F7C6E' : '#B5AB99'}
              onCalloutPress={() => router.push(`/listing/${listing.id}` as any)}
            />
          ))}
        </MapView>

        {loading && (
          <View style={[styles.loadingOverlay, { top: insets.top }]}>
            <ActivityIndicator color="#3F7C6E" />
          </View>
        )}

        {/* Top bar */}
        <View style={{ paddingTop: insets.top + 12 }} className="absolute top-0 left-0 right-0 px-5" pointerEvents="box-none">
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
        <View className="absolute bottom-3 left-0 right-0" pointerEvents="box-none">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}>
            {([
              { key: 'all',       label: 'All'        },
              { key: 'available', label: 'Available'  },
              { key: 'under_1km', label: 'Under 1 km' },
            ] as const).map(({ key, label }) => {
              const active = activeFilter === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveFilter(key)}
                  className="rounded-pill px-4 py-2 border"
                  style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                  activeOpacity={0.75}
                >
                  <Text
                    className="font-sans-medium text-sm"
                    style={active ? styles.chipLabelActive : styles.chipLabelInactive}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
          <Text className="font-sans text-sm text-ink-500">{displayedListings.length} book{displayedListings.length !== 1 ? 's' : ''}</Text>
        </View>

        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#3F7C6E" />
            <Text className="font-sans text-sm text-ink-500 mt-3">Finding books near you…</Text>
          </View>
        ) : displayedListings.length === 0 ? (
          <View className="py-8 items-center gap-2">
            <Text className="font-serif text-lg text-ink-700">No books nearby yet</Text>
            <Text className="font-sans text-sm text-ink-500 text-center">Be the first to share a book in your neighbourhood!</Text>
          </View>
        ) : (
          displayedListings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              onPress={() => router.push(`/listing/${listing.id}` as any)}
              className="flex-row items-center gap-4 py-3 border-b border-cream-200"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-teal-50 rounded-lg items-center justify-center overflow-hidden flex-shrink-0">
                {listing.book.cover_url ? (
                  <Image source={{ uri: listing.book.cover_url }} style={{ width: 40, height: 40 }} contentFit="cover" />
                ) : (
                  <Text className="font-serif-bold text-base text-teal-500">{listing.book.title[0]}</Text>
                )}
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
  searchBar: { shadowColor: '#1F1B16', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  iconBtn: { shadowColor: '#1F1B16', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  chip: { shadowColor: '#1F1B16', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  chipActive:        { backgroundColor: '#3F7C6E', borderColor: '#2E5C52' },
  chipInactive:      { backgroundColor: '#FBF8F2', borderColor: '#EAE0CB' },
  chipLabelActive:   { color: '#ffffff' },
  chipLabelInactive: { color: '#3D362C' },
  loadingOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
});