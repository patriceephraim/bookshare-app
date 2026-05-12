import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles, ChevronDown, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { useApi, BookPublic, conditionLabel } from '@/lib/api';

const CONDITIONS = [
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Well Loved', value: 'worn' },
] as const;

type ConditionValue = (typeof CONDITIONS)[number]['value'];

export default function ConfirmScreen() {
  const router = useRouter();
  const { imageUri, mimeType } = useLocalSearchParams<{ imageUri: string; mimeType: string }>();
  const api = useApi();

  const [identifying, setIdentifying] = useState(true);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [book, setBook] = useState<BookPublic | null>(null);
  const [confidence, setConfidence] = useState<string>('');
  const [navigating, setNavigating] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [condition, setCondition] = useState<ConditionValue>('good');
  const [notes, setNotes] = useState('');
  const [showConditions, setShowConditions] = useState(false);

  useEffect(() => {
    if (!imageUri) return;
    api.identifyBook(imageUri, mimeType ?? 'image/jpeg')
      .then(res => {
        setBook(res.book);
        setConfidence(res.confidence);
        setTitle(res.book.title);
        setAuthor(res.book.author);
      })
      .catch(err => {
        setIdentifyError(err.message ?? 'Could not identify book');
        setTitle('');
        setAuthor('');
      })
      .finally(() => setIdentifying(false));
  }, [imageUri]);

  const conditionDisplay = CONDITIONS.find(c => c.value === condition)?.label ?? 'Good';

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Confirm details" showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover + AI badge */}
        <View className="flex-row gap-4 items-start">
          {/* Cover preview */}
          <View className="w-24 h-36 bg-teal-50 rounded-lg items-center justify-center border border-cream-200 overflow-hidden">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 96, height: 144 }} resizeMode="cover" />
            ) : (
              <Text className="font-serif-bold text-4xl text-teal-500">{title?.[0] ?? '?'}</Text>
            )}
          </View>

          <View className="flex-1 gap-2 pt-1">
            {identifying ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#3F7C6E" />
                <Text className="font-sans text-sm text-ink-500">Identifying book…</Text>
              </View>
            ) : identifyError ? (
              <View className="flex-row items-center gap-2 bg-terracotta-50 rounded-pill px-3 py-1.5 self-start">
                <AlertCircle size={12} color="#C8624A" strokeWidth={1.75} />
                <Text className="font-sans-medium text-xs text-terracotta-500">Not detected — fill in manually</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 bg-teal-50 rounded-pill px-3 py-1.5 self-start">
                <Sparkles size={12} color="#3F7C6E" strokeWidth={1.75} />
                <Text className="font-sans-medium text-xs text-teal-900">
                  Detected by AI{confidence === 'medium' ? ' (review below)' : ''}
                </Text>
              </View>
            )}
            <Text className="font-sans text-sm text-ink-500 leading-snug">
              Review the details below and correct anything that looks off.
            </Text>
          </View>
        </View>

        {/* Fields */}
        <View className="gap-4">
          <Field label="Title" value={title} onChange={setTitle} placeholder="Book title" />
          <Field label="Author" value={author} onChange={setAuthor} placeholder="Author name" />

          {/* Condition picker */}
          <View className="gap-1.5">
            <Text className="font-sans-medium text-sm text-ink-700">Condition</Text>
            <TouchableOpacity
              onPress={() => setShowConditions(!showConditions)}
              className="flex-row items-center justify-between bg-cream-100 border border-cream-200 rounded-button px-4 py-3.5"
              activeOpacity={0.8}
            >
              <Text className="font-sans text-base text-ink-900">{conditionDisplay}</Text>
              <ChevronDown size={16} color="#7A6F5E" strokeWidth={1.75} />
            </TouchableOpacity>
            {showConditions && (
              <View className="bg-cream-100 border border-cream-200 rounded-button overflow-hidden mt-1">
                {CONDITIONS.map((c, i) => (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => { setCondition(c.value); setShowConditions(false); }}
                    className={`px-4 py-3.5 ${i < CONDITIONS.length - 1 ? 'border-b border-cream-200' : ''}`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-sans text-base text-ink-900">{c.label}</Text>
                      {condition === c.value && <View className="w-4 h-4 bg-teal-500 rounded-full" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Field
            label="Notes (optional)"
            value={notes}
            onChange={setNotes}
            placeholder="e.g. Some pencil annotations, still a great read"
            multiline
          />
        </View>

        <View className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-2">
          <Text className="font-sans-semibold text-sm text-ink-900">Lending terms</Text>
          <Text className="font-sans text-sm text-ink-500 leading-relaxed">
            You set the pickup location in the next step. Loans are typically 3 weeks. You can always message the borrower to arrange details.
          </Text>
        </View>
      </ScrollView>

      <View className="px-5 py-4 border-t border-cream-200 bg-cream-50">
        <Button
          label={navigating ? 'Creating…' : 'Set pickup location'}
          onPress={async () => {
            if (!title.trim()) {
              Alert.alert('Title required', 'Please enter the book title before continuing.');
              return;
            }
            setNavigating(true);
            try {
              let bookId = book?.id ?? '';
              if (!bookId) {
                // AI didn't identify it — create the book manually from the typed fields
                const created = await api.createBook(title.trim(), author.trim() || 'Unknown');
                bookId = String(created.id);
              }
              router.push({
                pathname: '/add-book/pickup',
                params: { bookId, bookTitle: title.trim(), bookAuthor: author.trim(), condition, notes: notes.trim() },
              } as any);
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not save book. Please try again.');
            } finally {
              setNavigating(false);
            }
          }}
          disabled={identifying || navigating}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder, multiline = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-sm text-ink-700">{label}</Text>
      <View className={`bg-cream-100 border border-cream-200 rounded-button px-4 ${multiline ? 'py-3' : 'py-3.5'}`}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#B5AB99"
          className="font-sans text-base text-ink-900"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}
