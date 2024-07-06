import { View, Text, Alert, SafeAreaView, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const openWeatherKey = '87b334ce5b1443b4ad060421241206 ';

const Weather = () => {
    const [forecast, setForecast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    const loadForecast = async () => {
        setRefreshing(true);
        console.log('Requesting location permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission access for the location is denied');
            setRefreshing(false);
            return;
        }
        
        try {
            console.log('Fetching location...');
            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            console.log('Location fetched:', location);
            
            const lat = parseFloat(location.coords.latitude.toFixed(2));
            const lon = parseFloat(location.coords.longitude.toFixed(2));

            console.log(lat, lon);  // Example output: 11.27, 77.61

            let fullUrl = `http://api.weatherapi.com/v1/current.json?key=${openWeatherKey}&q=${lat},${lon}&aqi=no`;
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
            console.log('Error:', error);
            Alert.alert('Error', error.message || 'Failed to fetch data');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadForecast();
    }, []);

    if (!forecast) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size='large' />
            </SafeAreaView>
        );
    }

    const current = forecast.current;
    const location=forecast.location;
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
                <Text style={styles.title}>
                    Current Weather
                </Text>
                <Text style={styles.locationText}>
                    Your Location:{location.name},{location.region}
                    
                </Text>
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>
                        Condition: {current.condition.text}
                    </Text>
                    <Text style={styles.weatherText}>
                        Temperature: {current.temp_c}°C
                    </Text>
                    {/* Add more UI elements to display additional weather information here */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Weather;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'lightblue',
        borderColor:'lightyellow',
        borderCurve:'3px'
        
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#C84B31',
    },
    locationText: {
        alignItems: 'center',
        textAlign: 'center',
    },
    weatherContainer: {
        marginVertical: 20,
    },
    weatherText: {
        fontSize: 20,
        textAlign: 'center',
    },
});
