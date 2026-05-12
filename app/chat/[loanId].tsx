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

export default function ChatScreen() {
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const api = useApi();
  const flatListRef = useRef<FlatList>(null);

  const [loan, setLoan] = useState<LoanPublic | null>(null);
  const [me, setMe] = useState<UserMe | null>(null);
  const [messages, setMessages] = useState<MessagePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    if (!loanId) return;
    try {
      const msgs = await api.getLoanMessages(loanId);
      setMessages(msgs);
    } catch {
      // silent poll failure
    }
  }

  useEffect(() => {
    if (!loanId) return;
    Promise.all([api.getLoan(loanId), api.getMe(), api.getLoanMessages(loanId)])
      .then(([l, m, msgs]) => {
        setLoan(l);
        setMe(m);
        setMessages(msgs);
      })
      .catch(e => Alert.alert('Error', e.message ?? 'Could not load chat.'))
      .finally(() => setLoading(false));
  }, [loanId]);

  // Poll every 5 seconds for new messages
  useEffect(() => {
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loanId]);

  async function send() {
    if (!text.trim() || !loanId) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await api.sendMessage(loanId, content);
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
  const isMyBorrow = loan ? loan.borrower.id === myId : true;
  const other = loan ? (isMyBorrow ? loan.lender : loan.borrower) : null;

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-cream-200 bg-cream-50">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="p-1">
          <ArrowLeft size={22} color="#1F1B16" strokeWidth={1.75} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-ink-900">
            {other ? `@${other.username}` : '…'}
          </Text>
          {loan ? (
            <Text className="font-serif text-sm text-ink-500" numberOfLines={1}>
              re: {loan.listing.book.title}
            </Text>
          ) : null}
        </View>
        {loan ? (
          <TouchableOpacity
            onPress={() => router.push(`/loan/${loanId}` as any)}
            className="bg-cream-100 border border-cream-200 rounded-button px-3 py-1.5"
            activeOpacity={0.7}
          >
            <Text className="font-sans-medium text-xs text-ink-700">View loan</Text>
          </TouchableOpacity>
        ) : null}
      </View>

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
