import { Text, View } from 'react-native';

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textClasses = {
  sm: 'text-xs font-sans-semibold',
  md: 'text-sm font-sans-semibold',
  lg: 'text-base font-sans-semibold',
  xl: 'text-xl font-sans-semibold',
};

const colorSets = [
  { bg: 'bg-teal-50', text: 'text-teal-700' },
  { bg: 'bg-terracotta-50', text: 'text-terracotta-700' },
  { bg: 'bg-cream-200', text: 'text-ink-700' },
];

interface AvatarProps {
  initials: string;
  size?: keyof typeof sizeClasses;
  colorIndex?: number;
}

export function Avatar({ initials, size = 'md', colorIndex = 0 }: AvatarProps) {
  const colors = colorSets[colorIndex % colorSets.length];
  return (
    <View className={`${sizeClasses[size]} ${colors.bg} rounded-pill items-center justify-center`}>
      <Text className={`${textClasses[size]} ${colors.text}`}>{initials}</Text>
    </View>
  );
}
