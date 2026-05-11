import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, MessageCircle, Share2, Heart } from 'lucide-react-native';
import { MOCK_BOOKS } from '@/lib/mock-data';
import { StatusPill } from '@/components/ui/StatusPill';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';

const coverColors = [
  { bg: '#E8F0EE', text: '#3F7C6E' },
  { bg: '#FBEFE8', text: '#C8624A' },
  { bg: '#EAE0CB', text: '#3D362C' },
  { bg: '#E8F0EE', text: '#2E5C52' },
];

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const book = MOCK_BOOKS.find((b) => b.id === id) ?? MOCK_BOOKS[0];
  const colorIdx = parseInt(book.id, 10) % coverColors.length || 0;
  const color = coverColors[colorIdx];

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header
        title=""
        showBack
        right={
          <View className="flex-row gap-3">
            <TouchableOpacity activeOpacity={0.7}>
              <Heart size={20} color="#7A6F5E" strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Share2 size={20} color="#7A6F5E" strokeWidth={1.75} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover hero */}
        <View
          className="mx-5 mt-2 rounded-card items-center justify-center py-10"
          style={{ backgroundColor: color.bg }}
        >
          <View style={[styles.cover, { backgroundColor: color.bg }]}>
            <Text
              style={[styles.coverLetter, { color: color.text }]}
              className="font-serif-bold"
            >
              {book.title[0]}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View className="px-5 pt-5 gap-4">
          <View className="gap-1">
            <Text className="font-serif text-2xl text-ink-900 leading-snug">{book.title}</Text>
            <Text className="font-sans text-base text-ink-500">{book.author}</Text>
          </View>

          <View className="flex-row items-center gap-3">
            <StatusPill status={book.status} />
            <View className="w-1 h-1 bg-ink-300 rounded-full" />
            <Text className="font-sans text-sm text-ink-500">{book.condition}</Text>
            <View className="w-1 h-1 bg-ink-300 rounded-full" />
            <Text className="font-sans text-sm text-ink-500">{book.genre}</Text>
          </View>

          {/* Description */}
          <View className="bg-cream-100 rounded-card p-4 border border-cream-200">
            <Text className="font-sans text-base text-ink-700 leading-relaxed">{book.description}</Text>
          </View>

          {/* Owner card */}
          <View className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-3">
            <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Shared by</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Avatar initials={book.owner.initials} size="lg" colorIndex={1} />
                <View>
                  <Text className="font-sans-semibold text-base text-ink-900">{book.owner.name}</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MapPin size={11} color="#B5AB99" strokeWidth={1.75} />
                    <Text className="font-sans text-sm text-ink-500">{book.owner.neighborhood}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                className="flex-row items-center gap-2 bg-cream-50 border border-cream-200 rounded-button px-4 py-2"
                activeOpacity={0.7}
              >
                <MessageCircle size={14} color="#3F7C6E" strokeWidth={1.75} />
                <Text className="font-sans-medium text-sm text-teal-500">Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View className="gap-2">
            <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Location</Text>
            <View className="flex-row items-center gap-2">
              <MapPin size={14} color="#3F7C6E" strokeWidth={1.75} />
              <Text className="font-sans text-base text-ink-700">
                {book.distance} away · {book.neighborhood}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-cream-50 border-t border-cream-200" style={styles.footer}>
        {book.status === 'available' ? (
          <Button
            label="Request to borrow"
            onPress={() => router.push(`/listing/${book.id}/borrow` as any)}
            fullWidth
            size="lg"
          />
        ) : (
          <Button
            label="Join the waitlist"
            variant="outline"
            fullWidth
            size="lg"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F1B16',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  coverLetter: {
    fontSize: 72,
    lineHeight: 80,
  },
  footer: {
    shadowColor: '#1F1B16',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
});
