import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface RatDeathProps {
  width?: number;
  height?: number;
  fps?: number;
  style?: ViewStyle;
  spriteSheetWidth?: number;
  spriteSheetHeight?: number;
}

export function RatDeath({
  width = 64,
  height = 64,
  fps = 8,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: RatDeathProps) {
  const frameCount = 4;
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/5 Rat/Death.png')}
      frameCount={frameCount}
      frameWidth={frameWidth}
      frameHeight={frameHeight}
      fps={fps}
      loop={false}
      autoPlay={true}
      width={width}
      height={height}
      style={style}
    />
  );
}

