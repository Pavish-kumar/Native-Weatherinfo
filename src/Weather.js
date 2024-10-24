import React, { useEffect, useState } from 'react';
import { View, Text, Alert, SafeAreaView, ActivityIndicator, ScrollView, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import WeatherFuture from './WeatherFuture'; // Ensure this is correctly imported

const weatherapi = 'a52ce42073604dd3bbc132923241508'; // Make sure this API key is valid.

const Weather = () => {
    const [forecast, setForecast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const loadForecast = async () => {
        setRefreshing(true);
        setLoading(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location access is required to fetch weather data.');
                setRefreshing(false);
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            const lat = parseFloat(location.coords.latitude.toFixed(2));
            const lon = parseFloat(location.coords.longitude.toFixed(2));

            const fullUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherapi}&q=${lat},${lon}&aqi=no`;
            const response = await fetch(fullUrl);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error.message || 'Failed to fetch weather data');
            }

            setForecast(data);
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to fetch weather data');
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
                style={styles.scrollView} // Added a specific style for ScrollView
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
                    <Text style={styles.weatherText}>Humidity: {current.humidity}%</Text>
                    <Text style={styles.weatherText}>Wind Speed: {current.wind_kph} kph</Text>
                </View>
                <WeatherFuture />
            </ScrollView>
        </SafeAreaView>
    );
};

const { height } = Dimensions.get('window'); // Get the window height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'lightblue',
        padding: 20,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1, // Ensure the ScrollView can grow
        maxHeight: height, // Set the maximum height to the window height
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: {
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#C84B31',
        marginBottom: 20,
    },
    locationText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
    },
    weatherContainer: {
        marginVertical: 20,
        padding: 30,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        shadowOpacity: 0.8,
        shadowRadius: 8,
        width: '100%',
        maxWidth: 500,
        elevation: 5,
        alignSelf: 'center',
    },
    weatherText: {
        fontSize: 20,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default Weather;
