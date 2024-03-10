/* 
  This is the main file, and component for the app

  Beginning by importing needed React components & utilities
  date-fns for date formatting, @env for environment variables (API key), some additional custom utility and style modules
  Importing some utility functions and interfaces from WeatherService.tsx (weather and forecasting logic)
*/
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  Pressable,
  useWindowDimensions,
  Dimensions,
  ScrollView,
} from "react-native";
import { format } from "date-fns";
import { WEATHER_API_KEY } from "@env";
import {
  getWeatherData,
  groupDates,
  WeatherData,
  ForecastData,
} from "./WeatherService";
import { styles, colors } from "./Styles";

// Constants for openweatherapi base URL, and units
const BASEURL = "https://api.openweathermap.org/data/2.5";
const UNIT = "metric";

// Main component
export default function App() {
  // Hooks for managing UI states and data
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [currWeather, setCurrWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);

  // Windows dimension hook, used for more responsive design
  const { width } = useWindowDimensions();
  const dynamicPadding = width > 768 ? "20%" : "5%";

  // Fetching weather data, and setting initial states
  const fetchWeatherData = useCallback(
    async (city?: string) => {
      setIsLoading(true);
      try {
        const data = await getWeatherData(city, WEATHER_API_KEY, BASEURL, UNIT);
        setCurrWeather(data.currWeather);
        setForecast(data.forecast);
        setErrMsg(null);
      } catch (error) {
        setErrMsg(
          error instanceof Error ? error.message : "Unable to get weather data"
        );
      } finally {
        setIsLoading(false); // Loading state reset
      }
    },
    [WEATHER_API_KEY, BASEURL, UNIT] // useCallback dependencies
  );

  // Hook used when fetching weather data on component mount
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Utility function to figure out if the device's screen is large based on its width
  const isLargeScreen = () => {
    const windowWidth = Dimensions.get("window").width;
    return windowWidth >= 768;
  };

  /* 
    Main rendering components for visualizing the app
    Components for rendering the app's: header, footer and entire content area wrapped inside appropriate views
    All in all including: views, texts, inputs, buttons, conditional logic, etc.
    Styling found in Style.tsx
  */
  const Header = () => (
    <View style={[styles.contentContainer, styles.header]}>
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Weather & Forecast App 🌞</Text>
        {/* Lets user input a city name for detailed weather forecast */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter A City Name"
            placeholderTextColor="#F7F7F7"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        {/* Using pressable (i.e. buttons) to let users fetch data based on a city name or their device's location (to be reworked)*/}
        <Pressable
          style={styles.button}
          onPress={() => fetchWeatherData(location)}
          accessibilityRole="button"
          accessibilityLabel="Check the weather and forecast for entered city name"
        >
          <Text style={styles.buttonText}>Check City Weather 🔎</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => fetchWeatherData()}
          accessibilityRole="button"
          accessibilityLabel="Use your device's location for weather and forecast data"
        >
          <Text style={styles.buttonText}>Use My Location 📍</Text>
        </Pressable>
      </View>
    </View>
  );

  // Component for handling current and daily 5-day forecasting visualizations
  const Footer = () => (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#00ff00" />
      ) : (
        <>
          {/* Detailed current weather, adapting for large screens */}
          {currWeather && (
            <View style={styles.weatherDetailsContainer}>
              <Text style={styles.headerTwo}>
                📍Current {currWeather.name} Weather
              </Text>
              <View style={isLargeScreen() ? styles.weatherDetailsRow : null}>
                <View>
                  <Text style={styles.weatherDetail}>
                    🌡️ Temperature: {currWeather.main.temp.toFixed(1)}°C
                  </Text>
                  <Text style={styles.weatherDetail}>
                    😓 Feels Like: {currWeather.main.feels_like.toFixed(1)}
                    °C
                  </Text>
                  <Text style={styles.weatherDetail}>
                    🔽 Min: {currWeather.main.temp_min.toFixed(1)}°C
                  </Text>
                  <Text style={styles.weatherDetail}>
                    🔼 Max: {currWeather.main.temp_max.toFixed(1)}°C
                  </Text>
                </View>
                <View>
                  <Text style={styles.weatherDetail}>
                    💧 Humidity: {currWeather.main.humidity}%
                  </Text>
                  <Text style={styles.weatherDetail}>
                    📏 Pressure: {currWeather.main.pressure} hPa
                  </Text>
                  <Text style={styles.weatherDetail}>
                    💨 Wind: {currWeather.wind.speed} m/s
                  </Text>
                </View>
              </View>
            </View>
          )}
          {forecast && (
            <View style={styles.weatherDetailsContainer}>
              <Text style={[styles.headerTwo, { marginBottom: 10 }]}>
                {forecast.city.name} 5-Day Forecast
              </Text>
              {/* Expandable detailed forecast for a day */}
              {Object.entries(groupDates(forecast.list)).map(
                ([day, { items, avgTemp, minTemp, maxTemp }], index) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Press the day to view more weather data in detail"
                    key={index}
                    onPress={() =>
                      setExpandedDay(expandedDay === day ? null : day)
                    }
                    style={[
                      styles.dayContainer,
                      {
                        // Even and odd has different background colors for better UI/UX
                        backgroundColor:
                          index % 2 === 0
                            ? colors.evenDayBackground
                            : colors.oddDayBackground,
                        borderRadius: 8,
                        marginBottom: 8,
                        padding: 10,
                      },
                    ]}
                  >
                    <Text style={[styles.forecastHeading, { marginBottom: 4 }]}>
                      📅 {format(new Date(day), "EEE dd.MM")}
                    </Text>
                    <Text style={styles.weatherDetail}>
                      🌡️ Avg: {avgTemp}°C, 🔽 Min: {minTemp.toFixed(1)}°C, 🔼
                      Max: {maxTemp.toFixed(1)}°C
                    </Text>
                    {expandedDay === day &&
                      items.map(
                        (
                          item: {
                            dt_txt: string | number | Date;
                            main: { temp: number };
                          },
                          idx: React.Key | null | undefined
                        ) => (
                          <Text
                            key={idx}
                            style={[styles.weatherDetail, { marginLeft: 10 }]}
                          >
                            🕒 {format(new Date(item.dt_txt), "HH:mm")}:{" "}
                            {item.main.temp.toFixed(1)}°C
                          </Text>
                        )
                      )}
                  </Pressable>
                )
              )}
            </View>
          )}
          <Text style={[styles.text, styles.footer]}>
            Samuel Granvik © {new Date().getFullYear()}
          </Text>
          {errMsg && <Text style={styles.error}>{errMsg}</Text>}
        </>
      )}
    </View>
  );

  // Main return of the func. component, applying the SafeAreaView and ScrollView structures for content display.
  return (
    <SafeAreaView
      style={[
        styles.safeArea, // Styles found in Styles.tsx
        { paddingRight: dynamicPadding, paddingLeft: dynamicPadding },
      ]}
    >
      <ScrollView>
        {Header()}
        {Footer()}
      </ScrollView>
    </SafeAreaView>
  );
}
