import React from 'react';
import Svg, { Path, G, ClipPath, Rect } from 'react-native-svg';

const FlashcardsIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <G clipPath="url(#clip0_flashcards)">
      <Path 
        d="M13.3333 14.1667L8.33333 10L3.33333 14.1667V2.5C3.33333 2.03976 3.52043 1.59864 3.85301 1.28806C4.18558 0.977478 4.63623 0.824427 5.10417 0.866667H12.5625C13.0304 0.824427 13.4811 0.977478 13.8137 1.28806C14.1462 1.59864 14.3333 2.03976 14.3333 2.5V14.1667Z" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </G>
    <defs>
      <ClipPath id="clip0_flashcards">
        <Rect width="20" height="20" fill="white"/>
      </ClipPath>
    </defs>
  </Svg>
);

export default FlashcardsIcon;