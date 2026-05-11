import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BrandBlock } from '@/components/auth/BrandBlock';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <BrandBlock />

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/location')}
            style={styles.primaryBtn}
            activeOpacity={0.82}
          >
            <Globe size={18} color="#fff" strokeWidth={1.75} />
            <Text style={styles.primaryLabel}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/sign-in')}
            style={styles.outlineBtn}
            activeOpacity={0.82}
          >
            <Mail size={18} color="#1F1B16" strokeWidth={1.75} />
            <Text style={styles.outlineLabel}>Continue with email</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FBF8F2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  actions: {
    marginTop: 32,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3F7C6E',
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#1F1B16',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  outlineLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#1F1B16',
  },
  legal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#7A6F5E',
    textAlign: 'center',
    marginTop: 20,
  },
});
