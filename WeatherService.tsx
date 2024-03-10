/* 
  This is the logic for the weather fetching and forecasting logic

  Axios for HTTP requests, 
  expo-location for native device location
  date-fns for better date formatting
*/
import axios from "axios";
import * as Location from "expo-location";
import { format, parseISO } from "date-fns";

// TS interfaces for defining the shape of both the weather and forecast data
export interface WeatherData {
  name: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

export interface ForecastData {
  list: Array<{
    dt_txt: string;
    main: {
      temp: number;
    };
  }>;
  city: {
    name: string;
  };
}

// Main weather function to fetch the current weather and forecasting data. Takes an optional city name or uses the device's location
export async function getWeatherData(
  city: string | undefined,
  apiKey: string,
  baseUrl: string,
  unit: string
): Promise<{ currWeather: WeatherData | null; forecast: ForecastData | null }> {
  let latitude: number | null = null;
  let longitude: number | null = null;

  // If a city name is provided, use the free geocoding API to get the city's latitude and longitude
  if (city) {
    try {
      const geocodeRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );
      if (geocodeRes.data && geocodeRes.data.length > 0) {
        latitude = geocodeRes.data[0].lat;
        longitude = geocodeRes.data[0].lon;
      } else {
        throw new Error("Entered city not found");
      }
    } catch (error) {
      throw new Error(
        `Geocoding error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  } else {
    // If no city name is provided, use the device's location. (if granted permission by the user)
    const locationPermission =
      await Location.requestForegroundPermissionsAsync();
    if (locationPermission.status === "granted") {
      const deviceLocation = await Location.getCurrentPositionAsync({});
      latitude = deviceLocation.coords.latitude;
      longitude = deviceLocation.coords.longitude;
    } else {
      throw new Error(
        "Device location permission not granted. Enter a city name for weather data."
      );
    }
  }

  // Get weather and forecasting data, with axios, by using the gathered latitude and longitude (city name / device's location)
  if (latitude !== null && longitude !== null) {
    try {
      const weatherUrl = `${baseUrl}/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`;
      const forecastUrl = `${baseUrl}/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`;

      const [weatherRes, forecastRes] = await Promise.all([
        axios.get<WeatherData>(weatherUrl),
        axios.get<ForecastData>(forecastUrl),
      ]);

      return { currWeather: weatherRes.data, forecast: forecastRes.data };
    } catch (error) {
      throw new Error(
        `API error: ${error instanceof Error ? error.message : "Error unknown"}`
      );
    }
  } else {
    return { currWeather: null, forecast: null };
  }
}

// Util. function to group forecasting data by their dates and also calculating the daily average, minimum, and maximum temps. (Needs improving, maybe combining with new API call...)
export function groupDates(forecastList: ForecastData["list"]): {
  [key: string]: any;
} {
  const byDays: {
    [key: string]: {
      items: ForecastData["list"];
      avgTemp: number;
      minTemp: number;
      maxTemp: number;
    };
  } = {};

  forecastList.forEach((item) => {
    const day = format(parseISO(item.dt_txt), "yyyy-MM-dd");

    if (!byDays[day]) {
      byDays[day] = {
        items: [],
        avgTemp: 0,
        minTemp: Infinity,
        maxTemp: -Infinity,
      };
    }
    byDays[day].items.push(item);
    byDays[day].minTemp = Math.min(byDays[day].minTemp, item.main.temp);
    byDays[day].maxTemp = Math.max(byDays[day].maxTemp, item.main.temp);
  });

  // Calculate the avg. temp. for each given day
  Object.keys(byDays).forEach((day) => {
    const dayForecasts = byDays[day].items;
    const avgTemp =
      dayForecasts.reduce((acc, curr) => acc + curr.main.temp, 0) /
      dayForecasts.length;
    byDays[day].avgTemp = parseFloat(avgTemp.toFixed(1));
  });

  return byDays;
}
