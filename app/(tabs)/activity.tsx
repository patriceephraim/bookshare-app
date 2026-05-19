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

interface ThreadItem {
  loan: LoanPublic;
  other: { id: string; username: string };
  lastMessageAt: string;
}

const LOAN_PILL: Record<LoanPublic['status'], { bg: string; text: string; label: string }> = {
  requested: { bg: 'bg-cream-200',      text: 'text-ink-500',           label: 'Pending'  },
  active:    { bg: 'bg-teal-50',        text: 'text-teal-900',          label: 'Active'   },
  returned:  { bg: 'bg-cream-200',      text: 'text-ink-400',           label: 'Returned' },
  declined:  { bg: 'bg-terracotta-50',  text: 'text-terracotta-500',    label: 'Declined' },
};

function LoanStatusPill({ status }: { status: LoanPublic['status'] }) {
  const cfg = LOAN_PILL[status];
  return (
    <View className={`${cfg.bg} rounded-pill px-2 py-0.5`}>
      <Text className={`font-sans-medium text-xs ${cfg.text}`}>{cfg.label}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const api = useApi();

  const [loans, setLoans] = useState<LoanPublic[]>([]);
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  // Maps loan.id → ISO timestamp of the most recent message (or requested_at fallback)
  const [lastMsgMap, setLastMsgMap] = useState<Record<string, string>>({});

  async function load() {
    try {
      const [loansData, meData] = await Promise.all([api.getMyLoans(), api.getMe()]);
      setLoans(loansData);
      setMe(meData);

      // N+1 fetch of last-message timestamps — fine for v1 with ~10 loans
      const eligible = loansData.filter(l => l.status !== 'declined');
      const times = await Promise.all(
        eligible.map(async loan => {
          try {
            const msgs = await api.getLoanMessages(loan.id);
            const last = msgs.length > 0 ? msgs[msgs.length - 1].created_at : null;
            return [loan.id, last ?? loan.requested_at] as const;
          } catch {
            return [loan.id, loan.requested_at] as const;
          }
        })
      );
      setLastMsgMap(Object.fromEntries(times));
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

  const incomingRequests = loans.filter(l => l.lender.id === myId && l.status === 'requested');
  const activeLoans = loans.filter(l => l.status === 'active');

  // One row per other_user — all loans with the same person collapse into one thread.
  // Representative loan chosen by status priority: active > requested > returned.
  const STATUS_PRIORITY: Record<LoanPublic['status'], number> = {
    active: 0, requested: 1, returned: 2, declined: 3,
  };

  const groupMap = new Map<string, LoanPublic[]>();
  for (const loan of loans.filter(l => l.status !== 'declined')) {
    const other = loan.borrower.id === myId ? loan.lender : loan.borrower;
    if (!groupMap.has(other.id)) groupMap.set(other.id, []);
    groupMap.get(other.id)!.push(loan);
  }

  const threads: ThreadItem[] = Array.from(groupMap.values())
    .map(group => {
      // Pick the most "in-progress" loan: active first, then requested, then returned.
      const loan = group.slice().sort((a, b) => {
        const p = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        return p !== 0 ? p : new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime();
      })[0];
      const other = loan.borrower.id === myId ? loan.lender : loan.borrower;
      // lastMessageAt: max across all loans in the group (latest conversation wins)
      const lastAt = group
        .map(l => lastMsgMap[l.id] ?? l.requested_at)
        .reduce((max, t) => (t > max ? t : max));
      return { loan, other, lastMessageAt: lastAt };
    })
    .sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

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
                    <Button label={busy ? '…' : 'Accept'} variant="primary" size="sm" onPress={() => handleAccept(loan.id)} />
                    <Button label={busy ? '…' : 'Decline'} variant="outline" size="sm" danger onPress={() => handleDecline(loan.id)} />
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

        {/* Message threads — deduplicated by (other_user, listing), sorted by last message time */}
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
            threads.map((thread) => {
              const initials = thread.other.username.slice(0, 2).toUpperCase();
              return (
                <TouchableOpacity
                  key={`${thread.other.id}::${thread.loan.listing.id}`}
                  onPress={() => router.push(`/chat/${thread.other.id}` as any)}
                  className="mx-5 mb-2 flex-row items-center gap-3 py-3 border-b border-cream-200"
                  activeOpacity={0.7}
                >
                  <Avatar initials={initials} size="md" colorIndex={2} />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-sans-semibold text-sm text-ink-900">@{thread.other.username}</Text>
                      <View className="flex-row items-center gap-2">
                        <LoanStatusPill status={thread.loan.status} />
                        <Text className="font-sans text-xs text-ink-300">{timeAgo(thread.lastMessageAt)}</Text>
                      </View>
                    </View>
                    <Text className="font-serif text-sm text-ink-500 mt-0.5" numberOfLines={1}>
                      re: {thread.loan.listing.book.title}
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
