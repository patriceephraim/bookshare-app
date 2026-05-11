import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, BookOpen, Users, Star } from 'lucide-react-native';
import { ME, MOCK_MY_BOOKS, MOCK_BOOKS } from '@/lib/mock-data';
import { Avatar } from '@/components/ui/Avatar';
import { BookCard } from '@/components/ui/BookCard';
import { Header } from '@/components/ui/Header';

const BADGES = [
  { label: 'Early adopter', icon: Star },
  { label: 'Generous sharer', icon: BookOpen },
  { label: 'Good neighbour', icon: Users },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header
        title="Profile"
        showBack
        right={
          <TouchableOpacity onPress={() => router.push('/settings')} activeOpacity={0.7}>
            <Settings size={20} color="#7A6F5E" strokeWidth={1.75} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero */}
        <View className="items-center px-5 pt-6 pb-6 border-b border-cream-200 gap-4">
          <Avatar initials={ME.initials} size="xl" colorIndex={0} />
          <View className="items-center gap-1">
            <Text className="font-serif text-2xl text-ink-900">{ME.name}</Text>
            <Text className="font-sans text-sm text-ink-500">{ME.neighborhood}</Text>
            <Text className="font-sans text-xs text-ink-300">Member since {ME.memberSince}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 w-full">
            {[
              { value: ME.booksShared, label: 'Shared' },
              { value: ME.booksBorrowed, label: 'Borrowed' },
              { value: '4.9', label: 'Rating' },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-cream-100 rounded-card p-4 items-center border border-cream-200">
                <Text className="font-serif-bold text-2xl text-ink-900">{stat.value}</Text>
                <Text className="font-sans text-xs text-ink-500 mt-0.5">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        <View className="px-5 pt-6 gap-3">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Badges</Text>
          <View className="flex-row gap-2 flex-wrap">
            {BADGES.map((badge) => (
              <View key={badge.label} className="flex-row items-center gap-2 bg-cream-100 border border-cream-200 rounded-pill px-4 py-2">
                <badge.icon size={13} color="#3F7C6E" strokeWidth={1.75} />
                <Text className="font-sans-medium text-xs text-ink-700">{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My books */}
        <View className="px-5 pt-6 gap-3">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">
              My books
            </Text>
            <Text className="font-sans text-sm text-teal-500">{MOCK_MY_BOOKS.length} listed</Text>
          </View>
          {MOCK_MY_BOOKS.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={() => router.push(`/listing/${book.id}` as any)}
              showDistance={false}
            />
          ))}
        </View>

        {/* Reviews */}
        <View className="px-5 pt-6 gap-3">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Reviews</Text>
          {[
            {
              initials: 'LR',
              name: 'Leila R.',
              text: 'Super reliable — book was in exactly the condition described. Would borrow again!',
              colorIdx: 2,
            },
            {
              initials: 'JK',
              name: 'James K.',
              text: 'Great communicator, easy pickup, book came back spotless.',
              colorIdx: 1,
            },
          ].map((review) => (
            <View key={review.initials} className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-3">
              <View className="flex-row items-center gap-3">
                <Avatar initials={review.initials} size="sm" colorIndex={review.colorIdx} />
                <Text className="font-sans-semibold text-sm text-ink-900">{review.name}</Text>
                <View className="flex-row gap-0.5 ml-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} color="#3F7C6E" strokeWidth={0} fill="#3F7C6E" />
                  ))}
                </View>
              </View>
              <Text className="font-sans text-sm text-ink-700 leading-relaxed">"{review.text}"</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
