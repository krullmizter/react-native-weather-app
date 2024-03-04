import { WEATHER_API_KEY } from "@env";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [currWeather, setCurrWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrMsg("Device's location permission denied.");
      setIsLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});

      const { latitude, longitude } = location.coords;
  
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;

      const response = await axios.get(weatherUrl);

      setCurrWeather(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setErrMsg('API error: ' + err.message);
      } else {
        setErrMsg('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (currWeather) {
    const { 
      main: { temp, feels_like },
      coord: { lon, lat },
      name,
    } = currWeather;

    return (
      <View style={styles.container}>
        <Text style={styles.tempText}>Location: {name}</Text>
        <Text style={styles.tempText}>Lon: {lon}, Lat: {lat}</Text>

        <Text style={styles.tempText}>Temperature: {temp}°</Text>
        <Text style={styles.tempText}>Feels like: {feels_like}°</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text>{errMsg || "Weather data couldn't be loaded"}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 30,
  },
});
