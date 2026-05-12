import { useState, useRef } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApi, ListingNearby, distanceLabel, conditionLabel } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusPill } from '@/components/ui/StatusPill';

const RECENT_SEARCHES = ['Ishiguro', 'climate fiction', 'short stories', 'cozy mystery'];
const SUGGESTED_GENRES = ['Literary Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Non-fiction', 'Historical'];

function pillStatus(s: string): 'available' | 'on-loan' {
  return s === 'available' ? 'available' : 'on-loan';
}

export default function SearchScreen() {
  const router = useRouter();
  const api = useApi();
  const { location } = useLocation();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ListingNearby[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.semanticSearch(q.trim(), location.lat, location.lng);
        setResults(res);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleChange = (text: string) => {
    setQuery(text);
    runSearch(text);
  };

  const handleSubmit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    setSearching(true);
    api.semanticSearch(query.trim(), location.lat, location.lng)
      .then(res => { setResults(res); setSearched(true); })
      .catch(() => { setResults([]); setSearched(true); })
      .finally(() => setSearching(false));
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const showResults = searched || searching;

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Search bar */}
      <View className="px-5 pt-2 pb-4 border-b border-cream-200 gap-1">
        <Text className="font-serif text-2xl text-ink-900 mb-2">Search</Text>
        <View className="flex-row items-center gap-3 bg-cream-100 border border-cream-200 rounded-button px-4 py-3">
          <Search size={16} color={focused ? '#3F7C6E' : '#B5AB99'} strokeWidth={1.75} />
          <TextInput
            value={query}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={handleSubmit}
            placeholder="Title, author, or vibe…"
            placeholderTextColor="#B5AB99"
            className="flex-1 font-sans text-base text-ink-900"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clear} activeOpacity={0.7}>
              <X size={16} color="#B5AB99" strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Sparkles size={11} color="#3F7C6E" strokeWidth={1.75} />
          <Text className="font-sans text-xs text-teal-500">Powered by semantic search</Text>
        </View>
      </View>

      {!showResults ? (
        /* Discovery state */
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={null}
          ListHeaderComponent={
            <View className="px-5 pt-6 gap-8">
              <View className="gap-3">
                <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Recent</Text>
                <View className="gap-2">
                  {RECENT_SEARCHES.map((s) => (
                    <TouchableOpacity key={s} onPress={() => { setQuery(s); runSearch(s); }} className="flex-row items-center gap-3 py-2" activeOpacity={0.7}>
                      <Search size={15} color="#B5AB99" strokeWidth={1.75} />
                      <Text className="font-sans text-base text-ink-700">{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="gap-3">
                <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Browse</Text>
                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTED_GENRES.map((g) => (
                    <TouchableOpacity key={g} onPress={() => { setQuery(g); runSearch(g); }} className="bg-cream-100 border border-cream-200 rounded-pill px-4 py-2" activeOpacity={0.7}>
                      <Text className="font-sans-medium text-sm text-ink-700">{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : searching ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#3F7C6E" />
          <Text className="font-sans text-sm text-ink-500">Searching nearby books…</Text>
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          message={`No books nearby match "${query}". Try a different title, author, or vibe.`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/listing/${item.id}` as any)}
              className="flex-row items-center gap-4 py-3 border-b border-cream-200 px-5"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-teal-50 rounded-lg items-center justify-center">
                <Text className="font-serif-bold text-base text-teal-500">{item.book.title[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-serif text-base text-ink-900" numberOfLines={1}>{item.book.title}</Text>
                <Text className="font-sans text-sm text-ink-500">
                  {item.book.author} · {distanceLabel(item.distance_meters)} · {conditionLabel(item.condition)}
                </Text>
              </View>
              <StatusPill status={pillStatus(item.status)} />
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text className="font-sans text-sm text-ink-500 px-5 pt-4 pb-2">
              {results.length} result{results.length !== 1 ? 's' : ''} near you for "{query}"
            </Text>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
