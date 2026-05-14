import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { COLORS } from '../constants/config';

// non-color signal — icon per risk so colorblind users get a cue too
const RISK_ICONS = {
  tooCold: '🥶',
  safe: '🐾',
  caution: '⚠️',
  danger: '🔥',
};

const RISK_LABELS = {
  tooCold: 'Too cold',
  safe: 'Safe',
  caution: 'Caution',
  danger: 'Danger',
};

const ForecastItem = ({ time, temp, surfaceTemp, icon, riskLevel }) => {
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
  const riskIcon = RISK_ICONS[riskLevel] || RISK_ICONS.safe;

  return (
    <View
      className="items-center px-3 py-4 mr-3 rounded-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minWidth: 75,
      }}
      accessible
      accessibilityLabel={`${time}, ${temp} degrees air, ${surfaceTemp} degrees surface, ${RISK_LABELS[riskLevel] || 'safe'}`}
    >
      <Text className="text-xs mb-2 font-bold" style={{ color: COLORS.text.muted }}>
        {time}
      </Text>
      <Text className="text-2xl mb-2">{icon}</Text>
      <Text className="text-sm mb-2 font-semibold" style={{ color: COLORS.text.secondary }}>
        {temp}°
      </Text>
      <View
        className="flex-row items-center px-2 py-1 rounded-lg"
        style={{
          backgroundColor: `${riskColor}30`,
          borderWidth: 1,
          borderColor: riskColor,
        }}
      >
        <Text style={{ fontSize: 10, marginRight: 3 }} accessibilityElementsHidden importantForAccessibility="no">
          {riskIcon}
        </Text>
        <Text className="text-xs font-black" style={{ color: riskColor }}>
          {surfaceTemp}°
        </Text>
      </View>
    </View>
  );
};

const ForecastStrip = ({ hourlyData }) => {
  return (
    <View className="mb-5">
      <Text 
        className="text-xs uppercase tracking-widest px-6 mb-3 font-bold"
        style={{ color: COLORS.text.muted }}
      >
        Next 36 Hours
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {hourlyData.map((hour, index) => (
          <ForecastItem
            key={index}
            time={hour.time}
            temp={hour.temp}
            surfaceTemp={hour.surfaceTemp}
            icon={hour.icon}
            riskLevel={hour.riskLevel}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default ForecastStrip;