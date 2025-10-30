import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DesempenhoIcon = ({ size = 31, color = '#000' }) => (
  <Svg width={size} height={size * (35/31)} viewBox="0 0 35 35" fill="none">
    <Path 
      d=""
       
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default DesempenhoIcon;