import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ExerciciosIcon = ({ size = 31, color = '#000' }) => (
  <Svg width={size} height={size * (35/31)} viewBox="0 0 35 35" fill="none">
    <Path 
      d="M32.0834 16.1582V17.4999C32.0816 20.6447 31.0633 23.7046 29.1804 26.2234C27.2974 28.7421 24.6507 30.5847 21.635 31.4764C18.6193 32.3681 15.3961 32.261 12.4462 31.1712C9.49628 30.0813 6.9777 28.0671 5.26607 25.4289C3.55443 22.7908 2.74144 19.67 2.94836 16.532C3.15528 13.394 4.37101 10.407 6.41424 8.01645C8.45747 5.62587 11.2187 3.95982 14.2862 3.26676C17.3537 2.57371 20.563 2.89079 23.4355 4.17072M32.0834 5.83322L17.5001 20.4311L13.1251 16.0561" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default ExerciciosIcon;