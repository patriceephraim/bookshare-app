import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const PHOTO = require('@/assets/images/auth-image.png');

export default function Splash() {
  const router = useRouter();
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const navigateToWelcome = useCallback(() => {
    router.replace('/(onboarding)/welcome');
  }, [router]);

  useEffect(() => {
    SplashScreen.hideAsync();

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        'worklet';
        if (finished) runOnJS(navigateToWelcome)();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    // cream background shows through as photo fades — matches welcome screen
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Image source={PHOTO} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#FBF8F2',
  },
});
