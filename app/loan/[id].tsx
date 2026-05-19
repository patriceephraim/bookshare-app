import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, MessageCircle } from 'lucide-react-native';
import { useApi, LoanPublic, UserMe } from '@/lib/api';
import { Header } from '@/components/ui/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

function formatDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
}

const STATUS_CONFIG = {
  requested: { label: 'Pending approval', bg: 'bg-cream-200', text: 'text-ink-700' },
  active: { label: 'Active', bg: 'bg-teal-50', text: 'text-teal-900' },
  returned: { label: 'Returned', bg: 'bg-cream-100', text: 'text-ink-500' },
  declined: { label: 'Declined', bg: 'bg-terracotta-50', text: 'text-terracotta-500' },
};

export default function LoanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();

  const [loan, setLoan] = useState<LoanPublic | null>(null);
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getLoan(id), api.getMe()])
      .then(([l, m]) => { setLoan(l); setMe(m); })
      .catch(e => Alert.alert('Error', e.message ?? 'Could not load loan.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReturn() {
    if (!loan) return;
    setActing(true);
    try {
      const updated = await api.returnLoan(loan.id);
      setLoan(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not mark as returned.');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center" edges={['bottom']}>
        <ActivityIndicator color="#3F7C6E" />
      </SafeAreaView>
    );
  }

  if (!loan || !me) {
    return (
      <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
        <Header title="Loan details" showBack />
        <View className="flex-1 items-center justify-center">
          <Text className="font-serif text-lg text-ink-900">Loan not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isMyBorrow = loan.borrower.id === me.id;
  const otherPerson = isMyBorrow ? loan.lender : loan.borrower;
  const otherInitials = otherPerson.username.slice(0, 2).toUpperCase();
  const config = STATUS_CONFIG[loan.status];

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Loan details" showBack />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Book card */}
        <View className="flex-row gap-4 bg-cream-100 rounded-card p-4 border border-cream-200">
          <View className="w-14 h-20 bg-teal-50 rounded-lg items-center justify-center">
            <Text className="font-serif-bold text-2xl text-teal-500">{loan.listing.book.title[0]}</Text>
          </View>
          <View className="flex-1 justify-center gap-1">
            <Text className="font-serif text-lg text-ink-900" numberOfLines={2}>{loan.listing.book.title}</Text>
            <Text className="font-sans text-sm text-ink-500">{loan.listing.book.author}</Text>
            <View className={`self-start rounded-pill px-3 py-1 mt-1 ${config.bg}`}>
              <Text className={`font-sans-medium text-xs ${config.text}`}>{config.label}</Text>
            </View>
          </View>
        </View>

        {/* Other party */}
        <View className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-3">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">
            {isMyBorrow ? 'Lender' : 'Borrower'}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Avatar initials={otherInitials} size="md" colorIndex={1} />
              <Text className="font-sans-semibold text-base text-ink-900">@{otherPerson.username}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${otherPerson.id}` as any)}
              className="flex-row items-center gap-2 bg-cream-50 border border-cream-200 rounded-button px-4 py-2"
              activeOpacity={0.7}
            >
              <MessageCircle size={14} color="#3F7C6E" strokeWidth={1.75} />
              <Text className="font-sans-medium text-sm text-teal-500">Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dates */}
        <View className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-4">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">Timeline</Text>
          {[
            { label: 'Requested', value: formatDate(loan.requested_at) },
            { label: 'Accepted', value: formatDate(loan.accepted_at) },
            { label: 'Returned', value: formatDate(loan.returned_at) },
          ].map(({ label, value }) => (
            <View key={label} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Calendar size={14} color="#7A6F5E" strokeWidth={1.75} />
                <Text className="font-sans text-sm text-ink-500">{label}</Text>
              </View>
              <Text className="font-sans-semibold text-sm text-ink-900">{value}</Text>
            </View>
          ))}
        </View>

        {loan.message ? (
          <View className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-1">
            <Text className="font-sans-semibold text-sm text-ink-700">Request message</Text>
            <Text className="font-sans text-sm text-ink-500 leading-relaxed">"{loan.message}"</Text>
          </View>
        ) : null}

        {/* Actions */}
        {loan.status === 'active' && (
          <Button
            label={acting ? 'Updating…' : (isMyBorrow ? 'Mark as returned' : 'Confirm return')}
            onPress={handleReturn}
            fullWidth
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
