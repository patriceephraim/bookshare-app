import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_BOOKS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Calendar, MapPin } from 'lucide-react-native';
import { useState } from 'react';

const DURATIONS = ['1 week', '2 weeks', '3 weeks', '4 weeks'];

export default function BorrowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const book = MOCK_BOOKS.find((b) => b.id === id) ?? MOCK_BOOKS[0];
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('3 weeks');

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Request to borrow" showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Book summary */}
        <View className="flex-row items-center gap-4 bg-cream-100 rounded-card p-4 border border-cream-200">
          <View className="w-12 h-18 bg-teal-50 rounded-lg items-center justify-center">
            <Text className="font-serif-bold text-xl text-teal-500">{book.title[0]}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-serif text-base text-ink-900" numberOfLines={2}>{book.title}</Text>
            <Text className="font-sans text-sm text-ink-500">{book.author}</Text>
          </View>
        </View>

        {/* Owner */}
        <View className="gap-2">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Lending from</Text>
          <View className="flex-row items-center gap-3">
            <Avatar initials={book.owner.initials} size="md" colorIndex={1} />
            <View>
              <Text className="font-sans-semibold text-base text-ink-900">{book.owner.name}</Text>
              <View className="flex-row items-center gap-1">
                <MapPin size={11} color="#B5AB99" strokeWidth={1.75} />
                <Text className="font-sans text-sm text-ink-500">{book.owner.neighborhood}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Duration picker */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Calendar size={14} color="#7A6F5E" strokeWidth={1.75} />
            <Text className="font-sans-semibold text-sm text-ink-700">How long do you need it?</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDuration(d)}
                className={`rounded-pill px-4 py-2 border ${
                  duration === d ? 'bg-teal-500 border-teal-700' : 'bg-cream-100 border-cream-200'
                }`}
                activeOpacity={0.75}
              >
                <Text className={`font-sans-medium text-sm ${duration === d ? 'text-white' : 'text-ink-700'}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View className="gap-1.5">
          <Text className="font-sans-medium text-sm text-ink-700">Introduce yourself</Text>
          <View className="bg-cream-100 border border-cream-200 rounded-button px-4 py-3">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Hi! I've been wanting to read this for ages…"
              placeholderTextColor="#B5AB99"
              className="font-sans text-base text-ink-900"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <Text className="font-sans text-xs text-ink-300">
            A friendly note goes a long way. {book.owner.name} can see your profile.
          </Text>
        </View>

        {/* Terms reminder */}
        <View className="bg-teal-50 rounded-card p-4 border border-cream-200">
          <Text className="font-sans text-sm text-teal-900 leading-relaxed">
            By requesting, you agree to return the book in the same condition within your chosen timeframe.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 py-4 border-t border-cream-200 bg-cream-50">
        <Button
          label="Send request"
          onPress={() => router.replace('/(tabs)/activity' as any)}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
