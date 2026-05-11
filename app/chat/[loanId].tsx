import { useState } from 'react';
import {
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
import { MOCK_MESSAGES, MOCK_CHAT_THREADS } from '@/lib/mock-data';
import type { Message } from '@/lib/mock-data';

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function ChatScreen() {
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const thread = MOCK_CHAT_THREADS.find((t) => t.loanId === loanId) ?? MOCK_CHAT_THREADS[0];
  const [messages, setMessages] = useState<Message[]>(
    MOCK_MESSAGES.filter((m) => m.loanId === (loanId ?? 'loan1'))
  );
  const [text, setText] = useState('');

  function send() {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        loanId: loanId ?? 'loan1',
        senderId: 'me',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setText('');
  }

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-cream-200 bg-cream-50">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="p-1">
          <ArrowLeft size={22} color="#1F1B16" strokeWidth={1.75} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-ink-900">{thread.otherUser.name}</Text>
          <Text className="font-serif text-sm text-ink-500" numberOfLines={1}>
            re: {thread.book.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/loan/${loanId}` as any)}
          className="bg-cream-100 border border-cream-200 rounded-button px-3 py-1.5"
          activeOpacity={0.7}
        >
          <Text className="font-sans-medium text-xs text-ink-700">View loan</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === 'me';
            return (
              <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View
                  className={`max-w-[78%] rounded-card px-4 py-3 ${
                    isMe
                      ? 'bg-teal-500 rounded-br-sm'
                      : 'bg-cream-100 border border-cream-200 rounded-bl-sm'
                  }`}
                >
                  <Text
                    className={`font-sans text-base leading-snug ${isMe ? 'text-white' : 'text-ink-900'}`}
                  >
                    {item.text}
                  </Text>
                  <Text
                    className={`font-sans text-xs mt-1 ${isMe ? 'text-white/60' : 'text-ink-300'}`}
                  >
                    {formatTime(item.timestamp)}
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
            disabled={!text.trim()}
            className="w-11 h-11 bg-teal-500 rounded-full items-center justify-center"
            style={{ opacity: text.trim() ? 1 : 0.4 }}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
