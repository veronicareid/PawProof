import React from 'react';
import { View, Text, Image } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/config';

const TempGauge = ({ surfaceTemp, riskLevel, unit = 'F' }) => {
  const size = 300;
  const strokeWidth = 24;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  
  const startAngle = 210;
  const totalDegrees = 300;
  
  const minTemp = 0;
  const maxTemp = 120;
  
  const tempPercent = Math.max(0, Math.min(1, (surfaceTemp - minTemp) / (maxTemp - minTemp)));
  const currentAngle = startAngle + (totalDegrees * tempPercent);
  
  const angleToRad = (angle) => ((angle - 90) * Math.PI) / 180;
  
  const createArcPath = (startDeg, endDeg) => {
    const start = angleToRad(startDeg);
    const end = angleToRad(endDeg);
    
    const startX = center + radius * Math.cos(start);
    const startY = center + radius * Math.sin(start);
    const endX = center + radius * Math.cos(end);
    const endY = center + radius * Math.sin(end);
    
    const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  };
  
  const backgroundPath = createArcPath(startAngle, startAngle + totalDegrees);
  const filledPath = createArcPath(startAngle, currentAngle);
  
  const getRiskColor = () => {
    switch(riskLevel) {
      case 'tooCold': return COLORS.tooCold;
      case 'safe': return COLORS.safe;
      case 'caution': return COLORS.caution;
      case 'danger': return COLORS.danger;
      default: return COLORS.safe;
    }
  };
  
  const riskColor = getRiskColor();
  
  return (
    <View
      className="items-center justify-center"
      style={{ paddingVertical: 40 }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Surface temperature ${surfaceTemp} degrees ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}`}
    >
      {/* sphere background */}
      <Image
  source={{ uri: 'https://pub-6df02c042da541a4b6a7e298edd57124.r2.dev/circl.png' }}
  style={{
    position: 'absolute',
    width: 460,
    height: 460,
    opacity: 0.7,
    transform: [{ rotate: '-90deg' }],
    top: (300 - 550) / 2 + 65,
  }}
  resizeMode="contain"
/>
      
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={riskColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={riskColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Background arc */}
        <Path
          d={backgroundPath}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Filled arc */}
        <Path
          d={filledPath}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Center text */}
      <View className="absolute items-center" style={{ top: size * 0.38 }}>
        <Text 
          className="font-black"
          style={{ 
            color: riskColor,
            fontSize: 64,
          }}
        >
          {surfaceTemp}°
        </Text>
        <Text 
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: COLORS.text.muted, marginTop: 4 }}
        >
          {unit === 'F' ? 'fahrenheit' : 'celsius'}
        </Text>
      </View>
    </View>
  );
};

export default TempGauge;