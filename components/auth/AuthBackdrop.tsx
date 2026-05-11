import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BACKDROP = require('@/assets/images/auth-backdrop.png');
const OVERLAP = 24; // px the panel rises above the photo

interface AuthBackdropProps {
  children: ReactNode;
}

export function AuthBackdrop({ children }: AuthBackdropProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const photoHeight = Math.round(height * 0.60);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />

      {/* Photo — bleeds under status bar, absolutely layered behind panel */}
      <Image
        source={BACKDROP}
        style={{ position: 'absolute', top: 0, left: 0, width, height: photoHeight }}
        contentFit="cover"
        contentPosition="top"
      />

      {/* Transparent spacer that positions the panel */}
      <View style={{ height: photoHeight - OVERLAP }} />

      {/* Cream panel — curved top, overlaps photo */}
      <View
        style={[
          styles.panel,
          { flex: 1, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Brand block — identical on every auth screen */}
        <View style={styles.brandBlock}>
          <Text style={styles.wordmark}>Bookshare</Text>
          <Text style={styles.tagline}>Discover what your block is reading</Text>
        </View>
        <View style={styles.hairline} />

        {/* Action area — screen-specific content */}
        <View style={styles.actionArea}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FBF8F2',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
  },
  brandBlock: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  wordmark: {
    fontFamily: 'SourceSerif4_600SemiBold',
    fontSize: 42,
    lineHeight: 48,
    color: '#1F1B16',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'SourceSerif4_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 25,
    color: '#3D362C',
    textAlign: 'center',
    marginTop: 8,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EAE0CB',
    marginHorizontal: 48,
    marginTop: 24,
  },
  actionArea: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
});
