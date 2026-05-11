import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, subtitle, showBack = false, right, transparent = false }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className={`px-6 pb-4 ${transparent ? '' : 'bg-cream-50 border-b border-cream-200'}`}
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-9 h-9 items-center justify-center -ml-1"
            >
              <ArrowLeft size={22} color="#1F1B16" strokeWidth={1.75} />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="font-serif text-2xl text-ink-900" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="font-sans text-sm text-ink-500 mt-0.5">{subtitle}</Text>
            ) : null}
          </View>
        </View>
        {right ? <View className="ml-4">{right}</View> : null}
      </View>
    </View>
  );
}
