import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-expo';
import {
  Bell,
  MapPin,
  Moon,
  Shield,
  ChevronRight,
  BookOpen,
} from 'lucide-react-native';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { useApi, UserMe } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';

const NEIGHBOURHOODS = [
  { name: 'Glebe',            lat: 45.4185, lng: -75.6973 },
  { name: 'Centretown',       lat: 45.4203, lng: -75.6953 },
  { name: 'Westboro',         lat: 45.3970, lng: -75.7510 },
  { name: 'Old Ottawa South', lat: 45.3933, lng: -75.6856 },
  { name: 'Hintonburg',       lat: 45.4031, lng: -75.7242 },
  { name: 'ByWard Market',    lat: 45.4290, lng: -75.6925 },
];

function homeLabel(lat: number | null | undefined, lng: number | null | undefined): string {
  if (lat == null || lng == null) return 'Not set';
  let nearest = NEIGHBOURHOODS[0];
  let minDist = Infinity;
  for (const n of NEIGHBOURHOODS) {
    const d = Math.hypot(n.lat - lat, n.lng - lng);
    if (d < minDist) { minDist = d; nearest = n; }
  }
  return `${nearest.name}, Ottawa`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const api = useApi();
  const [me, setMe] = useState<UserMe | null>(null);
  const [notifs, setNotifs] = useState(true);
  const [borrowRequests, setBorrowRequests] = useState(true);
  const [messages, setMessages] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    api.getMe().then(setMe).catch(() => {});
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(onboarding)/welcome' as any);
    } catch (err: any) {
      Alert.alert('Sign out failed', err?.message ?? 'Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['bottom']}>
      <Header title="Settings" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Account */}
        <View className="px-5 pt-5">
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="flex-row items-center gap-4 bg-cream-100 rounded-card p-4 border border-cream-200"
            activeOpacity={0.8}
          >
            <Avatar initials={[user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || user?.username?.slice(0, 2).toUpperCase() || '?'} size="md" colorIndex={0} />
            <View className="flex-1">
              <Text className="font-sans-semibold text-base text-ink-900">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || '—'}
              </Text>
              <Text className="font-sans text-sm text-ink-500">
                {me?.username ? `@${me.username}` : user?.username ? `@${user.username}` : '—'}
              </Text>
            </View>
            <ChevronRight size={16} color="#B5AB99" strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        <Section title="Notifications">
          <ToggleRow
            icon={Bell}
            label="Push notifications"
            sub="Receive alerts on this device"
            value={notifs}
            onChange={setNotifs}
          />
          <ToggleRow
            icon={BookOpen}
            label="Borrow requests"
            sub="When someone requests your book"
            value={borrowRequests}
            onChange={setBorrowRequests}
          />
          <ToggleRow
            icon={Bell}
            label="Messages"
            sub="New messages from lenders/borrowers"
            value={messages}
            onChange={setMessages}
          />
          <ToggleRow
            icon={Bell}
            label="Due date reminders"
            sub="3 days before a book is due"
            value={reminders}
            onChange={setReminders}
          />
        </Section>

        <Section title="Location">
          <NavRow icon={MapPin} label="Home neighbourhood" value={homeLabel(me?.home_lat, me?.home_lng)} />
          <NavRow icon={MapPin} label="Search radius" value="2 km" />
        </Section>

        <Section title="Appearance">
          <ToggleRow
            icon={Moon}
            label="Dark mode"
            sub="Switch to dark theme"
            value={darkMode}
            onChange={setDarkMode}
          />
        </Section>

        <Section title="Privacy & Security">
          <NavRow icon={Shield} label="Privacy settings" />
          <NavRow icon={Shield} label="Blocked users" />
          <NavRow icon={Shield} label="Data & storage" />
        </Section>

        <Section title="About">
          <NavRow icon={BookOpen} label="Terms of Service" />
          <NavRow icon={BookOpen} label="Privacy Policy" />
          <NavRow icon={BookOpen} label="App version" value="1.0.0" />
        </Section>

        {/* Sign out */}
        <View className="px-5 pt-2 pb-6">
          <Button
            label={signingOut ? 'Signing out…' : 'Sign out'}
            variant="outline"
            danger
            fullWidth
            loading={signingOut}
            disabled={signingOut}
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="px-5 pt-6 gap-2">
      <Text className="font-sans-semibold text-xs text-ink-500 uppercase tracking-wide px-1">{title}</Text>
      <View className="bg-cream-100 rounded-card border border-cream-200 overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 px-4 py-4 border-b border-cream-200 last:border-b-0">
      <Icon size={18} color="#7A6F5E" strokeWidth={1.75} />
      <View className="flex-1">
        <Text className="font-sans-medium text-sm text-ink-900">{label}</Text>
        <Text className="font-sans text-xs text-ink-500 mt-0.5">{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#EAE0CB', true: '#3F7C6E' }}
        thumbColor="#fff"
      />
    </View>
  );
}

function NavRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-4 px-4 py-4 border-b border-cream-200"
      activeOpacity={0.7}
    >
      <Icon size={18} color="#7A6F5E" strokeWidth={1.75} />
      <Text className="flex-1 font-sans-medium text-sm text-ink-900">{label}</Text>
      {value ? (
        <Text className="font-sans text-sm text-ink-500">{value}</Text>
      ) : null}
      <ChevronRight size={14} color="#B5AB99" strokeWidth={1.75} />
    </TouchableOpacity>
  );
}
