import React from 'react';
import Svg, { Rect, G } from 'react-native-svg';

interface TrophyIconProps {
  size?: number;
}

export function TrophyIcon({ size = 240 }: TrophyIconProps) {
  // Calculate scale factor to maintain aspect ratio (260:240)
  const width = size * (260 / 240);
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 260 240" fill="none">
      {/* Black rectangles */}
      <Rect x="80" y="40" width="20" height="20" fill="black" />
      <Rect x="80" y="20" width="20" height="20" fill="black" />
      <Rect x="100" width="20" height="20" fill="black" />
      <Rect x="120" width="20" height="20" fill="black" />
      <Rect x="180" y="60" width="20" height="20" fill="black" />
      <Rect y="100" width="20" height="20" fill="black" />
      <Rect x="240" y="100" width="20" height="20" fill="black" />
      <Rect x="20" y="120" width="20" height="20" fill="black" />
      <Rect x="140" y="40" width="20" height="20" fill="white" />
      <Rect x="140" y="200" width="20" height="20" fill="black" />
      <Rect x="140" width="20" height="20" fill="black" />
      <Rect x="220" y="120" width="20" height="20" fill="black" />
      <Rect x="20" y="200" width="20" height="20" fill="black" />
      <G transform="matrix(-1 0 0 1 240 200)">
        <Rect width="20" height="20" fill="black" />
      </G>
      <Rect x="20" y="220" width="80" height="20" fill="black" />
      <G transform="matrix(-1 0 0 1 200 220)">
        <Rect width="40" height="20" fill="black" />
      </G>
      <Rect x="40" y="140" width="20" height="20" fill="black" />
      <Rect x="200" y="140" width="20" height="20" fill="black" />
      <Rect x="40" y="180" width="20" height="20" fill="black" />
      <G transform="matrix(-1 0 0 1 220 180)">
        <Rect width="20" height="20" fill="black" />
      </G>
      <Rect x="100" y="200" width="40" height="20" fill="black" />
      <Rect x="60" y="140" width="20" height="40" fill="black" />
      <G transform="matrix(-1 0 0 1 200 140)">
        <Rect width="20" height="40" fill="black" />
      </G>
      <Rect x="160" y="20" width="20" height="40" fill="black" />
      <Rect y="80" width="80" height="20" fill="black" />
      <Rect x="200" y="220" width="20" height="20" fill="#FFD900" />
      <Rect x="20" y="100" width="220" height="20" fill="#FFD900" />
      <Rect x="40" y="120" width="180" height="20" fill="#FFD900" />
      <Rect x="100" y="140" width="80" height="60" fill="#FFD900" />
      <Rect x="60" y="180" width="40" height="40" fill="#FFD900" />
      <Rect x="40" y="200" width="20" height="22" fill="#FFD900" />
      <Rect x="40" y="220" width="20" height="20" fill="#FFD900" />
      <Rect x="20" y="220" width="20" height="20" fill="#FFD900" />
      <Rect x="220" y="220" width="20" height="20" fill="#FFD900" />
      <Rect x="200" y="200" width="20" height="20" fill="#FFD900" />
      <Rect x="180" y="180" width="20" height="20" fill="#FFD900" />
      <Rect x="180" y="200" width="20" height="20" fill="#FFD900" />
      <Rect x="160" y="200" width="20" height="20" fill="#FFD900" />
      <Rect x="80" y="60" width="100" height="120" fill="#FFD900" />
      <Rect x="100" y="20" width="60" height="60" fill="#FFD900" />
      <Rect x="180" y="80" width="80" height="20" fill="black" />
      <Rect x="60" y="60" width="20" height="20" fill="black" />
      <Rect x="100" y="100" width="20" height="40" fill="black" />
      <Rect x="140" y="100" width="20" height="40" fill="black" />
      <Rect x="181" y="220" width="59" height="20" fill="black" />
      <Rect x="20" y="220" width="40" height="20" fill="black" />
    </Svg>
  );
}

