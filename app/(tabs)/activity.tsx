import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, MessageCircle } from 'lucide-react-native';
import { useApi, LoanPublic, UserMe } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityScreen() {
  const router = useRouter();
  const api = useApi();

  const [loans, setLoans] = useState<LoanPublic[]>([]);
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    try {
      const [l, m] = await Promise.all([api.getMyLoans(), api.getMe()]);
      setLoans(l);
      setMe(m);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not load activity.');
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

  async function handleAccept(loanId: string) {
    setActing(loanId);
    try {
      const updated = await api.acceptLoan(loanId);
      setLoans(prev => prev.map(l => l.id === loanId ? updated : l));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not accept.');
    } finally {
      setActing(null);
    }
  }

  async function handleDecline(loanId: string) {
    setActing(loanId);
    try {
      const updated = await api.declineLoan(loanId);
      setLoans(prev => prev.map(l => l.id === loanId ? updated : l));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not decline.');
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center" edges={['top']}>
        <ActivityIndicator color="#3F7C6E" />
      </SafeAreaView>
    );
  }

  const myId = me?.id ?? '';

  // Loans where I am the lender and status is still "requested"
  const incomingRequests = loans.filter(l => l.lender.id === myId && l.status === 'requested');
  // Active loans (either side)
  const activeLoans = loans.filter(l => l.status === 'active');
  // All loans that have messages visible (all non-declined, for thread list)
  const threads = loans.filter(l => l.status !== 'declined');

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3F7C6E" />}
      >
        <View className="px-5 pt-4 pb-2">
          <Text className="font-serif text-2xl text-ink-900">Activity</Text>
        </View>

        {/* Incoming borrow requests */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">
              Requests for your books
            </Text>
            {incomingRequests.length > 0 && (
              <View className="bg-terracotta-50 rounded-pill px-2.5 py-0.5">
                <Text className="font-sans-semibold text-xs text-terracotta-500">{incomingRequests.length}</Text>
              </View>
            )}
          </View>

          {incomingRequests.length === 0 ? (
            <View className="px-5">
              <EmptyState
                icon={Bell}
                title="No requests"
                message="When someone wants to borrow your book, you'll see it here."
              />
            </View>
          ) : (
            incomingRequests.map((loan) => {
              const initials = loan.borrower.username.slice(0, 2).toUpperCase();
              const busy = acting === loan.id;
              return (
                <View key={loan.id} className="mx-5 mb-3 bg-cream-100 rounded-card p-4 border border-cream-200 gap-3">
                  <View className="flex-row items-start gap-3">
                    <Avatar initials={initials} size="md" colorIndex={1} />
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-sm text-ink-900">
                        @{loan.borrower.username} wants to borrow
                      </Text>
                      <Text className="font-serif text-base text-ink-900 mt-0.5" numberOfLines={1}>
                        {loan.listing.book.title}
                      </Text>
                      {loan.message ? (
                        <Text className="font-sans text-sm text-ink-500 mt-1 leading-snug" numberOfLines={2}>
                          "{loan.message}"
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      label={busy ? '…' : 'Accept'}
                      variant="primary"
                      size="sm"
                      onPress={() => handleAccept(loan.id)}
                    />
                    <Button
                      label={busy ? '…' : 'Decline'}
                      variant="outline"
                      size="sm"
                      danger
                      onPress={() => handleDecline(loan.id)}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Active loans */}
        <View className="mt-6">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide px-5 mb-3">
            Active loans
          </Text>
          {activeLoans.length === 0 ? (
            <View className="px-5">
              <EmptyState
                icon={Bell}
                title="No active loans"
                message="Accept a request or borrow a book to see active loans here."
              />
            </View>
          ) : (
            activeLoans.map((loan) => {
              const isMyBorrow = loan.borrower.id === myId;
              const other = isMyBorrow ? loan.lender : loan.borrower;
              const initials = other.username.slice(0, 2).toUpperCase();
              return (
                <TouchableOpacity
                  key={loan.id}
                  onPress={() => router.push(`/loan/${loan.id}` as any)}
                  className="mx-5 mb-3 bg-cream-100 rounded-card p-4 border border-cream-200"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-3">
                    <Avatar initials={initials} size="md" colorIndex={0} />
                    <View className="flex-1">
                      <Text className="font-serif text-base text-ink-900" numberOfLines={1}>
                        {loan.listing.book.title}
                      </Text>
                      <Text className="font-sans text-sm text-ink-500 mt-0.5">
                        {isMyBorrow ? 'from' : 'to'} @{other.username}
                      </Text>
                    </View>
                    <View className="bg-teal-50 rounded-pill px-3 py-1">
                      <Text className="font-sans-medium text-xs text-teal-900">Active</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Message threads */}
        <View className="mt-6">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide px-5 mb-3">
            Messages
          </Text>
          {threads.length === 0 ? (
            <View className="px-5">
              <EmptyState
                icon={MessageCircle}
                title="No messages"
                message="Message threads with lenders and borrowers appear here."
              />
            </View>
          ) : (
            threads.map((loan) => {
              const isMyBorrow = loan.borrower.id === myId;
              const other = isMyBorrow ? loan.lender : loan.borrower;
              const initials = other.username.slice(0, 2).toUpperCase();
              return (
                <TouchableOpacity
                  key={loan.id}
                  onPress={() => router.push(`/chat/${loan.id}` as any)}
                  className="mx-5 mb-2 flex-row items-center gap-3 py-3 border-b border-cream-200"
                  activeOpacity={0.7}
                >
                  <Avatar initials={initials} size="md" colorIndex={2} />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-sans-semibold text-sm text-ink-900">@{other.username}</Text>
                      <Text className="font-sans text-xs text-ink-300">{timeAgo(loan.requested_at)}</Text>
                    </View>
                    <Text className="font-serif text-sm text-ink-500 mt-0.5" numberOfLines={1}>
                      re: {loan.listing.book.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
