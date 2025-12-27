import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface CoinIconProps {
  size?: number;
}

export function CoinIcon({ size = 200 }: CoinIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Rect x="140" y="60" width="20" height="20" fill="#FFA600" />
      <Rect x="61" width="80" height="20" fill="black" />
      <Rect x="61" y="20" width="80" height="20" fill="#FFD900" />
      <Rect x="60" y="40" width="80" height="20" fill="#FFA600" />
      <Rect x="40" y="40" width="20" height="20" fill="#FFD900" />
      <Rect x="140" y="40" width="20" height="20" fill="#FFD900" />
      <Rect x="160" y="60" width="20" height="20" fill="#FFD900" />
      <Rect x="20" y="60" width="120" height="20" fill="#FFD900" />
      <Rect x="20" y="100" width="160" height="20" fill="#FFD900" />
      <Rect x="20" y="80" width="160" height="20" fill="#FFD900" />
      <Rect x="20" y="120" width="160" height="20" fill="#FFD900" />
      <Rect x="40" y="140" width="120" height="20" fill="#FFD900" />
      <Rect x="60" y="160" width="80" height="20" fill="#FFD900" />
      <Rect x="20" y="140" width="20" height="20" fill="black" />
      <Rect x="160" y="140" width="20" height="20" fill="black" />
      <Rect x="19" y="40" width="21" height="20" fill="black" />
      <Rect x="160" y="40" width="20" height="20" fill="black" />
      <Rect y="60" width="20" height="20" fill="black" />
      <Rect x="180" y="60" width="20" height="20" fill="black" />
      <Rect y="100" width="20" height="20" fill="black" />
      <Rect x="180" y="100" width="20" height="20" fill="black" />
      <Rect y="80" width="20" height="20" fill="black" />
      <Rect x="140" y="80" width="20" height="60" fill="white" />
      <Rect x="40" y="60" width="20" height="80" fill="#FFA600" />
      <Rect x="60" y="140" width="80" height="20" fill="#FFA600" />
      <Rect x="180" y="80" width="20" height="20" fill="black" />
      <Rect y="120" width="20" height="20" fill="black" />
      <Rect x="180" y="120" width="20" height="20" fill="black" />
      <Rect x="140" y="60" width="20" height="20" fill="#FFA600" />
      <Rect x="60" y="120" width="20" height="20" fill="#FFA600" />
      <Rect x="60" y="60" width="20" height="20" fill="#FFA600" />
      <Rect x="120" y="120" width="20" height="20" fill="white" />
      <Rect x="40" y="160" width="20" height="20" fill="black" />
      <Rect x="140" y="160" width="20" height="20" fill="black" />
      <Rect x="40" y="20" width="21" height="20" fill="black" />
      <Rect x="140" y="20" width="20" height="20" fill="black" />
      <Rect x="60" y="180" width="80" height="20" fill="black" />
    </Svg>
  );
}

