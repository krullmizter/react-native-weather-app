import { WEATHER_API_KEY } from "@env";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TextInput, Pressable } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { format } from 'date-fns';

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

function groupDates(forecastList: ForecastData['list']) {
  const byDays: { [key: string]: { items: ForecastData['list'], avgTemp: number } } = {};

  forecastList.forEach(item => {
    const day = item.dt_txt.split(' ')[0];

    if (!byDays[day]) {
      byDays[day] = { items: [], avgTemp: 0 };
    }
    byDays[day].items.push(item);
  });

  Object.keys(byDays).forEach(day => {
    const dayForecasts = byDays[day].items;
    const avgTemp = dayForecasts.reduce((acc, curr) => acc + curr.main.temp, 0) / dayForecasts.length;
    byDays[day].avgTemp = parseFloat(avgTemp.toFixed(2));
  });

  return byDays;
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
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Weather & Forecast App 🌞</Text>
        <TextInput style={styles.input} placeholder="Enter A City Name" placeholderTextColor="#F5F7F8" value={location} onChangeText={setLocation} />
        <Pressable style={styles.button} onPress={() => getWeatherData(location)}>
          <Text style={styles.buttonText}>Check Weather 🔎</Text>
        </Pressable>
      </View>
      {currWeather && (
        <View>
          <Text style={styles.headerTwo}>Current Weather:</Text>
          <Text style={styles.text}>📍 {currWeather.name}</Text>
          <Text style={styles.text}>🌡️ {currWeather.main.temp}°C (Feels like: {currWeather.main.feels_like}°C)</Text>
          <Text style={styles.text}>Humidity: {currWeather.main.humidity}</Text>
          <Text style={styles.text}>Pressure: {currWeather.main.pressure}</Text>
          <Text style={styles.text}>Wind: {currWeather.wind.speed}</Text>
        </View>
      )}
      {forecast && (
        <View>
          <Text style={styles.headerOne}>{forecast.city.name} Forecast (5-Days)</Text>
          {Object.entries(groupDates(forecast.list)).map(([day, { items, avgTemp }], index) => (
            <View key={index}>
              <Text style={styles.headerTwo}>{format(new Date(day), 'EEE dd.MM')}</Text>
              <Text style={styles.text}>Average: {avgTemp}°C</Text>
              {items.map((item, idx) => (
                <Text key={idx} style={styles.text}>
                  {format(new Date(item.dt_txt), 'HH:mm')}: {item.main.temp}°C
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
      {errMsg && <Text>{errMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#45474B",
  },
  containerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: "#F5F7F8",
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    maxWidth: 500,
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
  headerOne: {
    color: "#F5F7F8",
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  headerTwo: {
    color: "#F5F7F8",
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  headerThree: {
    color: "#F5F7F8",
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  button: {
    alignContent: 'center',
    width: '100%',
    maxWidth: 500,
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