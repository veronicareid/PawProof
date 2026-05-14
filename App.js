import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import * as Location from 'expo-location';
import "./global.css";
import TempGauge from './components/TempGauge';
import RiskIndicator from './components/RiskIndicator';
import ToggleGroup from './components/ToggleGroup';
import WeatherSummary from './components/WeatherSummary';
import ForecastStrip from './components/ForecastStrip';
import LocationPicker from './components/LocationPicker';
import { SURFACE_TYPES, SUN_EXPOSURE, COLORS, OPENWEATHER_API_KEY } from './constants/config';
import { calculateSurfaceTemp, getRiskLevel, fahrenheitToCelsius } from './utils/tempCalculator';
import { getWeatherData, getWeatherEmoji } from './utils/weatherApi';

export default function App() {
  // state
  const [selectedSurface, setSelectedSurface] = useState('asphalt');
  const [selectedSun, setSelectedSun] = useState('full');
  const [unit, setUnit] = useState('F');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 39.7392,
    lon: -104.9903,
    name: 'Denver, CO',
  });
  
  // fetch weather on mount and when location changes
  useEffect(() => {
    fetchWeather();
  }, [currentLocation]);
  
  // get user's location on first launch
  useEffect(() => {
    getCurrentLocation();
  }, []);
  
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      
      setCurrentLocation({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        name: data[0] ? `${data[0].name}${data[0].state ? ', ' + data[0].state : ''}` : 'Current Location',
      });
    } catch (error) {
      console.log('Could not get location:', error);
    }
  };
  
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherData(currentLocation.lat, currentLocation.lon);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getWeatherData(currentLocation.lat, currentLocation.lon);
      setWeatherData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, [currentLocation]);
  
  const handleSelectLocation = (location) => {
    setCurrentLocation(location);
  };

  // helper to convert temp based on unit
  const displayTemp = (tempF) => {
    if (unit === 'C') {
      return fahrenheitToCelsius(tempF);
    }
    return Math.round(tempF);
  };
  
  // show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color={COLORS.safe} />
        <Text className="mt-4 font-semibold" style={{ color: COLORS.text.secondary }}>
          Loading weather...
        </Text>
      </SafeAreaView>
    );
  }
  
  // show error state
  if (error || !weatherData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: '#000000' }}>
        <Text className="text-lg mb-4 font-bold" style={{ color: COLORS.danger }}>
          {error || 'No weather data available'}
        </Text>
        <TouchableOpacity
          onPress={fetchWeather}
          accessibilityRole="button"
          accessibilityLabel="Retry loading weather"
          className="px-6 py-3 rounded-2xl"
          style={{
            backgroundColor: COLORS.safe,
          }}
        >
          <Text className="font-black" style={{ color: '#000000' }}>
            Retry
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // calculate current surface temp (always in F for calculations)
  const currentHour = new Date().getHours();
  const surfaceTempF = calculateSurfaceTemp(
    weatherData.current.temp,
    weatherData.current.cloudCover,
    weatherData.current.uvIndex,
    selectedSurface,
    selectedSun,
    currentHour
  );
  const riskLevel = getRiskLevel(surfaceTempF);
  
  // format hourly forecast
  const hourlyData = weatherData.hourly.map(hour => {
    const hourNum = hour.time.getHours();
    const surfF = calculateSurfaceTemp(
      hour.temp,
      hour.cloudCover,
      hour.uvIndex,
      selectedSurface,
      selectedSun,
      hourNum
    );
    
    return {
      time: `${hourNum % 12 || 12}${hourNum < 12 ? 'am' : 'pm'}`,
      temp: displayTemp(hour.temp),
      surfaceTemp: displayTemp(surfF),
      icon: getWeatherEmoji(hour.icon),
      riskLevel: getRiskLevel(surfF),
    };
  });
  
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.text.secondary}
          />
        }
      >
        {/* Header */}
<View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
  <TouchableOpacity
    onPress={() => setLocationPickerVisible(true)}
    accessibilityRole="button"
    accessibilityLabel={`Change location. Current: ${currentLocation.name}`}
  >
    <View className="flex-row items-center mb-1">
      <Image
        source={require('./assets/pawproof-logo.png')}
        style={{
          width: 32,
          height: 32,
          marginRight: 8,
        }}
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
        PawProof
      </Text>
    </View>
    <View className="flex-row items-center">
      <Text className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
        {currentLocation.name}
      </Text>
      <Text className="text-xs ml-2" style={{ color: COLORS.text.muted }}>
        ▼
      </Text>
    </View>
  </TouchableOpacity>
  
  {/* Unit toggle */}
  <TouchableOpacity
    onPress={() => setUnit(unit === 'F' ? 'C' : 'F')}
    accessibilityRole="button"
    accessibilityLabel={`Temperature unit: ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}. Tap to switch.`}
    className="px-5 py-3 rounded-2xl"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    }}
  >
    <Text className="font-black text-base" style={{ color: COLORS.text.primary }}>
      °{unit}
    </Text>
  </TouchableOpacity>
</View>
        
        {/* Gauge */}
        <View className="py-4">
          <TempGauge 
            surfaceTemp={displayTemp(surfaceTempF)}
            riskLevel={riskLevel}
            unit={unit}
          />
        </View>
        
        {/* Risk indicator */}
        <RiskIndicator riskLevel={riskLevel} />
        
        {/* Surface type toggles */}
        <ToggleGroup
          title="Surface Type"
          options={SURFACE_TYPES}
          selectedId={selectedSurface}
          onSelect={setSelectedSurface}
        />
        
        {/* Sun exposure toggles */}
        <ToggleGroup
          title="Sun Exposure"
          options={SUN_EXPOSURE}
          selectedId={selectedSun}
          onSelect={setSelectedSun}
        />
        
        {/* Weather summary */}
        <WeatherSummary
          temp={displayTemp(weatherData.current.temp)}
          condition={weatherData.current.condition}
          humidity={weatherData.current.humidity}
          windSpeed={Math.round(weatherData.current.windSpeed)}
          feelsLike={displayTemp(weatherData.current.feelsLike)}
        />
        
        {/* Forecast strip */}
        <ForecastStrip hourlyData={hourlyData} />
        
        <View className="h-8" />
      </ScrollView>
      
      {/* Location picker modal */}
      <LocationPicker
        visible={locationPickerVisible}
        onClose={() => setLocationPickerVisible(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={currentLocation}
      />
    </SafeAreaView>
  );
}