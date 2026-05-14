import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';  // ← RIGHT HERE
import { COLORS, OPENWEATHER_API_KEY } from '../constants/config';

const LocationPicker = ({ visible, onClose, onSelectLocation, currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${OPENWEATHER_API_KEY}`
      );
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    onSelectLocation({
      lat: result.lat,
      lon: result.lon,
      name: `${result.name}${result.state ? ', ' + result.state : ''}, ${result.country}`,
    });
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      // we'll implement this with expo-location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Permission to access location was denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // reverse geocode to get city name
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      
      onSelectLocation({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        name: data[0] ? `${data[0].name}, ${data[0].country}` : 'Current Location',
      });
      onClose();
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Failed to get your location.');
    } finally {
      setGettingLocation(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          className="rounded-t-3xl p-6"
          style={{
            backgroundColor: COLORS.cardBg,
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
              Choose Location
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close location picker"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text className="text-lg" style={{ color: COLORS.text.secondary }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current location button */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={gettingLocation}
            accessibilityRole="button"
            accessibilityLabel="Use current location"
            accessibilityState={{ disabled: gettingLocation, busy: gettingLocation }}
            className="flex-row items-center justify-center py-4 rounded-xl mb-4"
            style={{
              backgroundColor: COLORS.glass,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            {gettingLocation ? (
              <ActivityIndicator color={COLORS.text.primary} />
            ) : (
              <>
                <Text className="text-lg mr-2">📍</Text>
                <Text className="font-semibold" style={{ color: COLORS.text.primary }}>
                  Use Current Location
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Search input */}
          <View className="mb-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search city..."
              placeholderTextColor={COLORS.text.muted}
              returnKeyType="search"
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: COLORS.glass,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: COLORS.text.primary,
              }}
            />
          </View>

          {/* Search results */}
          {searching ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={COLORS.text.primary} />
            </View>
          ) : searchResults.length > 0 ? (
            <View>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectResult(result)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${result.name}${result.state ? ', ' + result.state : ''}, ${result.country}`}
                  className="py-3 border-b"
                  style={{ borderBottomColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Text style={{ color: COLORS.text.primary }}>
                    {result.name}
                    {result.state && `, ${result.state}`}
                  </Text>
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    {result.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default LocationPicker;