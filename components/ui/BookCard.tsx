import { Text, TouchableOpacity, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import type { Book } from '@/lib/mock-data';
import { StatusPill } from './StatusPill';

const coverColors = [
  { bg: 'bg-teal-50', text: 'text-teal-500' },
  { bg: 'bg-terracotta-50', text: 'text-terracotta-500' },
  { bg: 'bg-cream-200', text: 'text-ink-700' },
  { bg: 'bg-teal-50', text: 'text-teal-700' },
];

function getCoverColor(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return coverColors[index % coverColors.length];
}

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  showDistance?: boolean;
}

export function BookCard({ book, onPress, showDistance = true }: BookCardProps) {
  const colors = getCoverColor(book.id);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row gap-4 bg-cream-100 rounded-card p-4 border border-cream-200"
    >
      {/* Book spine placeholder */}
      <View className={`w-14 h-20 rounded-lg ${colors.bg} items-center justify-center flex-shrink-0`}>
        <Text className={`${colors.text} font-serif-bold text-2xl`}>{book.title[0]}</Text>
      </View>

      {/* Info */}
      <View className="flex-1 gap-1.5 justify-center">
        <Text className="font-serif text-base text-ink-900 leading-snug" numberOfLines={2}>
          {book.title}
        </Text>
        <Text className="font-sans text-sm text-ink-500">{book.author}</Text>
        <View className="flex-row items-center gap-2 mt-1 flex-wrap">
          <StatusPill status={book.status} />
          <Text className="font-sans text-xs text-ink-300">{book.condition}</Text>
        </View>
        {showDistance && (
          <View className="flex-row items-center gap-1 mt-0.5">
            <MapPin size={11} color="#B5AB99" strokeWidth={1.5} />
            <Text className="font-sans text-xs text-ink-300">
              {book.distance} · {book.neighborhood}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
