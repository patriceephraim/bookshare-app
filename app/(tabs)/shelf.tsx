import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { BookOpen, Plus } from 'lucide-react-native';
import { useApi, ListingPublic, LoanPublic, UserMe, conditionLabel } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusPill } from '@/components/ui/StatusPill';

type Tab = 'mine' | 'borrowed';

function pillStatus(s: string): 'available' | 'on-loan' {
  return s === 'available' ? 'available' : 'on-loan';
}

function ListingRow({ listing, onPress }: { listing: ListingPublic; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
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
        <View className="flex-row items-center gap-2 mt-1 flex-wrap">
          <StatusPill status={pillStatus(listing.status)} />
          <Text className="font-sans text-xs text-ink-300">{conditionLabel(listing.condition)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ShelfScreen() {
  const router = useRouter();
  const api = useApi();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<Tab>('mine');
  const [me, setMe] = useState<UserMe | null>(null);
  const [myListings, setMyListings] = useState<ListingPublic[]>([]);
  const [loans, setLoans] = useState<LoanPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [m, listings, ls] = await Promise.all([
        api.getMe(),
        api.getMyListings(),
        api.getMyLoans(),
      ]);
      setMe(m);
      setMyListings(listings);
      setLoans(ls);
    } catch {
      // show whatever loaded
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const myId = me?.id ?? '';
  const borrowedLoans = loans.filter(l => l.borrower.id === myId && l.status === 'active');
  const activeLoansCount = loans.filter(
    l => (l.borrower.id === myId || l.lender.id === myId) && l.status === 'active'
  ).length;
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase()
    || me?.username?.slice(0, 2).toUpperCase()
    || user?.username?.slice(0, 2).toUpperCase()
    || '?';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center" edges={['top']}>
        <ActivityIndicator color="#3F7C6E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3F7C6E" />}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-5 border-b border-cream-200">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="font-serif text-2xl text-ink-900">My Shelf</Text>
              <Text className="font-sans text-sm text-ink-500">Glebe, Ottawa</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8}>
              <Avatar initials={initials} size="md" colorIndex={0} />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4 mt-5">
            {[
              { value: myListings.length, label: 'shared' },
              { value: borrowedLoans.length, label: 'borrowed' },
              { value: activeLoansCount, label: 'active loans' },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-cream-100 rounded-card p-3 items-center border border-cream-200">
                <Text className="font-serif-bold text-2xl text-ink-900">{stat.value}</Text>
                <Text className="font-sans text-xs text-ink-500 mt-0.5">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-cream-200 bg-cream-50">
          {(['mine', 'borrowed'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              className="flex-1 py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text className={`font-sans-semibold text-sm ${activeTab === t ? 'text-teal-500' : 'text-ink-300'}`}>
                {t === 'mine' ? 'My Books' : 'Borrowed'}
              </Text>
              {activeTab === t && (
                <View className="absolute bottom-0 left-8 right-8 h-0.5 bg-teal-500 rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View className="px-5 pt-5 gap-3">
          {activeTab === 'mine' ? (
            myListings.length > 0 ? (
              <>
                {myListings.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    onPress={() => router.push(`/listing/${listing.id}` as any)}
                  />
                ))}
                <TouchableOpacity
                  onPress={() => router.push('/add-book/camera')}
                  className="flex-row items-center justify-center gap-3 border border-dashed border-cream-200 rounded-card py-4"
                  activeOpacity={0.7}
                >
                  <Plus size={16} color="#B5AB99" strokeWidth={1.75} />
                  <Text className="font-sans-medium text-sm text-ink-300">Add another book</Text>
                </TouchableOpacity>
              </>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Your shelf is empty"
                message="Share the books sitting on your shelf with neighbours who'll actually read them."
                action={
                  <Button label="Add your first book" onPress={() => router.push('/add-book/camera')} />
                }
              />
            )
          ) : borrowedLoans.length > 0 ? (
            borrowedLoans.map((loan) => (
              <ListingRow
                key={loan.id}
                listing={loan.listing}
                onPress={() => router.push(`/loan/${loan.id}` as any)}
              />
            ))
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Nothing borrowed yet"
              message="Browse the map and request a book from a neighbour to get started."
            />
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      {activeTab === 'mine' && (
        <TouchableOpacity
          onPress={() => router.push('/add-book/camera')}
          className="absolute bottom-8 right-6 w-14 h-14 bg-teal-500 rounded-full items-center justify-center"
          style={{
            shadowColor: '#1A3530',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          } as any}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
