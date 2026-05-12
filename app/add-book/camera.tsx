import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Zap, BookOpen, Image as ImageIcon } from 'lucide-react-native';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo?.uri) {
        router.push({
          pathname: '/add-book/confirm',
          params: { imageUri: photo.uri, mimeType: 'image/jpeg' },
        } as any);
      }
    } catch {
      setCapturing(false);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/add-book/confirm',
        params: { imageUri: result.assets[0].uri, mimeType: result.assets[0].mimeType ?? 'image/jpeg' },
      } as any);
    }
  };

  // Permission not yet determined
  if (!permission) {
    return <View className="flex-1 bg-ink-900" />;
  }

  // Permission denied — show prompt
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-ink-900 items-center justify-center px-8 gap-6">
        <BookOpen size={48} color="rgba(255,255,255,0.4)" strokeWidth={1.25} />
        <Text className="font-serif text-white text-xl text-center">Camera access needed</Text>
        <Text className="font-sans text-white opacity-60 text-center text-base">
          Bookshare uses your camera to identify book covers.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-teal-500 rounded-button px-8 py-4"
          activeOpacity={0.82}
        >
          <Text className="font-sans-semibold text-white text-base">Allow camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text className="font-sans text-white opacity-40 text-sm">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ink-900">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
      />

      {/* Corner markers */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

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
        <View className="w-10 h-10" />
      </View>

      {/* Bottom controls */}
      <View
        className="absolute bottom-0 left-0 right-0 items-center gap-6 px-8"
        style={{ paddingBottom: insets.bottom + 40 }}
      >
        <View className="bg-black/40 rounded-pill px-5 py-2">
          <Text className="font-sans text-sm text-white opacity-80">
            AI will detect title, author & condition
          </Text>
        </View>

        <View className="flex-row items-center justify-between w-full">
          {/* Library picker */}
          <TouchableOpacity
            onPress={pickFromLibrary}
            className="w-14 h-14 items-center justify-center bg-white/10 rounded-full"
            activeOpacity={0.7}
          >
            <ImageIcon size={24} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            onPress={capture}
            disabled={capturing}
            style={styles.shutter}
            activeOpacity={0.8}
          >
            {capturing ? (
              <ActivityIndicator color="#1F1B16" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          <View className="w-14 h-14" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#fff' },
  topLeft:    { top: '20%', left: '12%', borderTopWidth: 2, borderLeftWidth: 2 },
  topRight:   { top: '20%', right: '12%', borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: '30%', left: '12%', borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight:{ bottom: '30%', right: '12%', borderBottomWidth: 2, borderRightWidth: 2 },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});
