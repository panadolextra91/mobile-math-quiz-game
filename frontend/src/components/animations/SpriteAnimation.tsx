import { useEffect, useRef } from 'react';
import { View, StyleSheet, ImageSourcePropType, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface SpriteAnimationProps {
  source: ImageSourcePropType;
  frameCount: number; // Number of frames in the sprite sheet
  frameWidth: number; // Width of each frame
  frameHeight: number; // Height of each frame
  fps?: number; // Frames per second (default: 8)
  loop?: boolean; // Whether to loop the animation (default: true)
  autoPlay?: boolean; // Whether to start animation automatically (default: true)
  style?: ViewStyle;
  width?: number; // Display width (defaults to frameWidth)
  height?: number; // Display height (defaults to frameHeight)
}

export function SpriteAnimation({
  source,
  frameCount,
  frameWidth,
  frameHeight,
  fps = 8,
  loop = true,
  autoPlay = true,
  style,
  width,
  height,
}: SpriteAnimationProps) {
  const frameIndex = useSharedValue(0);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoPlay) return;

    const frameDuration = 1000 / fps; // Duration of each frame in milliseconds

    animationRef.current = setInterval(() => {
      frameIndex.value = (frameIndex.value + 1) % frameCount;
    }, frameDuration);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [autoPlay, fps, frameCount, frameIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentFrame = Math.floor(frameIndex.value) % frameCount;
    const translateX = -currentFrame * frameWidth;
    return {
      transform: [{ translateX }],
    };
  });

  const displayWidth = width || frameWidth;
  const displayHeight = height || frameHeight;

  return (
    <View style={[styles.container, { width: displayWidth, height: displayHeight }, style]}>
      <Animated.View
        style={[
          styles.spriteSheet,
          {
            width: frameWidth * frameCount,
            height: frameHeight,
          },
          animatedStyle,
        ]}
      >
        <Image
          source={source}
          style={{
            width: frameWidth * frameCount,
            height: frameHeight,
          }}
          contentFit="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  spriteSheet: {
    flexDirection: 'row',
  },
});

