import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandBlock } from '@/components/auth/BrandBlock';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSendCode = async () => {
    if (!signInLoaded || !signUpLoaded || !email.trim()) return;

    setSubmitting(true);
    try {
      try {
        // Try sign-in first (existing user)
        const result = await signIn.create({
          strategy: 'email_code',
          identifier: email.trim(),
        });
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: result.supportedFirstFactors!.find(
            (f) => f.strategy === 'email_code'
          )!.emailAddressId,
        });
        setIsNewUser(false);
        setStage('code');
      } catch (signInErr: any) {
        if (signInErr?.errors?.[0]?.code === 'form_identifier_not_found') {
          // New user — sign up flow
          await signUp.create({ emailAddress: email.trim() });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setIsNewUser(true);
          setStage('code');
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Could not send code',
        err?.errors?.[0]?.message ?? 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      if (isNewUser) {
        const result = await signUp!.attemptEmailAddressVerification({
          code: code.trim(),
        });
        if (result.status === 'complete' || result.status === 'missing_requirements') {
          // Don't activate the session yet. complete-profile collects the
          // username first, then activates — so the backend never sees the
          // Clerk-generated stub username.
          router.replace({
            pathname: '/(onboarding)/complete-profile' as any,
            params: result.createdSessionId ? { sessionId: result.createdSessionId } : {},
          });
        } else {
          Alert.alert(
            'Verification incomplete',
            `Unexpected status: "${result.status}". Please try again or contact support.`
          );
        }
      } else {
        const result = await signIn!.attemptFirstFactor({
          strategy: 'email_code',
          code: code.trim(),
        });
        if (result.status === 'complete') {
          await setActiveSignIn!({ session: result.createdSessionId });
          router.replace('/(tabs)');
        } else {
          Alert.alert(
            'Sign-in incomplete',
            `Unexpected status: "${result.status}". Please try again or contact support.`
          );
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Invalid code',
        err?.errors?.[0]?.message ?? 'Please check the code and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <BrandBlock />

        <View style={styles.actions}>
          {stage === 'email' ? (
            <>
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
                  onSubmitEditing={handleSendCode}
                />
              </View>

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={submitting || !email.trim()}
                style={[
                  styles.primaryBtn,
                  (submitting || !email.trim()) && styles.primaryBtnDisabled,
                ]}
                activeOpacity={0.82}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryLabel}>Send sign-in code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                activeOpacity={0.65}
              >
                <ArrowLeft size={13} color="#3D362C" strokeWidth={2} />
                <Text style={styles.backLabel}>Back to welcome</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Enter your code</Text>
              <Text style={styles.subheading}>
                We sent a 6-digit code to {email}
              </Text>

              <View style={styles.inputWrap}>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#B5AB99"
                  style={[styles.input, styles.codeInput]}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyCode}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={handleVerifyCode}
                disabled={submitting || code.length < 6}
                style={[
                  styles.primaryBtn,
                  (submitting || code.length < 6) && styles.primaryBtnDisabled,
                ]}
                activeOpacity={0.82}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryLabel}>Verify and continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setStage('email');
                  setCode('');
                }}
                style={styles.backBtn}
                activeOpacity={0.65}
              >
                <ArrowLeft size={13} color="#3D362C" strokeWidth={2} />
                <Text style={styles.backLabel}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.legal}>
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBF8F2' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  actions: { marginTop: 28 },
  heading: {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 22,
    color: '#1F1B16',
    marginBottom: 8,
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#7A6F5E',
    marginBottom: 16,
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
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3F7C6E',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  primaryBtnDisabled: { opacity: 0.5 },
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
    marginTop: 16,
  },
});