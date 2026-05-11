import { Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-10 py-16 gap-4">
      <View className="w-16 h-16 bg-cream-100 rounded-full items-center justify-center">
        <Icon size={28} color="#B5AB99" strokeWidth={1.5} />
      </View>
      <View className="items-center gap-2">
        <Text className="font-serif text-xl text-ink-900 text-center">{title}</Text>
        <Text className="font-sans text-base text-ink-500 text-center leading-relaxed">{message}</Text>
      </View>
      {action}
    </View>
  );
}
