import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';

const weatherapi = 'a52ce42073604dd3bbc132923241508'; // Make sure this API key is valid.

const fetchFutureWeather = async (lat, lon) => {
    const days = 7; // Number of future days to forecast
    const fullUrl = `http://api.weatherapi.com/v1/forecast.json?key=${weatherapi}&q=${lat},${lon}&days=${days}`;

    try {
        const response = await fetch(fullUrl);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error.message || 'Failed to fetch future weather data');
        }
        return data.forecast.forecastday; // Return the data for the next 7 days
    } catch (error) {
        console.log('Error:', error.message);
        Alert.alert('Error fetching future weather data: ' + error.message);
        return []; // Return an empty array if there's an error
    }
};

const WeatherFuture = () => {
    const [futureWeather, setFutureWeather] = useState([]);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
                const lat = parseFloat(location.coords.latitude.toFixed(8));
                const lon = parseFloat(location.coords.longitude.toFixed(8));

                const futureWeatherData = await fetchFutureWeather(lat, lon);
                setFutureWeather(futureWeatherData); // Set the future weather data
            } catch (error) {
                console.log('Error fetching location or weather data:', error.message);
                Alert.alert('Error fetching location or weather data: ' + error.message);
            }
        };

        fetchWeatherData();
    }, []);

    return (
        <ScrollView style={styles.futureWeatherContainer}>
            {futureWeather.map((day, index) => (
                <View key={index} style={styles.dayContainer}>
                    <Text style={styles.dateText}>{day.date}</Text>
                    <Text style={styles.tempText}>
                        Avg Temp: {day.day.avgtemp_c}°C
                    </Text>
                    <Text style={styles.conditionText}>
                        Condition: {day.day.condition.text}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
};

export default WeatherFuture;

const styles = StyleSheet.create({
    futureWeatherContainer: {
        flex: 1,
        padding: 10,
    },
    dayContainer: {
        marginBottom: 10,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tempText: {
        fontSize: 14,
        marginTop: 5,
    },
    conditionText: {
        fontSize: 14,
        marginTop: 5,
        color: '#555',
    },
});
