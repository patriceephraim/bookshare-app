import { StyleSheet, Text, View } from 'react-native';

export function BrandBlock() {
  return (
    <View>
      <Text style={styles.wordmark}>Bookshare</Text>
      <Text style={styles.tagline}>Discover what your block is reading</Text>
      <View style={styles.hairline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontFamily: 'SourceSerif4_600SemiBold',
    fontSize: 52,
    lineHeight: 58,
    color: '#1F1B16',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'SourceSerif4_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 25,
    color: '#3D362C',
    marginTop: 10,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EAE0CB',
    marginTop: 28,
  },
});
