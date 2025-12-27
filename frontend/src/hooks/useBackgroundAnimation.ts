import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';
import { GAME_CONSTANTS } from '@/src/constants/game';

export function useBackgroundAnimation(isPaused: boolean = false) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isPaused) {
      // Stop animation when paused
      cancelAnimation(translateX);
      return;
    }

    // Start infinite sliding animation - slide from right to left
    // The animation moves from 0 to -SCREEN_WIDTH, then resets to 0
    // Using 2 images side by side creates seamless loop
    translateX.value = withRepeat(
      withTiming(-GAME_CONSTANTS.SCREEN_WIDTH, {
        duration: GAME_CONSTANTS.BACKGROUND_ANIMATION_DURATION,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Reset to start (0) after reaching -SCREEN_WIDTH
    );
  }, [translateX, isPaused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return animatedStyle;
}

