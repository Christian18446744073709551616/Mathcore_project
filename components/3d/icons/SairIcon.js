import React from 'react';
import Svg, { Path, G, ClipPath, Rect } from 'react-native-svg';

const SairIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <G clipPath="url(#clip0_sair)">
      <Path 
        d="M6.66667 14.1667H3.33333C2.89131 14.1667 2.46738 13.9911 2.15482 13.6785C1.84226 13.366 1.66667 12.942 1.66667 12.5V3.33333C1.66667 2.89131 1.84226 2.46738 2.15482 2.15482C2.46738 1.84226 2.89131 1.66667 3.33333 1.66667H6.66667M11.6667 11.6667L15 8.33333M15 8.33333L11.6667 5M15 8.33333H6.66667" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </G>
    <defs>
      <ClipPath id="clip0_sair">
        <Rect width="20" height="20" fill="white"/>
      </ClipPath>
    </defs>
  </Svg>
);

export default SairIcon;