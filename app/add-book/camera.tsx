import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Zap, BookOpen, Image as ImageIcon } from 'lucide-react-native';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-ink-900">
      {/* Viewfinder */}
      <View className="flex-1 relative items-center justify-center">
        {/* Corner markers */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Guide text */}
        <View className="items-center gap-2">
          <BookOpen size={36} color="rgba(255,255,255,0.3)" strokeWidth={1.25} />
          <Text className="font-sans text-white text-base opacity-60">
            Point at a book cover
          </Text>
          <Text className="font-sans text-sm opacity-40" style={{ color: '#fff' }}>
            Hold steady for best results
          </Text>
        </View>
      </View>

      {/* Top bar */}
      <View
        className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
        >
          <X size={24} color="#fff" strokeWidth={1.75} />
        </TouchableOpacity>
        <Text className="font-sans-semibold text-base text-white">Add a book</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center" activeOpacity={0.7}>
          <Zap size={22} color="#fff" strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View
        className="absolute bottom-0 left-0 right-0 items-center gap-6 px-8"
        style={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* AI hint */}
        <View className="bg-black/40 rounded-pill px-5 py-2">
          <Text className="font-sans text-sm text-white opacity-80">
            AI will detect title, author & condition
          </Text>
        </View>

        {/* Controls row */}
        <View className="flex-row items-center justify-between w-full">
          <TouchableOpacity
            className="w-14 h-14 items-center justify-center bg-white/10 rounded-full"
            activeOpacity={0.7}
          >
            <ImageIcon size={24} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            onPress={() => router.push('/add-book/confirm')}
            style={styles.shutter}
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View className="w-14 h-14" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#fff',
  },
  topLeft: {
    top: '20%',
    left: '12%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: '20%',
    right: '12%',
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: '30%',
    left: '12%',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: '30%',
    right: '12%',
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});
