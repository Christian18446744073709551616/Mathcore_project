import React from 'react';
import Svg, { Path } from 'react-native-svg';

const MenuIcon = ({ size = 31, color = '#000' }) => (
  <Svg width={size} height={size * (35/31)} viewBox="0 0 35 35" fill="none">
    <Path 
      d="M0.375 18.25V15.3333H26.625V18.25H0.375ZM0.375 10.9583V8.04167H26.625V10.9583H0.375ZM0.375 3.66667V0.75H26.625V3.66667H0.375Z" 
      stroke={color} 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default MenuIcon;