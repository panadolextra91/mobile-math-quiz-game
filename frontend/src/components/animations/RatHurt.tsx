import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface RatHurtProps {
  width?: number;
  height?: number;
  fps?: number;
  style?: ViewStyle;
  spriteSheetWidth?: number;
  spriteSheetHeight?: number;
}

export function RatHurt({
  width = 64,
  height = 64,
  fps = 8,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: RatHurtProps) {
  const frameCount = 2;
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/5 Rat/Hurt.png')}
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

