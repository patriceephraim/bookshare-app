import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapPin, Navigation } from 'lucide-react-native';
import { useApi } from '@/lib/api';
import { useMe } from '@/lib/MeContext';

const NEIGHBOURHOODS: { name: string; lat: number; lng: number }[] = [
  { name: 'Glebe',            lat: 45.4185, lng: -75.6973 },
  { name: 'Centretown',       lat: 45.4203, lng: -75.6953 },
  { name: 'Westboro',         lat: 45.3970, lng: -75.7510 },
  { name: 'Old Ottawa South', lat: 45.3933, lng: -75.6856 },
  { name: 'Hintonburg',       lat: 45.4031, lng: -75.7242 },
  { name: 'ByWard Market',    lat: 45.4290, lng: -75.6925 },
];

export default function LocationScreen() {
  const api = useApi();
  const { setMe } = useMe();

  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedLat, setSelectedLat]   = useState<number | null>(null);
  const [selectedLng, setSelectedLng]   = useState<number | null>(null);
  const [locating, setLocating]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const selectNeighbourhood = (n: typeof NEIGHBOURHOODS[0]) => {
    setSelectedName(n.name);
    setSelectedLat(n.lat);
    setSelectedLng(n.lng);
  };

  const handleCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Grant location access in Settings to use this feature.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      // Find nearest known neighbourhood to label the pin
      let nearest = NEIGHBOURHOODS[0];
      let minDist = Infinity;
      for (const n of NEIGHBOURHOODS) {
        const d = Math.hypot(n.lat - latitude, n.lng - longitude);
        if (d < minDist) { minDist = d; nearest = n; }
      }

      setSelectedLat(latitude);
      setSelectedLng(longitude);
      setSelectedName(nearest.name);
    } catch {
      Alert.alert('Location error', 'Could not get your location. Please pick a neighbourhood manually.');
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedLat === null || selectedLng === null) return;
    setSubmitting(true);
    try {
      const updatedMe = await api.updateMe({ home_lat: selectedLat, home_lng: selectedLng });
      // Update the MeContext directly — AuthGuard sees home_lat is now set
      // and redirects to /(tabs) without a second /api/me round-trip.
      setMe(updatedMe);
    } catch {
      Alert.alert('Could not save location', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirm = selectedLat !== null && !submitting;

  return (
    <SafeAreaView className="flex-1 bg-cream-50">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-8 gap-8 justify-center" style={{ paddingVertical: 40 }}>
          {/* Header */}
          <View className="items-center gap-4">
            <View className="w-20 h-20 bg-teal-50 rounded-full items-center justify-center">
              <Navigation size={36} color="#3F7C6E" strokeWidth={1.5} />
            </View>
            <View className="gap-2 items-center">
              <Text className="font-serif text-3xl text-ink-900 text-center">
                Where are you?
              </Text>
              <Text className="font-sans text-base text-ink-500 text-center leading-relaxed">
                Bookshare shows you books within walking distance. We only share your neighbourhood,
                never your exact address.
              </Text>
            </View>
          </View>

          {/* Map placeholder */}
          <View style={styles.mapPlaceholder} className="rounded-card overflow-hidden border border-cream-200">
            <View style={StyleSheet.absoluteFillObject}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={`h${i}`} style={[styles.gridLine,  { top:  `${20 * i}%` as any }]} />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={`v${i}`} style={[styles.gridLineV, { left: `${20 * i}%` as any }]} />
              ))}
            </View>
            <View className="absolute inset-0 items-center justify-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={[styles.pin, { backgroundColor: selectedName ? '#3F7C6E' : '#B5AB99' }]}
              >
                <MapPin size={20} color="#fff" strokeWidth={2} fill="#fff" />
              </View>
              <View className="bg-cream-100 border border-cream-200 rounded-pill px-4 py-2 mt-3">
                <Text className="font-sans-medium text-sm text-ink-900">
                  {selectedName ? `${selectedName}, Ottawa` : 'Pick a neighbourhood'}
                </Text>
              </View>
            </View>
          </View>

          {/* Neighbourhood chips */}
          <View className="gap-3">
            <Text className="font-sans-medium text-sm text-ink-500">Popular in Ottawa</Text>
            <View className="flex-row flex-wrap gap-2">
              {NEIGHBOURHOODS.map((n) => {
                const active = selectedName === n.name;
                return (
                  <TouchableOpacity
                    key={n.name}
                    onPress={() => selectNeighbourhood(n)}
                    activeOpacity={0.75}
                    className={`rounded-pill px-4 py-2 border ${active ? 'bg-teal-500 border-teal-700' : 'bg-cream-100 border-cream-200'}`}
                  >
                    <Text className={`font-sans text-sm ${active ? 'text-white' : 'text-ink-700'}`}>
                      {n.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* CTAs */}
          <View className="gap-3">
            {/* Confirm — only shown once a location is chosen */}
            {canConfirm && (
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={submitting}
                activeOpacity={0.82}
                className="items-center justify-center bg-teal-500 rounded-button py-4"
                style={submitting ? { opacity: 0.6 } : undefined}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="font-sans-semibold text-base text-white">Confirm — {selectedName}</Text>
                }
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleCurrentLocation}
              disabled={locating}
              activeOpacity={0.82}
              className="items-center justify-center border border-teal-500 rounded-button py-4"
              style={locating ? { opacity: 0.6 } : undefined}
            >
              {locating
                ? <ActivityIndicator color="#3F7C6E" />
                : <Text className="font-sans-semibold text-base text-teal-500">Use my current location</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#EAF0EE',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D0DDD9',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#D0DDD9',
  },
  pin: {
    shadowColor: '#1A3530',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
