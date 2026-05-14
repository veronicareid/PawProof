import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/config';
import ToggleButton from './ToggleButton';

const ToggleGroup = ({ title, options, selectedId, onSelect }) => {
  return (
    <View className="px-6 mb-5">
      <Text 
        className="text-xs uppercase tracking-widest mb-3 font-bold"
        style={{ color: COLORS.text.muted }}
      >
        {title}
      </Text>
      <View className="flex-row">
        {options.map((option) => (
          <ToggleButton
            key={option.id}
            label={option.label}
            isActive={selectedId === option.id}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>
    </View>
  );
};

export default ToggleGroup;