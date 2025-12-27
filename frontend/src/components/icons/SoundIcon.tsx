import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SoundIconProps {
  size?: number;
  color?: string;
}

export function SoundIcon({ size = 24, color = 'white' }: SoundIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 1V2H18V3H15V4H11V5H8V6H6V16H3V17H2V18H1V21H2V22H3V23H7V22H8V21H9V11H11V10H15V9H18V8H20V13H17V14H16V15H15V18H16V19H17V20H21V19H22V18H23V1H21ZM3 21V18H7V21H3ZM18 6V7H15V8H11V9H8V7H11V6H15V5H18V4H21V6H18ZM17 18V15H21V18H17Z"
        fill={color}
      />
    </Svg>
  );
}

