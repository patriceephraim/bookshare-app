import { useAuth, useSignUp, useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { user } = useUser();
  // sessionId is present when sign-in.tsx OTP returned 'complete' — the Clerk
  // session was NOT activated there so we can collect the username first.
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (text: string) => {
    setFullName(text);
    if (!usernameEdited) setUsername(toSlug(text));
  };

  const handleUsernameChange = (text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setUsernameEdited(cleaned !== '');
  };

  const handleContinue = async () => {
    if (!fullName.trim() || !username.trim() || !isLoaded) return;
    setSubmitting(true);
    try {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || undefined;

      if (sessionId) {
        // Path A: Clerk signup was already 'complete' — activate the session
        // now that we have a real username, then update the profile.
        await setActive!({ session: sessionId });
        await user!.update({ username: username.trim(), firstName, lastName });
      } else {
        // Path B: Clerk signup has 'missing_requirements' (username required).
        const result = await signUp!.update({
          username: username.trim(),
          firstName,
          lastName,
        });
        if (result.status !== 'complete') {
          const missing = (result.missingFields ?? []).join(', ') || 'none listed';
          Alert.alert('Profile incomplete', `Still missing: ${missing}\nStatus: "${result.status}"`);
          return;
        }
        await setActive!({ session: result.createdSessionId });
      }

      // Sync username to our backend. The backend creates the user record on
      // first JWT validation — this PATCH ensures it gets the chosen username,
      // not Clerk's auto-generated stub.
      const token = await getToken();
      if (token) {
        const res = await fetch(`${BASE}/api/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: username.trim() }),
        });
        if (!res.ok) {
          // Non-fatal — Clerk has the right username even if the backend sync
          // fails here. The user can still sign in; the profile screen will
          // show the backend username once it catches up.
          console.warn('[complete-profile] backend username sync failed', res.status);
        }
      }

      router.replace('/(onboarding)/location' as any);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const message = clerkError?.longMessage ?? clerkError?.message ?? 'Please try again.';
      Alert.alert('Could not save profile', message);
    } finally {
      setSubmitting(false);
    }
  };

  const isReady = fullName.trim().length > 0 && username.trim().length >= 2;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <BrandBlock />
        <View style={styles.actions}>
          <Text style={styles.heading}>What should we call you?</Text>
          <Text style={styles.subheading}>This is how your neighbours will see you</Text>

          <View style={[styles.inputWrap, styles.inputSpaced]}>
            <TextInput
              value={fullName}
              onChangeText={handleNameChange}
              placeholder="e.g. Patrice Nangaa"
              placeholderTextColor="#B5AB99"
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrap}>
            <View style={styles.usernameRow}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="your_handle"
                placeholderTextColor="#B5AB99"
                style={[styles.input, styles.usernameInput]}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={submitting || !isReady}
            style={[styles.primaryBtn, (!isReady || submitting) && styles.primaryBtnDisabled]}
            activeOpacity={0.82}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryLabel}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBF8F2' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  actions: { marginTop: 28 },
  heading: { fontFamily: 'SourceSerif4_400Regular', fontSize: 22, color: '#1F1B16', marginBottom: 8 },
  subheading: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#7A6F5E', marginBottom: 16 },
  inputWrap: { backgroundColor: '#F5EFE2', borderWidth: 1, borderColor: '#EAE0CB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16 },
  inputSpaced: { marginBottom: 12 },
  input: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#1F1B16' },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  atSign: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#7A6F5E' },
  usernameInput: { flex: 1 },
  primaryBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F7C6E', borderRadius: 12, paddingVertical: 16, marginTop: 12 },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },
});
