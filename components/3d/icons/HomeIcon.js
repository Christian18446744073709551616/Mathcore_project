import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = ({ size = 31, color = '#000' }) => (
  <Svg width={size} height={size * (35/31)} viewBox="0 0 31 35" fill="none">
    <Path 
      d="M11.125 32.0833V17.5H19.875V32.0833M2.375 13.125L15.5 2.91663L28.625 13.125V29.1666C28.625 29.9402 28.3177 30.682 27.7707 31.229C27.2237 31.776 26.4819 32.0833 25.7083 32.0833H5.29167C4.51812 32.0833 3.77625 31.776 3.22927 31.229C2.68229 30.682 2.375 29.9402 2.375 29.1666V13.125Z" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default HomeIcon;