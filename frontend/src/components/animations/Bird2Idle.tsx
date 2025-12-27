import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface Bird2IdleProps {
  width?: number;
  height?: number;
  fps?: number;
  style?: ViewStyle;
  spriteSheetWidth?: number;
  spriteSheetHeight?: number;
}

export function Bird2Idle({
  width = 64,
  height = 64,
  fps = 8,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: Bird2IdleProps) {
  const frameCount = 4;
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/8 Bird 2/Idle.png')}
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

