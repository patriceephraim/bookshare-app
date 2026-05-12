import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { useApi } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';

const LOAN_DURATIONS = ['2 weeks', '3 weeks', '4 weeks', 'Flexible'];

export default function PickupScreen() {
  const router = useRouter();
  const { bookId, bookTitle, condition, notes } = useLocalSearchParams<{
    bookId: string;
    bookTitle: string;
    bookAuthor: string;
    condition: string;
    notes: string;
  }>();
  const api = useApi();
  const { location, loading: locationLoading, permissionDenied, usingFallback } = useLocation();

  const [duration, setDuration] = useState('3 weeks');
  const [submitting, setSubmitting] = useState(false);

  const handleShare = async () => {
    if (!bookId) {
      Alert.alert('Missing book', 'Book information is missing. Please go back and try again.');
      return;
    }
    if (usingFallback) {
      Alert.alert(
        'Using approximate location',
        'Your GPS location could not be obtained. The listing will be placed in Glebe, Ottawa. You can update it later.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share anyway', onPress: doShare },
        ]
      );
      return;
    }
    await doShare();
  };

  const doShare = async () => {
    setSubmitting(true);
    try {
      await api.createListing({
        book_id: bookId!,
        location,
        condition: condition ?? 'good',
        notes: notes || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Could not create listing', err.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const locationLabel = locationLoading
    ? 'Getting your location…'
    : usingFallback
      ? 'Glebe, Ottawa (approximate — GPS unavailable)'
      : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Pickup & timing" showBack />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Book summary */}
        {bookTitle ? (
          <View className="bg-cream-100 border border-cream-200 rounded-card p-4">
            <Text className="font-sans-medium text-xs text-ink-500 uppercase tracking-wide mb-1">Listing</Text>
            <Text className="font-serif text-base text-ink-900" numberOfLines={2}>{bookTitle}</Text>
          </View>
        ) : null}

        {/* Permission denied warning */}
        {permissionDenied && (
          <View className="flex-row items-start gap-3 bg-terracotta-50 rounded-card p-4 border border-terracotta-100">
            <AlertTriangle size={16} color="#C8624A" strokeWidth={1.75} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="font-sans-semibold text-sm text-terracotta-500">Location permission denied</Text>
              <Text className="font-sans text-xs text-terracotta-500 mt-0.5 leading-snug">
                Go to Settings → Bookshare → Location → While Using the App, then come back.
              </Text>
            </View>
          </View>
        )}

        {/* Mini map */}
        <View style={styles.map} className="rounded-card border border-cream-200 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridH, { top: `${20 * i}%` as any }]} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridV, { left: `${20 * i}%` as any }]} />
          ))}
          <View style={[styles.pin, usingFallback && styles.pinFallback]} className="rounded-full items-center justify-center">
            <MapPin size={18} color="#fff" strokeWidth={2} fill="#fff" />
          </View>
          {locationLoading && (
            <View style={StyleSheet.absoluteFillObject} className="items-center justify-center bg-black/10">
              <ActivityIndicator color="#3F7C6E" />
            </View>
          )}
        </View>

        {/* Location info */}
        <View className={`flex-row items-center gap-3 rounded-button px-4 py-3.5 border ${usingFallback ? 'bg-terracotta-50 border-terracotta-100' : 'bg-cream-100 border-cream-200'}`}>
          <MapPin size={16} color={usingFallback ? '#C8624A' : '#3F7C6E'} strokeWidth={1.75} />
          <Text className={`flex-1 font-sans text-sm ${usingFallback ? 'text-terracotta-500' : 'text-ink-900'}`}>
            {locationLabel}
          </Text>
        </View>

        {/* Loan duration */}
        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-ink-700">Loan duration</Text>
          <View className="flex-row flex-wrap gap-2">
            {LOAN_DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDuration(d)}
                className={`rounded-pill px-4 py-2 border ${d === duration ? 'bg-teal-500 border-teal-700' : 'bg-cream-100 border-cream-200'}`}
                activeOpacity={0.75}
              >
                <Text className={`font-sans-medium text-sm ${d === duration ? 'text-white' : 'text-ink-700'}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy note */}
        <View className="bg-cream-100 border border-cream-200 rounded-card p-4 gap-1">
          <Text className="font-sans-semibold text-sm text-ink-900">Your privacy</Text>
          <Text className="font-sans text-sm text-ink-500 leading-relaxed">
            Only your neighbourhood is shown on the map. Your exact location is shared only after a borrow request is accepted.
          </Text>
        </View>
      </ScrollView>

      <View className="px-5 py-4 border-t border-cream-200 bg-cream-50">
        <Button
          label={submitting ? 'Sharing…' : 'Share this book'}
          onPress={handleShare}
          disabled={submitting || locationLoading}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: { height: 180, backgroundColor: '#E4EDEA', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  gridH: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#C8D8D4' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: '#C8D8D4' },
  pin: { width: 40, height: 40, backgroundColor: '#3F7C6E', shadowColor: '#1A3530', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  pinFallback: { backgroundColor: '#C8624A' },
});
