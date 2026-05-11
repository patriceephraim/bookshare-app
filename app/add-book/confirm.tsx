import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';

const CONDITIONS = ['Like New', 'Great', 'Good', 'Acceptable', 'Well Loved'] as const;

export default function ConfirmScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('Project Hail Mary');
  const [author, setAuthor] = useState('Andy Weir');
  const [condition, setCondition] = useState('Great');
  const [notes, setNotes] = useState('');
  const [showConditions, setShowConditions] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Confirm details" showBack />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* AI detected badge + cover placeholder */}
        <View className="flex-row gap-4 items-start">
          <View className="w-24 h-36 bg-teal-50 rounded-lg items-center justify-center border border-cream-200">
            <Text className="font-serif-bold text-4xl text-teal-500">P</Text>
          </View>
          <View className="flex-1 gap-2 pt-1">
            <View className="flex-row items-center gap-2 bg-teal-50 rounded-pill px-3 py-1.5 self-start">
              <Sparkles size={12} color="#3F7C6E" strokeWidth={1.75} />
              <Text className="font-sans-medium text-xs text-teal-900">Detected by AI</Text>
            </View>
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
              <Text className="font-sans text-base text-ink-900">{condition}</Text>
              <ChevronDown size={16} color="#7A6F5E" strokeWidth={1.75} />
            </TouchableOpacity>
            {showConditions && (
              <View className="bg-cream-100 border border-cream-200 rounded-button overflow-hidden mt-1">
                {CONDITIONS.map((c, i) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => { setCondition(c); setShowConditions(false); }}
                    className={`px-4 py-3.5 ${i < CONDITIONS.length - 1 ? 'border-b border-cream-200' : ''}`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-sans text-base text-ink-900">{c}</Text>
                      {condition === c && (
                        <View className="w-4 h-4 bg-teal-500 rounded-full" />
                      )}
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
            placeholder="Ex: Some pencil annotations, still a great read"
            multiline
          />
        </View>

        {/* Lending terms */}
        <View className="bg-cream-100 rounded-card p-4 border border-cream-200 gap-2">
          <Text className="font-sans-semibold text-sm text-ink-900">Lending terms</Text>
          <Text className="font-sans text-sm text-ink-500 leading-relaxed">
            You set the pickup location in the next step. Loans are typically 3 weeks. You can always message the borrower to arrange details.
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View className="px-5 py-4 border-t border-cream-200 bg-cream-50">
        <Button
          label="Set pickup location"
          onPress={() => router.push('/add-book/pickup')}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
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
