import { ViewStyle } from 'react-native';
import { SpriteAnimation } from './SpriteAnimation';

interface Dog2WalkProps {
  width?: number;
  height?: number;
  fps?: number;
  style?: ViewStyle;
  spriteSheetWidth?: number;
  spriteSheetHeight?: number;
}

export function Dog2Walk({
  width = 64,
  height = 64,
  fps = 10,
  style,
  spriteSheetWidth,
  spriteSheetHeight,
}: Dog2WalkProps) {
  const frameCount = 4;
  const frameWidth = spriteSheetWidth ? spriteSheetWidth / frameCount : width;
  const frameHeight = spriteSheetHeight || height;

  return (
    <SpriteAnimation
      source={require('@/assets/images/Free Street Animal Pixel Art/2 Dog 2/Walk.png')}
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

