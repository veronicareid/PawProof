import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { COLORS } from '../constants/config';

const ToggleButton = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 mx-1"
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      <View
        className="py-3 px-2 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: isActive 
            ? COLORS.glassHighlight
            : 'rgba(255, 255, 255, 0.02)',
          borderWidth: 1.5,
          borderColor: isActive 
            ? COLORS.glassBorder 
            : 'rgba(255, 255, 255, 0.05)',
          minHeight: 50,
        }}
      >
        <Text
          className="font-bold text-center"
          style={{
            color: isActive ? COLORS.text.primary : COLORS.text.muted,
            fontSize: 12,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ToggleButton;