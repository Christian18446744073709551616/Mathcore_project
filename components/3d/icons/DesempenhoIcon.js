import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DesempenhoIcon = ({ size = 31, color = '#000' }) => (
  <Svg width={size} height={size * (35/31)} viewBox="0 0 35 35" fill="none">
    <Path 
      d="M11.973 20.2563L10.2084 33.5417L17.5001 29.1667L24.7917 33.5417L23.0272 20.2417M27.7084 11.6667C27.7084 17.3046 23.138 21.875 17.5001 21.875C11.8622 21.875 7.29175 17.3046 7.29175 11.6667C7.29175 6.0288 11.8622 1.45837 17.5001 1.45837C23.138 1.45837 27.7084 6.0288 27.7084 11.6667Z" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default DesempenhoIcon;