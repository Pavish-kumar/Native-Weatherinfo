import React from 'react';
import { StyleSheet, View } from 'react-native';
import Weather from './src/Weather'; 
import WeatherFuture from './src/WeatherFuture';

export default function App() {
    return (
        <View style={styles.container}>
            <Weather />
            <WeatherFuture/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch', // Ensure full width for the Weather component
        justifyContent: 'center',
    }
});
