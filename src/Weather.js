import React, { useEffect, useState } from 'react';
import { View, Text, Alert, SafeAreaView, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location'; 
import styles from './WeatherStyles';
const weatherapi = 'a52ce42073604dd3bbc132923241508'; 

const Weather = () => {
    const [forecast, setForecast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const loadForecast = async () => {
        console.log('API Key:', weatherapi);
        setRefreshing(true);
        setLoading(true);

        try {
            console.log('Requesting location permissions...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission access for the location is denied');
                setRefreshing(false);
                setLoading(false);
                return;
            }

            console.log('Fetching location...');
            const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            console.log('Location fetched:', location);

            const lat = parseFloat(location.coords.latitude.toFixed(2));
            const lon = parseFloat(location.coords.longitude.toFixed(2));

            console.log('Latitude:', lat, 'Longitude:', lon);

            const fullUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherapi}&q=${lat},${lon}&aqi=no`;
            console.log('Fetching weather data from:', fullUrl);

            const response = await fetch(fullUrl);
            const data = await response.json();

            if (!response.ok) {
                console.log('Response status:', response.status);
                console.log('Response data:', data);
                throw new Error(data.error.message || 'Network response was not ok');
            }

            console.log('Weather data fetched:', data);
            setForecast(data);
        } catch (error) {
            console.log('Error:', error.message);
            Alert.alert('Error: ' + (error.message || 'Failed to fetch data'));
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForecast();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!forecast) {
        return (
            <SafeAreaView style={styles.loading}>
                <Text>Unable to fetch weather data.</Text>
            </SafeAreaView>
        );
    }

    const { current, location } = forecast;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadForecast}
                    />
                }
                contentContainerStyle={styles.scrollContainer}
            >
                <Text style={styles.title}>Current Weather</Text>
                <Text style={styles.locationText}>
                    Your Location: {location.name}, {location.region}
                </Text>
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>Condition: {current.condition.text}</Text>
                    <Text style={styles.weatherText}>Temperature: {current.temp_c}°C</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Weather;
