import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi, LoanPublic, MessagePublic, UserMe } from '@/lib/api';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const LOAN_STATUS_LABEL: Record<LoanPublic['status'], string> = {
  requested: 'Pending loan',
  active: 'Active loan',
  returned: 'Returned',
  declined: 'Declined',
};

export default function ChatScreen() {
  // The file is [loanId].tsx so Expo Router captures the segment as "loanId",
  // but we navigate here with the OTHER USER's backend id — treat it as userId.
  const { loanId: userId } = useLocalSearchParams<{ loanId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const api = useApi();
  const flatListRef = useRef<FlatList>(null);

  const [me, setMe] = useState<UserMe | null>(null);
  const [otherUser, setOtherUser] = useState<{ id: string; username: string } | null>(null);
  const [recentLoan, setRecentLoan] = useState<LoanPublic | null>(null);
  const [messages, setMessages] = useState<MessagePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Stable ref so the poll closure always sees current loan ids without re-creating the interval.
  const loanIdsRef = useRef<string[]>([]);
  // The loan to attach new messages to (most recent active, fallback to most recent overall).
  const sendLoanRef = useRef<LoanPublic | null>(null);

  async function fetchMessages(loanIds: string[]): Promise<MessagePublic[]> {
    const arrays = await Promise.all(loanIds.map(id => api.getLoanMessages(id)));
    return arrays
      .flat()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async function loadAll() {
    if (!userId) return;
    const [allLoans, meData] = await Promise.all([api.getMyLoans(), api.getMe()]);
    const myId = meData.id;

    const sharedLoans = allLoans.filter(l => {
      const other = l.borrower.id === myId ? l.lender : l.borrower;
      return other.id === userId && l.status !== 'declined';
    });

    setMe(meData);

    if (sharedLoans.length > 0) {
      const first = sharedLoans[0];
      const other = first.borrower.id === myId ? first.lender : first.borrower;
      setOtherUser(other);

      // Banner loan: prioritize active > requested > returned, then by recency.
      const STATUS_PRIORITY: Record<LoanPublic['status'], number> = {
        active: 0, requested: 1, returned: 2, declined: 3,
      };
      const prioritized = [...sharedLoans].sort((a, b) => {
        const p = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        return p !== 0 ? p : new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime();
      });
      const recent = prioritized[0];
      setRecentLoan(recent);

      // Determine which loan to attach outgoing messages to
      sendLoanRef.current =
        sharedLoans.find(l => l.status === 'active') ?? recent;
    }

    const ids = sharedLoans.map(l => l.id);
    loanIdsRef.current = ids;
    setMessages(await fetchMessages(ids));
  }

  useEffect(() => {
    loadAll()
      .catch(e => Alert.alert('Error', e.message ?? 'Could not load chat.'))
      .finally(() => setLoading(false));
  }, [userId]);

  // Poll every 5 s for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      if (loanIdsRef.current.length === 0) return;
      try {
        setMessages(await fetchMessages(loanIdsRef.current));
      } catch {
        // silent poll failure
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function send() {
    const loan = sendLoanRef.current;
    if (!loan || !text.trim()) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await api.sendMessage(loan.id, content);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not send message.');
      setText(content);
    } finally {
      setSending(false);
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

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-cream-200 bg-cream-50">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="p-1">
          <ArrowLeft size={22} color="#1F1B16" strokeWidth={1.75} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-ink-900">
            {otherUser ? `@${otherUser.username}` : '…'}
          </Text>
        </View>
      </View>

      {/* Contextual loan banner — tappable link to loan detail */}
      {recentLoan && (
        <TouchableOpacity
          onPress={() => router.push(`/loan/${recentLoan.id}` as any)}
          className="flex-row items-center justify-between px-4 py-2 bg-cream-100 border-b border-cream-200"
          activeOpacity={0.75}
        >
          <Text className="font-sans text-xs text-ink-500 flex-1" numberOfLines={1}>
            {LOAN_STATUS_LABEL[recentLoan.status]}:{' '}
            <Text className="font-sans-semibold text-ink-700">{recentLoan.listing.book.title}</Text>
          </Text>
          <Text className="font-sans-medium text-xs text-teal-500 ml-2">View →</Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="font-sans text-sm text-ink-300">No messages yet. Say hello!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.sender.id === myId;
            return (
              <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View
                  className={`max-w-[78%] rounded-card px-4 py-3 ${
                    isMe
                      ? 'bg-teal-500 rounded-br-sm'
                      : 'bg-cream-100 border border-cream-200 rounded-bl-sm'
                  }`}
                >
                  <Text className={`font-sans text-base leading-snug ${isMe ? 'text-white' : 'text-ink-900'}`}>
                    {item.content}
                  </Text>
                  <Text className={`font-sans text-xs mt-1 ${isMe ? 'text-white/60' : 'text-ink-300'}`}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        {/* Composer */}
        <View
          className="flex-row items-end gap-3 px-4 pt-3 pb-4 border-t border-cream-200 bg-cream-50"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="flex-1 bg-cream-100 border border-cream-200 rounded-card px-4 py-3">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message…"
              placeholderTextColor="#B5AB99"
              className="font-sans text-base text-ink-900"
              multiline
              maxLength={500}
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            onPress={send}
            disabled={!text.trim() || sending}
            className="w-11 h-11 bg-teal-500 rounded-full items-center justify-center"
            style={{ opacity: text.trim() && !sending ? 1 : 0.4 }}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
