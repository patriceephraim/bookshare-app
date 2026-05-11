import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const containerVariants: Record<Variant, string> = {
  primary: 'bg-teal-500 rounded-button',
  outline: 'border border-teal-500 rounded-button bg-transparent',
  ghost: 'bg-transparent rounded-button',
};

const textVariants: Record<Variant, string> = {
  primary: 'text-white font-sans-semibold',
  outline: 'text-teal-500 font-sans-semibold',
  ghost: 'text-teal-500 font-sans-medium',
};

const sizeContainer: Record<Size, string> = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

const sizeText: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const dangerContainer: Record<Variant, string> = {
  primary: 'bg-terracotta-500 rounded-button',
  outline: 'border border-terracotta-500 rounded-button bg-transparent',
  ghost: 'bg-transparent rounded-button',
};

const dangerText: Record<Variant, string> = {
  primary: 'text-white font-sans-semibold',
  outline: 'text-terracotta-500 font-sans-semibold',
  ghost: 'text-terracotta-500 font-sans-medium',
};

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  danger?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  danger = false,
}: ButtonProps) {
  const container = danger ? dangerContainer[variant] : containerVariants[variant];
  const textStyle = danger ? dangerText[variant] : textVariants[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      className={`
        flex-row items-center justify-center gap-2
        ${container}
        ${sizeContainer[size]}
        ${fullWidth ? 'w-full' : 'self-start'}
        ${disabled ? 'opacity-40' : ''}
      `}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' && !danger ? '#fff' : danger ? '#C8624A' : '#3F7C6E'}
        />
      )}
      <Text className={`${textStyle} ${sizeText[size]}`}>{label}</Text>
    </TouchableOpacity>
  );
}
