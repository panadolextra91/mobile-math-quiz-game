import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
}

export function HomeIcon({ size = 24, color = '#fff' }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 11V10H21V9H20V8H19V7H18V6H17V5H16V4H15V3H14V2H13V1H11V2H10V3H9V4H8V5H7V6H6V7H5V8H4V9H3V10H2V11H1V12H4V22H5V23H9V16H15V23H19V22H20V12H23V11H22ZM19 11H18V21H17V15H16V14H8V15H7V21H6V11H5V10H6V9H7V8H8V7H9V6H10V5H11V4H13V5H14V6H15V7H16V8H17V9H18V10H19V11Z"
        fill={color}
      />
    </Svg>
  );
}

