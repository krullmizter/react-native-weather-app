import { WEATHER_API_KEY } from "@env";
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Dimensions, StyleSheet, Text, View, ActivityIndicator, ScrollView, TextInput, Pressable } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { format } from 'date-fns';

interface WeatherData {
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
  const byDays: { [key: string]: { items: ForecastData['list'], avgTemp: number, minTemp: number, maxTemp: number } } = {};

  forecastList.forEach(item => {
    const day = item.dt_txt.split(' ')[0];

    if (!byDays[day]) {
      byDays[day] = { items: [], avgTemp: 0, minTemp: Infinity, maxTemp: -Infinity };
    }
    byDays[day].items.push(item);
    byDays[day].minTemp = Math.min(byDays[day].minTemp, item.main.temp);
    byDays[day].maxTemp = Math.max(byDays[day].maxTemp, item.main.temp);
  });

  Object.keys(byDays).forEach(day => {
    const dayForecasts = byDays[day].items;
    const avgTemp = dayForecasts.reduce((acc, curr) => acc + curr.main.temp, 0) / dayForecasts.length;
    byDays[day].avgTemp = parseFloat(avgTemp.toFixed(1));
  });

  return byDays;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [location, setLocation] = useState('');
  
  const [currWeather, setCurrWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);

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

        console.log(weatherUrl);
  
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <View style={styles.containerCenter}>
            <Text style={styles.title}>Weather & Forecast App 🌞</Text>
            <TextInput style={styles.input} placeholder="Enter A City Name" placeholderTextColor="#F7F7F7" value={location} onChangeText={setLocation} />
            <Pressable style={styles.button} onPress={() => getWeatherData(location)}>
             <Text style={styles.buttonText}>Check City Weather 🔎</Text>
           </Pressable>
            <Pressable style={styles.button} onPress={() => getWeatherData()}>
             <Text style={styles.buttonText}>Use My Location 📍</Text>
           </Pressable>
          </View>
          {currWeather && (
           <View>
              <Text style={styles.headerTwo}>📍 {currWeather.name} Weather</Text>
              <Text style={styles.headerThree}>🌡️ {currWeather.main.temp.toFixed(1)}°C (Feels like: {currWeather.main.feels_like.toFixed(1)}°C), Min: {currWeather.main.temp_min.toFixed(1)}°C, Max: {currWeather.main.temp_max.toFixed(1)}°C</Text>
              <Text style={styles.text}>Humidity: {currWeather.main.humidity}%</Text>
              <Text style={styles.text}>Pressure: {currWeather.main.pressure}hPa</Text>
              <Text style={styles.text}>Wind: {currWeather.wind.speed}m/s</Text>
            </View>
          )}
          {forecast && (
           <View>
            <Text style={styles.headerTwo}>{forecast.city.name} 5-Day Forecast</Text>
              {Object.entries(groupDates(forecast.list)).map(([day, { items, avgTemp, minTemp, maxTemp }], index) => (
                <Pressable key={index} onPress={() => setExpandedDay(expandedDay === day ? null : day)}
                  style={[
                    styles.dayContainer, 
                    index % 2 === 0 ? styles.evenDayBackground : styles.oddDayBackground
                  ]}
                >
                  <Text style={styles.forecastHeading}>{format(new Date(day), 'EEE dd.MM')}</Text>
                  <Text style={styles.text}>Avg: {avgTemp}°C, Min: {minTemp.toFixed(1)}°C, Max: {maxTemp.toFixed(1)}°C</Text>
                  {expandedDay === day && items.map((item, idx) => (
                   <Text key={idx} style={styles.text}>
                      {format(new Date(item.dt_txt), 'HH:mm')}: {item.main.temp.toFixed(1)}°C
                    </Text>
                  ))}
                </Pressable>
              ))}
          </View>
        )}
        <Text style={styles.text}>Samuel Granvik © {new Date().getFullYear()} </Text>
        {errMsg && <Text>{errMsg}</Text>}
      </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const dynamicPadding = Dimensions.get('window').width > 768 ? '20%' : '5%';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#303841",
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingRight: dynamicPadding,
    paddingLeft: dynamicPadding,
    flexGrow: 1, 
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: "#F7F7F7",
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    fontWeight: 'bold',
    maxWidth: 500,
    height: 40,
    color: "#F7F7F7",
    borderColor: '#F7F7F7',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 18,
    marginVertical: 2,
    color: "#F7F7F7"
  },
  headerOne: {
    color: "#F7F7F7",
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  headerTwo: {
    color: "#F7F7F7",
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  headerThree: {
    color: "#F7F7F7",
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    alignContent: 'center',
    width: '100%',
    maxWidth: 500,
    backgroundColor: "#F6C90E",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "#F7F7F7",
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#F7F7F7",
  },
  dayContainer: {
    padding: 10,
  },
  oddDayBackground: {
    backgroundColor: "#2E4750",
  },
  evenDayBackground: {
    backgroundColor: "#4a6572",
  },
});