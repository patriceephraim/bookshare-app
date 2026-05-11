import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MOCK_BOOKS } from '@/lib/mock-data';
import { BookCard } from '@/components/ui/BookCard';
import { EmptyState } from '@/components/ui/EmptyState';

const RECENT_SEARCHES = ['Ishiguro', 'climate fiction', 'short stories', 'Octavia Butler'];
const SUGGESTED_GENRES = ['Literary Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Non-fiction', 'Historical'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = query.trim().length > 0
    ? MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase()) ||
          b.genre.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const showResults = query.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Search bar */}
      <View className="px-5 pt-2 pb-4 border-b border-cream-200 gap-1">
        <Text className="font-serif text-2xl text-ink-900 mb-2">Search</Text>
        <View className="flex-row items-center gap-3 bg-cream-100 border border-cream-200 rounded-button px-4 py-3">
          <Search size={16} color={focused ? '#3F7C6E' : '#B5AB99'} strokeWidth={1.75} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Title, author, or vibe…"
            placeholderTextColor="#B5AB99"
            className="flex-1 font-sans text-base text-ink-900"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <X size={16} color="#B5AB99" strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </View>
        {/* Semantic search label */}
        <View className="flex-row items-center gap-1.5 mt-1">
          <Sparkles size={11} color="#3F7C6E" strokeWidth={1.75} />
          <Text className="font-sans text-xs text-teal-500">Powered by semantic search</Text>
        </View>
      </View>

      {!showResults ? (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={null}
          ListHeaderComponent={
            <View className="px-5 pt-6 gap-8">
              {/* Recent */}
              <View className="gap-3">
                <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Recent</Text>
                <View className="gap-2">
                  {RECENT_SEARCHES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setQuery(s)}
                      className="flex-row items-center gap-3 py-2"
                      activeOpacity={0.7}
                    >
                      <Search size={15} color="#B5AB99" strokeWidth={1.75} />
                      <Text className="font-sans text-base text-ink-700">{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Browse genres */}
              <View className="gap-3">
                <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Browse</Text>
                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTED_GENRES.map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setQuery(g)}
                      className="bg-cream-100 border border-cream-200 rounded-pill px-4 py-2"
                      activeOpacity={0.7}
                    >
                      <Text className="font-sans-medium text-sm text-ink-700">{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Popular nearby */}
              <View className="gap-3">
                <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">
                  Popular nearby
                </Text>
                <View className="gap-3">
                  {MOCK_BOOKS.slice(0, 3).map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onPress={() => router.push(`/listing/${book.id}`)}
                    />
                  ))}
                </View>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          message={`No books nearby match "${query}". Try a different title, author, or genre.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => router.push(`/listing/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListHeaderComponent={
            <Text className="font-sans text-sm text-ink-500 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
