import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/config';

const WeatherSummary = ({ temp, condition, humidity, windSpeed, feelsLike }) => {
  return (
    <View 
      className="mx-6 p-5 rounded-3xl mb-5"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-4xl font-black" style={{ color: COLORS.text.primary }}>
            {temp}°
          </Text>
          <Text className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            Feels like {feelsLike}°
          </Text>
        </View>
        <View
          className="px-4 py-2 rounded-xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Text className="text-sm capitalize font-semibold" style={{ color: COLORS.text.secondary }}>
            {condition}
          </Text>
        </View>
      </View>
      
      <View 
        className="flex-row justify-between pt-4" 
        style={{ 
          borderTopWidth: 1, 
          borderTopColor: 'rgba(255, 255, 255, 0.1)' 
        }}
      >
        <View>
          <Text className="text-xs tracking-wider mb-1 font-bold" style={{ color: COLORS.text.muted }}>
            HUMIDITY
          </Text>
          <Text className="text-xl font-black" style={{ color: COLORS.text.primary }}>
            {humidity}%
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs tracking-wider mb-1 font-bold" style={{ color: COLORS.text.muted }}>
            WIND
          </Text>
          <Text className="text-xl font-black" style={{ color: COLORS.text.primary }}>
            {windSpeed} mph
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WeatherSummary;