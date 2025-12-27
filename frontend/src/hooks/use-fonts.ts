import { useFonts as useExpoFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

/**
 * Custom hook to load fonts and handle splash screen
 * @returns Object with fontsLoaded and fontError states
 */
export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    'Jersey10-Regular': require('@/assets/fonts/Jersey10-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return { fontsLoaded, fontError };
}

