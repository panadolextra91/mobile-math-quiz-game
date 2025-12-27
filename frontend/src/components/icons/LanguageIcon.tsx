import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LanguageIconProps {
  size?: number;
  color?: string;
}

export function LanguageIcon({ size = 24, color = 'white' }: LanguageIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 22H11V23H22V22Z" fill={color} />
      <Path d="M23 10H22V22H23V10Z" fill={color} />
      <Path d="M22 9H11V10H22V9Z" fill={color} />
      <Path
        d="M22 5V6H21V7H20V8H18V7H17V6H16V5H18V4H17V3H16V2H19V3H20V5H22Z"
        fill={color}
      />
      <Path
        d="M20 16V14H19V13H18V12H17V11H16V12H15V13H14V14H13V16H12V21H14V18H19V21H21V16H20ZM19 17H14V16H15V14H18V16H19V17Z"
        fill={color}
      />
      <Path d="M11 10H10V22H11V10Z" fill={color} />
      <Path d="M14 2H13V8H14V2Z" fill={color} />
      <Path d="M13 1H2V2H13V1Z" fill={color} />
      <Path d="M2 2H1V14H2V2Z" fill={color} />
      <Path d="M9 14H2V15H9V14Z" fill={color} />
      <Path
        d="M12 4V3H3V4H7V6H6V5H4V6H3V10H4V11H6V10H7V13H8V8H9V7H11V8H12V6H11V5H9V6H8V4H12ZM7 8H6V9H4V7H7V8Z"
        fill={color}
      />
      <Path
        d="M6 19V20H7V21H8V22H5V21H4V19H2V18H3V17H4V16H6V17H7V18H8V19H6Z"
        fill={color}
      />
    </Svg>
  );
}

