import { Text, View } from 'react-native';
import type { BookStatus } from '@/lib/mock-data';

const pillConfig: Record<BookStatus, { container: string; text: string; label: string }> = {
  available: {
    container: 'bg-teal-50 rounded-pill px-3 py-1',
    text: 'text-teal-900 font-sans-medium text-xs',
    label: 'Available',
  },
  'on-loan': {
    container: 'bg-cream-200 rounded-pill px-3 py-1',
    text: 'text-ink-700 font-sans-medium text-xs',
    label: 'On Loan',
  },
  hidden: {
    container: 'bg-cream-100 border border-cream-200 rounded-pill px-3 py-1',
    text: 'text-ink-500 font-sans-medium text-xs',
    label: 'Hidden',
  },
};

interface StatusPillProps {
  status: BookStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const config = pillConfig[status];
  return (
    <View className={config.container}>
      <Text className={config.text}>{config.label}</Text>
    </View>
  );
}
