import { WEATHER_API_KEY } from "@env";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TextInput, Pressable } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
  }
}

interface ForecastData {
  list: Array<{
    dt_txt: string;
    main: {
      temp: number;
    };
  }>;
  city: {
    name: string;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [location, setLocation] = useState('');
  
  const [currWeather, setCurrWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);

  async function getWeatherData(city?: string) {
    let latitude: number | null = null;
    let longitude: number | null = null;
    let permissionGranted = false;
    
    setIsLoading(true);
  
    const locationPermission = await Location.requestForegroundPermissionsAsync();
  
    if (locationPermission.status === 'granted') {
      permissionGranted = true;
  
      try {
        const deviceLocation = await Location.getCurrentPositionAsync({});
        latitude = deviceLocation.coords.latitude;
        longitude = deviceLocation.coords.longitude;
      } catch (error) {
        setErrMsg('Failed to get device location');
        latitude = null;
        longitude = null;
      }
    } else {
      setErrMsg("Device location permission not granted. Enter a city name for weather data.");
    }
  
    if (!city && !permissionGranted) {
      setIsLoading(false);
      return;
    }
  
    if (city) {
      try {
        const geocodeRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_API_KEY}`);
        if (geocodeRes.data && geocodeRes.data.length > 0) {
          latitude = geocodeRes.data[0].lat;
          longitude = geocodeRes.data[0].lon;
        } else {
          setErrMsg('Entered city not found');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        let errorMessage = 'An unexpected error has occurred';

        if (axios.isAxiosError(error)) {
          errorMessage = 'Geocoding data error: ' + error.message;
        } else if (error instanceof Error) {
          errorMessage = 'Error: ' + error.message;
        }
        setErrMsg(errorMessage);
        setIsLoading(false);
        return;
      }      
    }
  
    if (latitude !== null && longitude !== null) {
      try {
        const BASEURL = 'https://api.openweathermap.org/data/2.5';
        const UNIT = 'metric'; //TODO: allow unit changing
        const weatherUrl = `${BASEURL}/weather?lat=${latitude}&lon=${longitude}&units=${UNIT}&appid=${WEATHER_API_KEY}`;
        const forecastUrl = `${BASEURL}/forecast?lat=${latitude}&lon=${longitude}&units=${UNIT}&appid=${WEATHER_API_KEY}`;
  
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(weatherUrl),
          axios.get(forecastUrl),
        ]);
  
        setCurrWeather(weatherRes.data);
        setForecast(forecastRes.data);
      } catch (error) {
        if (error instanceof Error) {
          setErrMsg('API error: ' + error.message);
        } else {
          setErrMsg('An unexpected error has occurred');
        }
      } finally {
        setIsLoading(false);
      }
    }     
}

  useEffect(() => {
    getWeatherData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weather & Forecast App 🌞</Text>
      <TextInput style={styles.input} placeholder="Enter A City" value={location} onChangeText={setLocation} />
      <Pressable style={styles.button} onPress={() => getWeatherData(location)}>
        <Text style={styles.buttonText}>Check Weather</Text>
      </Pressable>
      {currWeather && (
        <View>
          <Text style={styles.text}>📍 {currWeather.name}</Text>
          <Text style={styles.text}>🌡️ {currWeather.main.temp}°C (Feels like: {currWeather.main.feels_like}°C)</Text>
          <Text style={styles.text}>Humidity: {currWeather.main.humidity}</Text>
          <Text style={styles.text}>Pressure: {currWeather.main.pressure}</Text>
          <Text style={styles.text}>Wind: {currWeather.wind.speed}</Text>
        </View>
      )}
      {forecast && (
        <View>
          <Text style={styles.header}>{forecast.city.name} Forecast (5-Days)</Text>
          {forecast.list.map((item, index) => (
            <Text key={index} style={styles.text}>
              {item.dt_txt}: {item.main.temp}°C
            </Text>
          ))}
        </View>
      )}
      {errMsg && <Text>{errMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#45474B",
  },
  title: {
    color: "#F5F7F8",
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    color: "#F5F7F8",
    borderColor: '#F5F7F8',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 18,
    marginVertical: 2,
    color: "#F5F7F8"
  },
  header: {
    color: "#F5F7F8",
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#F4CE14",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "#F5F7F8",
    fontSize: 18,
    fontWeight: 'bold',
  },
});