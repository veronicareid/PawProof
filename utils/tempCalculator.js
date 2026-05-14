import { TEMP_THRESHOLDS } from '../constants/config';

/**
 * Calculate surface temperature using research-based formula
 * Based on studies of pavement heating and solar radiation effects
 * 
 * @param {number} airTemp - Air temperature in Fahrenheit
 * @param {number} cloudCover - Cloud coverage (0-100%)
 * @param {number} uvIndex - UV index from weather API
 * @param {string} surfaceType - 'asphalt', 'concrete', 'turf', 'sand'
 * @param {string} sunExposure - 'full', 'partial', 'shade'
 * @param {number} hour - Hour of day (0-23) for solar angle calculation
 * @returns {number} Estimated surface temperature in Fahrenheit
 */
export const calculateSurfaceTemp = (
  airTemp, 
  cloudCover = 0, 
  uvIndex = 0,
  surfaceType = 'asphalt',
  sunExposure = 'full',
  hour = 12
) => {
  // Surface albedo (heat absorption) - higher = absorbs more heat
  const surfaceAlbedo = {
    asphalt: 0.95,   // darkest, absorbs most
    concrete: 0.85,  // lighter than asphalt
    turf: 0.25,      // reflects most heat
    sand: 0.40,      // moderate absorption
  };

  // Sun exposure modifiers
  const sunModifier = {
    full: 1.0,
    partial: 0.7,
    shade: 0.3,
  };

  // Solar intensity based on time of day (solar angle)
  // peaks around 12pm-2pm, lower at morning/evening
  const getSolarIntensity = (hour) => {
    // simplified solar curve - peaks at solar noon
    const solarNoon = 13; // 1pm
    const hourDiff = Math.abs(hour - solarNoon);
    
    if (hourDiff <= 2) return 1.0; // peak sun
    if (hourDiff <= 4) return 0.8;
    if (hourDiff <= 6) return 0.5;
    return 0.2; // early morning/late evening
  };

  // Base temperature difference (how much hotter surface can get than air)
  // Research shows asphalt can be 50-70°F hotter in peak conditions
  const maxTempDifference = 60;

  // Calculate actual solar radiation effect
  const solarIntensity = getSolarIntensity(hour);
  const cloudFactor = 1 - (cloudCover / 100); // convert % to 0-1, invert
  const uvFactor = Math.min(uvIndex / 11, 1); // normalize UV index (11 is extreme)
  
  // Combined solar radiation coefficient
  const solarEffect = solarIntensity * cloudFactor * uvFactor * sunModifier[sunExposure];
  
  // Calculate temperature increase based on surface type
  const tempIncrease = maxTempDifference * surfaceAlbedo[surfaceType] * solarEffect;
  
  // Final surface temperature
  const surfaceTemp = airTemp + tempIncrease;
  
  return Math.round(surfaceTemp);
};

/**
 * Get risk level based on surface temperature
 * Based on veterinary "7-second rule" and paw pad safety research
 */
export const getRiskLevel = (surfaceTemp) => {
  if (surfaceTemp < TEMP_THRESHOLDS.tooCold) return 'tooCold';
  if (surfaceTemp < TEMP_THRESHOLDS.safe) return 'safe';
  if (surfaceTemp < TEMP_THRESHOLDS.caution) return 'caution';
  return 'danger';
};

export const getRiskLabel = (riskLevel) => {
  const labels = {
    tooCold: 'Too Cold',
    safe: 'Safe to Walk',
    caution: 'Use Caution',
    danger: 'Too Hot - Danger',
  };
  return labels[riskLevel];
};

export const getRiskDescription = (riskLevel) => {
  const descriptions = {
    tooCold: 'Risk of frostbite on paws',
    safe: 'Perfect conditions for walking',
    caution: 'Limit walk time, seek shade',
    danger: 'Paw pad burns possible - avoid walking',
  };
  return descriptions[riskLevel];
};

// Temperature conversion utilities
export const fahrenheitToCelsius = (temp) => Math.round((temp - 32) * 5/9);
export const celsiusToFahrenheit = (temp) => Math.round((temp * 9/5) + 32);

/**
 * Find safe walking windows in hourly forecast
 * @param {Array} hourlyData - Array of hourly weather data with calculated surface temps
 * @returns {Array} Array of safe time windows
 */
export const findSafeWindows = (hourlyData) => {
  const safeHours = hourlyData
    .filter(hour => {
      const risk = getRiskLevel(hour.surfaceTemp);
      return risk === 'safe';
    })
    .map(hour => hour.time);
  
  return safeHours;
};