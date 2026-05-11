import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, MessageCircle, Check, X } from 'lucide-react-native';
import { MOCK_REQUESTS, MOCK_LOANS, MOCK_CHAT_THREADS } from '@/lib/mock-data';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ActivityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 pt-4 pb-2">
          <Text className="font-serif text-2xl text-ink-900">Activity</Text>
        </View>

        {/* Borrow requests */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide">
              Requests for your books
            </Text>
            {MOCK_REQUESTS.length > 0 && (
              <View className="bg-terracotta-50 rounded-pill px-2.5 py-0.5">
                <Text className="font-sans-semibold text-xs text-terracotta-500">{MOCK_REQUESTS.length}</Text>
              </View>
            )}
          </View>

          {MOCK_REQUESTS.length === 0 ? (
            <View className="px-5">
              <EmptyState
                icon={Bell}
                title="No requests"
                message="When someone wants to borrow your book, you'll see it here."
              />
            </View>
          ) : (
            <View className="gap-0">
              {MOCK_REQUESTS.map((req) => (
                <View key={req.id} className="mx-5 mb-3 bg-cream-100 rounded-card p-4 border border-cream-200 gap-3">
                  <View className="flex-row items-start gap-3">
                    <Avatar initials={req.requester.initials} size="md" colorIndex={1} />
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-sm text-ink-900">
                        {req.requester.name} wants to borrow
                      </Text>
                      <Text className="font-serif text-base text-ink-900 mt-0.5" numberOfLines={1}>
                        {req.book.title}
                      </Text>
                      <Text className="font-sans text-sm text-ink-500 mt-1 leading-snug">
                        "{req.message}"
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Button label="Accept" variant="primary" size="sm" onPress={() => {}} />
                    <Button label="Decline" variant="outline" size="sm" danger onPress={() => {}} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Active loans */}
        <View className="mt-6">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide px-5 mb-3">
            Active loans
          </Text>
          {MOCK_LOANS.map((loan) => {
            const days = loan.dueDate ? daysUntil(loan.dueDate) : null;
            const isOverdue = days !== null && days < 0;
            const isMyBorrow = loan.borrower.id === 'me';
            const otherPerson = isMyBorrow ? loan.lender : loan.borrower;

            return (
              <TouchableOpacity
                key={loan.id}
                onPress={() => router.push(`/loan/${loan.id}`)}
                className="mx-5 mb-3 bg-cream-100 rounded-card p-4 border border-cream-200"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <Avatar initials={otherPerson.initials} size="md" colorIndex={0} />
                  <View className="flex-1">
                    <Text className="font-serif text-base text-ink-900" numberOfLines={1}>
                      {loan.book.title}
                    </Text>
                    <Text className="font-sans text-sm text-ink-500 mt-0.5">
                      {isMyBorrow ? 'from' : 'to'} {otherPerson.name}
                    </Text>
                  </View>
                  {days !== null && (
                    <View className={`rounded-pill px-3 py-1 ${isOverdue ? 'bg-terracotta-50' : 'bg-teal-50'}`}>
                      <Text className={`font-sans-medium text-xs ${isOverdue ? 'text-terracotta-500' : 'text-teal-900'}`}>
                        {isOverdue ? `${Math.abs(days)}d late` : `${days}d left`}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Messages */}
        <View className="mt-6">
          <Text className="font-sans-semibold text-sm text-ink-500 uppercase tracking-wide px-5 mb-3">
            Messages
          </Text>
          {MOCK_CHAT_THREADS.map((thread) => (
            <TouchableOpacity
              key={thread.loanId}
              onPress={() => router.push(`/chat/${thread.loanId}`)}
              className="mx-5 mb-2 flex-row items-center gap-3 py-3 border-b border-cream-200"
              activeOpacity={0.7}
            >
              <View className="relative">
                <Avatar initials={thread.otherUser.initials} size="md" colorIndex={2} />
                {thread.unread && (
                  <View className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-terracotta-500 rounded-full border-2 border-cream-50" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-semibold text-sm text-ink-900">{thread.otherUser.name}</Text>
                  <Text className="font-sans text-xs text-ink-300">May 10</Text>
                </View>
                <Text className="font-serif text-sm text-ink-500 mt-0.5" numberOfLines={1}>
                  re: {thread.book.title}
                </Text>
                <Text className="font-sans text-sm text-ink-500 mt-0.5" numberOfLines={1}>
                  {thread.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
