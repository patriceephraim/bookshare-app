import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';

const PICKUP_SUGGESTIONS = [
  { id: 'p1', label: 'My front porch', desc: '192 Third Ave, Glebe' },
  { id: 'p2', label: 'Glebe Community Centre', desc: '175 Third Ave, Ottawa' },
  { id: 'p3', label: 'Bank Street Coffee', desc: '858 Bank St, Ottawa' },
];

const LOAN_DURATIONS = ['2 weeks', '3 weeks', '4 weeks', 'Flexible'];

export default function PickupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Pickup & timing" showBack />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mini map */}
        <View style={styles.map} className="rounded-card border border-cream-200 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridH, { top: `${20 * i}%` as any }]} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridV, { left: `${20 * i}%` as any }]} />
          ))}
          <View style={styles.pin} className="bg-teal-500 rounded-full items-center justify-center">
            <MapPin size={18} color="#fff" strokeWidth={2} fill="#fff" />
          </View>
        </View>

        {/* Address field */}
        <View className="gap-1.5">
          <Text className="font-sans-medium text-sm text-ink-700">Pickup address or landmark</Text>
          <View className="flex-row items-center gap-3 bg-cream-100 border border-cream-200 rounded-button px-4 py-3.5">
            <MapPin size={16} color="#B5AB99" strokeWidth={1.75} />
            <TextInput
              placeholder="Street address, building, or landmark"
              placeholderTextColor="#B5AB99"
              className="flex-1 font-sans text-base text-ink-900"
              defaultValue="192 Third Ave, Glebe"
            />
          </View>
        </View>

        {/* Suggestions */}
        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-ink-500">Quick picks</Text>
          {PICKUP_SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              className="flex-row items-center gap-3 bg-cream-100 rounded-card p-4 border border-cream-200"
              activeOpacity={0.75}
            >
              <View className="w-9 h-9 bg-teal-50 rounded-lg items-center justify-center">
                <MapPin size={16} color="#3F7C6E" strokeWidth={1.75} />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-sm text-ink-900">{s.label}</Text>
                <Text className="font-sans text-xs text-ink-500">{s.desc}</Text>
              </View>
              {s.id === 'p1' && (
                <View className="w-5 h-5 bg-teal-500 rounded-full items-center justify-center">
                  <Check size={12} color="#fff" strokeWidth={2.5} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Loan duration */}
        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-ink-700">Loan duration</Text>
          <View className="flex-row flex-wrap gap-2">
            {LOAN_DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                className={`rounded-pill px-4 py-2 border ${
                  d === '3 weeks'
                    ? 'bg-teal-500 border-teal-700'
                    : 'bg-cream-100 border-cream-200'
                }`}
                activeOpacity={0.75}
              >
                <Text
                  className={`font-sans-medium text-sm ${
                    d === '3 weeks' ? 'text-white' : 'text-ink-700'
                  }`}
                >
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
            Only your neighbourhood is shown on the map. Your exact address is shared only after a borrow request is accepted.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 py-4 border-t border-cream-200 bg-cream-50">
        <Button
          label="Share this book"
          onPress={() => router.replace('/(tabs)')}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 180,
    backgroundColor: '#E4EDEA',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C8D8D4',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#C8D8D4',
  },
  pin: {
    width: 40,
    height: 40,
    shadowColor: '#1A3530',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
