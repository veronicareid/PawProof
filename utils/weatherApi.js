import { OPENWEATHER_API_KEY } from '../constants/config';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather + hourly forecast for a location
 */
export const getWeatherData = async (lat, lon) => {
  try {
    // fetch current weather
    const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current weather');
    }

    const currentData = await currentResponse.json();

    // fetch hourly forecast (5 day / 3 hour forecast is what's free)
    const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch forecast');
    }

    const forecastData = await forecastResponse.json();

    return {
      current: {
        temp: currentData.main.temp,
        feelsLike: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        cloudCover: currentData.clouds.all,
        uvIndex: 5, // free tier doesn't have UV, using default
        condition: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
      },
      hourly: forecastData.list.slice(0, 12).map(item => ({
        time: new Date(item.dt * 1000),
        temp: item.main.temp,
        cloudCover: item.clouds.all,
        uvIndex: 5, // default since not available in free tier
        condition: item.weather[0].description,
        icon: item.weather[0].icon,
      })),
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching weather:', error.message);
    }
    throw error;
  }
};

/**
 * Get weather icon emoji
 */
export const getWeatherEmoji = (iconCode) => {
  const emojiMap = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };

  return emojiMap[iconCode] || '☀️';
};
