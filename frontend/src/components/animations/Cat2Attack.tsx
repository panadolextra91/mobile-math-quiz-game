import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface Cat2AttackProps {
  width?: number;
  height?: number;
  fps?: number;
  style?: ViewStyle;
  spriteSheetWidth?: number;
  spriteSheetHeight?: number;
}

export function Cat2Attack({
  width = 64,
  height = 64,
  fps = 12,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: Cat2AttackProps) {
  const frameCount = 4;
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/4 Cat 2/Attack.png')}
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

