import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BrandBlock } from '@/components/auth/BrandBlock';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <BrandBlock />

        <View style={styles.actions}>
          <Text style={styles.heading}>Welcome back</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#B5AB99"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => router.push('/(onboarding)/location')}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/location')}
            style={styles.primaryBtn}
            activeOpacity={0.82}
          >
            <Text style={styles.primaryLabel}>Send sign-in link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.65}
          >
            <ArrowLeft size={13} color="#3D362C" strokeWidth={2} />
            <Text style={styles.backLabel}>Back to welcome</Text>
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
    marginTop: 28,
  },
  heading: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 22,
    color: '#1F1B16',
    marginBottom: 20,
  },
  inputWrap: {
    backgroundColor: '#F5EFE2',
    borderWidth: 1,
    borderColor: '#EAE0CB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1F1B16',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F7C6E',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  primaryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },
  backLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#3D362C',
  },
  legal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#7A6F5E',
    textAlign: 'center',
    marginTop: 8,
  },
});
