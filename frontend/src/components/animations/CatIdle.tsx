import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface CatIdleProps {
  width?: number; // Display width (will scale the sprite)
  height?: number; // Display height (will scale the sprite)
  fps?: number; // Animation speed (frames per second)
  style?: ViewStyle;
  // Optional: If you know the actual sprite sheet dimensions, provide them
  spriteSheetWidth?: number; // Total width of the sprite sheet image
  spriteSheetHeight?: number; // Total height of the sprite sheet image
}

/**
 * Animated Cat Idle sprite component
 * Displays a looping idle animation of a cat
 * 
 * Note: If spriteSheetWidth/Height are not provided, the component will
 * estimate frame dimensions. For best results, provide actual sprite sheet dimensions.
 */
export function CatIdle({
  width = 64,
  height = 64,
  fps = 8,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: CatIdleProps) {
  const frameCount = 4; // 4 frames horizontally in the sprite sheet

  // Calculate frame dimensions
  // If sprite sheet dimensions are provided, use them; otherwise estimate
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/3 Cat/Idle.png')}
      frameCount={frameCount}
      frameWidth={frameWidth}
      frameHeight={frameHeight}
      fps={fps}
      loop={true}
      autoPlay={true}
      width={width}
      height={height}
      style={style}
    />
  );
}

