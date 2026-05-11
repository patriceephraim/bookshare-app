import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-cream-50 items-center justify-center p-5">
      <Text className="font-serif text-2xl text-ink-900">Modal</Text>
      <Link href="/" dismissTo>
        <Text className="font-sans-medium text-base text-teal-500 mt-4 py-4">
          Go to home screen
        </Text>
      </Link>
    </View>
  );
}
