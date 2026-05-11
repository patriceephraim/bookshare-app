import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { MapPin, Navigation } from 'lucide-react-native';

const NEIGHBOURHOODS = ['Glebe', 'Centretown', 'Westboro', 'Old Ottawa South', 'Hintonburg', 'ByWard Market'];

export default function LocationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream-50">
      <View className="flex-1 px-8 gap-8 justify-center">
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
          {/* Grid lines */}
          <View style={StyleSheet.absoluteFillObject}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={`h${i}`}
                style={[styles.gridLine, { top: `${20 * i}%` as any }]}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[styles.gridLineV, { left: `${20 * i}%` as any }]}
              />
            ))}
          </View>
          {/* Centre pin */}
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-10 h-10 bg-teal-500 rounded-full items-center justify-center" style={styles.pin}>
              <MapPin size={20} color="#fff" strokeWidth={2} fill="#fff" />
            </View>
            <View className="bg-cream-100 border border-cream-200 rounded-pill px-4 py-2 mt-3">
              <Text className="font-sans-medium text-sm text-ink-900">Glebe, Ottawa</Text>
            </View>
          </View>
        </View>

        {/* Popular neighbourhoods */}
        <View className="gap-3">
          <Text className="font-sans-medium text-sm text-ink-500">Popular in Ottawa</Text>
          <View className="flex-row flex-wrap gap-2">
            {NEIGHBOURHOODS.map((n) => (
              <View key={n} className="bg-cream-100 border border-cream-200 rounded-pill px-4 py-2">
                <Text className="font-sans text-sm text-ink-700">{n}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTAs */}
        <View className="gap-3">
          <Button
            label="Use my current location"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
            size="lg"
          />
          <Button
            label="Set manually"
            variant="ghost"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
            size="lg"
          />
        </View>
      </View>
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
