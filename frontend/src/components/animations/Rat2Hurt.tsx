import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface Rat2HurtProps {
  width?: number;
  height?: number;
  fps?: number;
  style?: ViewStyle;
  spriteSheetWidth?: number;
  spriteSheetHeight?: number;
}

export function Rat2Hurt({
  width = 64,
  height = 64,
  fps = 8,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: Rat2HurtProps) {
  const frameCount = 2;
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/6 Rat 2/Hurt.png')}
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

