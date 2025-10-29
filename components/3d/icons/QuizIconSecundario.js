import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DesempenhoIcon = ({ size = 31, color = '#000' }) => (
  <Svg width={size} height={size * (35/31)} viewBox="0 0 35 35" fill="none">
    <Path 
      d="M17.5001 10.2083C17.5001 8.66124 16.8855 7.17751 15.7915 6.08354C14.6976 4.98958 13.2138 4.375 11.6667 4.375H2.91675V26.25H13.1251C14.2854 26.25 15.3982 26.7109 16.2187 27.5314C17.0391 28.3519 17.5001 29.4647 17.5001 30.625M17.5001 10.2083V30.625M17.5001 10.2083C17.5001 8.66124 18.1147 7.17751 19.2086 6.08354C20.3026 4.98958 21.7863 4.375 23.3334 4.375H32.0834V26.25H21.8751C20.7148 26.25 19.602 26.7109 18.7815 27.5314C17.961 28.3519 17.5001 29.4647 17.5001 30.625" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default DesempenhoIcon;