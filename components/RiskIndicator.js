import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/config';
import { getRiskLabel, getRiskDescription } from '../utils/tempCalculator';

// non-color signal — icon per risk so colorblind users get a cue too
const RISK_ICONS = {
  tooCold: '🥶',
  safe: '🐾',
  caution: '⚠️',
  danger: '🔥',
};

const RiskIndicator = ({ riskLevel }) => {
  const getRiskColors = () => {
    switch(riskLevel) {
      case 'tooCold': return { main: COLORS.tooCold, glow: COLORS.tooColdGlow };
      case 'safe': return { main: COLORS.safe, glow: COLORS.safeGlow };
      case 'caution': return { main: COLORS.caution, glow: COLORS.cautionGlow };
      case 'danger': return { main: COLORS.danger, glow: COLORS.dangerGlow };
      default: return { main: COLORS.safe, glow: COLORS.safeGlow };
    }
  };

  const colors = getRiskColors();
  const label = getRiskLabel(riskLevel);
  const description = getRiskDescription(riskLevel);
  const icon = RISK_ICONS[riskLevel] || RISK_ICONS.safe;

  return (
    <View
      className="items-center px-6 py-4"
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Walking risk: ${label}. ${description}.`}
    >
      <View
        className="flex-row items-center px-6 py-3 rounded-full mb-3"
        style={{
          backgroundColor: colors.glow,
          borderWidth: 2,
          borderColor: colors.main,
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 8 }} accessibilityElementsHidden importantForAccessibility="no">
          {icon}
        </Text>
        <Text
          className="text-lg font-black uppercase tracking-widest"
          style={{ color: colors.main }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="text-sm text-center font-medium"
        style={{ color: COLORS.text.secondary }}
      >
        {description}
      </Text>
    </View>
  );
};

export default RiskIndicator;