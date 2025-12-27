import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from '@/hooks/use-fonts';
import 'react-native-reanimated';

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Game" />
        <Stack.Screen name="PersonaStats" />
        <Stack.Screen name="Leaderboard" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
