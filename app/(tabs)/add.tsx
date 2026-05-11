import { Redirect } from 'expo-router';

// This tab's button navigates directly to /add-book/camera via the custom FAB.
// This file exists to satisfy Expo Router's file-based routing.
export default function AddTab() {
  return <Redirect href="/add-book/camera" />;
}
