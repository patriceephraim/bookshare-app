import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, RefreshCw } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useApi, ListingPublic, UserMe, conditionLabel } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Header } from '@/components/ui/Header';
import { StatusPill } from '@/components/ui/StatusPill';

function pillStatus(s: string): 'available' | 'on-loan' {
  return s === 'available' ? 'available' : 'on-loan';
}

export default function ProfileScreen() {
  const router = useRouter();
  const api = useApi();
  const { user } = useUser();

  const [me, setMe] = useState<UserMe | null>(null);
  const [listings, setListings] = useState<ListingPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [meError, setMeError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMeError(null);

    // Fire both independently — one failure shouldn't blank the other
    const [meResult, listingsResult] = await Promise.allSettled([
      api.getMe(),
      api.getMyListings(),
    ]);

    if (meResult.status === 'fulfilled') {
      setMe(meResult.value);
    } else {
      setMeError('Could not load profile. Is the server running?');
    }

    if (listingsResult.status === 'fulfilled') {
      setListings(listingsResult.value);
    }

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center" edges={['bottom']}>
        <ActivityIndicator color="#3F7C6E" />
      </SafeAreaView>
    );
  }

  if (meError && !me) {
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
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-serif text-xl text-ink-900 text-center">Could not load profile</Text>
          <Text className="font-sans text-sm text-ink-500 text-center">
            Make sure the backend is running at the correct address.
          </Text>
          <TouchableOpacity
            onPress={load}
            className="flex-row items-center gap-2 bg-teal-500 rounded-button px-5 py-3"
            activeOpacity={0.8}
          >
            <RefreshCw size={14} color="#fff" strokeWidth={2} />
            <Text className="font-sans-semibold text-sm text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase()
    || me?.username?.slice(0, 2).toUpperCase()
    || '?';
  const memberSince = me?.created_at
    ? new Date(me.created_at).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
    : '—';

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hero */}
        <View className="items-center px-5 pt-6 pb-6 border-b border-cream-200 gap-4">
          <Avatar initials={initials} size="xl" colorIndex={0} />
          <View className="items-center gap-1">
            <Text className="font-serif text-2xl text-ink-900">
              {me?.username ? `@${me.username}` : '—'}
            </Text>
            <Text className="font-sans text-xs text-ink-300">Member since {memberSince}</Text>
          </View>

          <View className="flex-row gap-4 w-full">
            {[
              { value: listings.length, label: 'Shared' },
              { value: listings.filter(l => l.status === 'on_loan').length, label: 'On loan' },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-cream-100 rounded-card p-4 items-center border border-cream-200">
                <Text className="font-serif-bold text-2xl text-ink-900">{stat.value}</Text>
                <Text className="font-sans text-xs text-ink-500 mt-0.5">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My books */}
        {listings.length > 0 && (
          <View className="px-5 pt-6 gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">My books</Text>
              <Text className="font-sans text-sm text-teal-500">{listings.length} listed</Text>
            </View>
            {listings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                onPress={() => router.push(`/listing/${listing.id}` as any)}
                activeOpacity={0.8}
                className="flex-row gap-4 bg-cream-100 rounded-card p-4 border border-cream-200"
              >
                <View className="w-14 h-20 bg-teal-50 rounded-lg items-center justify-center flex-shrink-0">
                  <Text className="text-teal-500 font-serif-bold text-2xl">{listing.book.title[0]}</Text>
                </View>
                <View className="flex-1 gap-1.5 justify-center">
                  <Text className="font-serif text-base text-ink-900 leading-snug" numberOfLines={2}>
                    {listing.book.title}
                  </Text>
                  <Text className="font-sans text-sm text-ink-500">{listing.book.author}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <StatusPill status={pillStatus(listing.status)} />
                    <Text className="font-sans text-xs text-ink-300">{conditionLabel(listing.condition)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
