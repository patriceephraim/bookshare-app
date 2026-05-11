import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, MessageCircle, CheckCircle, BookOpen } from 'lucide-react-native';
import { MOCK_LOANS } from '@/lib/mock-data';
import { Header } from '@/components/ui/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StyleSheet } from 'react-native';

function formatDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
}

function daysLeft(due: string | null): number | null {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

const STATUS_CONFIG = {
  pending: { label: 'Pending approval', bg: 'bg-cream-200', text: 'text-ink-700' },
  active: { label: 'Active', bg: 'bg-teal-50', text: 'text-teal-900' },
  returned: { label: 'Returned', bg: 'bg-cream-100', text: 'text-ink-500' },
  declined: { label: 'Declined', bg: 'bg-terracotta-50', text: 'text-terracotta-500' },
};

export default function LoanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const loan = MOCK_LOANS.find((l) => l.id === id) ?? MOCK_LOANS[0];
  const isMyBorrow = loan.borrower.id === 'me';
  const otherPerson = isMyBorrow ? loan.lender : loan.borrower;
  const days = daysLeft(loan.dueDate);
  const isOverdue = days !== null && days < 0;
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
            <Text className="font-serif-bold text-2xl text-teal-500">{loan.book.title[0]}</Text>
          </View>
          <View className="flex-1 justify-center gap-1">
            <Text className="font-serif text-lg text-ink-900" numberOfLines={2}>{loan.book.title}</Text>
            <Text className="font-sans text-sm text-ink-500">{loan.book.author}</Text>
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
              <Avatar initials={otherPerson.initials} size="md" colorIndex={1} />
              <Text className="font-sans-semibold text-base text-ink-900">{otherPerson.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/chat/${loan.id}` as any)}
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
            { label: 'Loan started', value: formatDate(loan.startDate), icon: Calendar },
            { label: 'Due back', value: formatDate(loan.dueDate), icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <View key={label} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon size={14} color="#7A6F5E" strokeWidth={1.75} />
                <Text className="font-sans text-sm text-ink-500">{label}</Text>
              </View>
              <Text className="font-sans-semibold text-sm text-ink-900">{value}</Text>
            </View>
          ))}
          {days !== null && loan.status === 'active' && (
            <View className={`rounded-card p-3 ${isOverdue ? 'bg-terracotta-50' : 'bg-teal-50'}`}>
              <Text className={`font-sans-medium text-sm text-center ${isOverdue ? 'text-terracotta-500' : 'text-teal-900'}`}>
                {isOverdue
                  ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue — please return soon`
                  : `${days} day${days !== 1 ? 's' : ''} remaining`}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {loan.status === 'active' && (
          <View className="gap-3">
            <Button
              label={isMyBorrow ? 'Mark as returned' : 'Confirm return'}
              onPress={() => {}}
              fullWidth
            />
            <Button label="Report an issue" variant="ghost" danger fullWidth onPress={() => {}} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
