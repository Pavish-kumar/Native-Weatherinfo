import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Alert,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Button,
    StyleSheet,
    Dimensions,
    RefreshControl,
    TouchableOpacity,
    Platform
} from 'react-native';
import * as Location from 'expo-location';
import { getAuth, signOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
const { height } = Dimensions.get('window');
const weatherApi = '8050dbb54d78456abe342621242510';
const Weather = () => {
    const [forecast, setForecast] = useState(null);
    const [pastWeather, setPastWeather] = useState([]);
    const [futureWeather, setFutureWeather] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const navigation = useNavigation();
    const auth = getAuth();
    const loadForecast = async (location = null) => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location access is required to fetch weather data.');
                setLoading(false);
                return;
            }
            let lat, lon;
            if (location) {
                const locationResponse = await fetch(`https://api.weatherapi.com/v1/search.json?key=${weatherApi}&q=${location}`);
                const locationData = await locationResponse.json();
                if (!locationData.length) {
                    throw new Error('Location not found');
                }
                lat = locationData[0].lat;
                lon = locationData[0].lon;
            } else {
                const userLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
                lat = userLocation.coords.latitude;
                lon = userLocation.coords.longitude;
            }
            const fullUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApi}&q=${lat},${lon}&aqi=no`;
            const response = await fetch(fullUrl);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error.message || 'Failed to fetch weather data');
            }
            setForecast(data);
            const futureUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApi}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
            const futureResponse = await fetch(futureUrl);
            const futureData = await futureResponse.json();
            if (!futureResponse.ok) {
                throw new Error(futureData.error.message || 'Failed to fetch future weather data');
            }
            setFutureWeather(futureData.forecast.forecastday);
            const pastWeatherData = [];
            const today = new Date();
            for (let i = 1; i <= 7; i++) {
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - i);
                const dateString = pastDate.toISOString().split('T')[0]; // Format as yyyy-mm-dd
                const pastUrl = `https://api.weatherapi.com/v1/history.json?key=${weatherApi}&q=${lat},${lon}&dt=${dateString}`;
                const pastResponse = await fetch(pastUrl);
                const pastData = await pastResponse.json();
                if (pastResponse.ok && pastData.forecast) {
                    pastWeatherData.push(pastData.forecast.forecastday[0]);
                }
            }
            setPastWeather(pastWeatherData);

        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to fetch weather data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const onRefresh = () => {
        setRefreshing(true);
        loadForecast();
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };
    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (user) {
                                await deleteUser(user);
                                Alert.alert('Success', 'Your account has been deleted successfully.');
                                navigation.replace('Login');
                            }
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };
    const addFavorite = () => {
        if (locationInput && !favorites.includes(locationInput)) {
            setFavorites([...favorites, locationInput]);
            setLocationInput('');
        } else {
            Alert.alert('Error', 'Location is empty or already added to favorites');
        }
    };
    const removeFavorite = (location) => {
        setFavorites(favorites.filter(fav => fav !== location));
    };
    const handleFavoriteSelect = (location) => {
        loadForecast(location);
        setShowDropdown(false);
    };
    useEffect(() => {
        loadForecast();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                navigation.replace('Login');
            }
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (!forecast) {
        return (
            <View style={styles.loading}>
                <Text>Unable to fetch weather data.</Text>
            </View>
        );
    }
    const { current, location } = forecast;
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.locationInput}
                placeholder="Enter location"
                value={locationInput}
                onChangeText={setLocationInput}
            />
            
            <Button title="Fetch Weather" onPress={() => loadForecast(locationInput)} />
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(prev => !prev)}>
                <Text style={styles.dropdownButtonText}>Your Profile</Text>
            </TouchableOpacity>
            {showDropdown && (
                <View style={styles.dropdownMenu}>
                    <Button title="Sign Out" onPress={handleSignOut} />
                    <Button title="Delete Account" onPress={handleDeleteAccount} />
                    <Text style={styles.dropdownTitle}>Favorite Locations</Text>
                    {favorites.map((fav, index) => (
                        <View key={index} style={styles.favoriteItem}>
                            <Text onPress={() => handleFavoriteSelect(fav)}>{fav}</Text>
                            <Button title="Remove" onPress={() => removeFavorite(fav)} />
                        </View>
                    ))}
                    <Button title="Add to Favorites" onPress={addFavorite} />
                </View>
            )}
            <ScrollView
                contentContainerStyle={styles.scrollView}
                style={{ maxHeight: height * 0.75 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Text style={styles.title}>Current Weather</Text>
                <Text style={styles.locationText}>
                    Weather Location: {location.name}, {location.region}, {location.country}.
                </Text>
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>Condition: {current.condition.text}</Text>
                    <Text style={styles.weatherText}>Temperature: {current.temp_c}°C</Text>
                    <Text style={styles.weatherText}>Humidity: {current.humidity}%</Text>
                    <Text style={styles.weatherText}>Wind Speed: {current.wind_kph} kph</Text>
                </View>
                <View style={styles.pastWeatherContainer}>
                    <Text style={styles.futureTitle}>Past Weather</Text>
                    {pastWeather.map((day, index) => (
                        <View key={index} style={styles.dayContainer}>
                            <Text style={styles.dateText}>Date: {day.date}</Text>
                            <Text style={styles.tempText}>Temperature: {day.day.avgtemp_c}°C</Text>
                            <Text style={styles.conditionText}>Condition: {day.day.condition.text}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.futureTitle}>Future Weather</Text>
                {futureWeather.map((day, index) => (
                    <View key={index} style={styles.dayContainer}>
                        <Text style={styles.dateText}>Date: {day.date}</Text>
                        <Text style={styles.tempText}>Temperature: {day.day.avgtemp_c}°C</Text>
                        <Text style={styles.conditionText}>Condition: {day.day.condition.text}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundColor:'#0009',
        backgroundGradient: "vertical"
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationInput: {
        height: 40,
        borderColor: 'blue',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f2f2f2',
        fontSize: 16,
        width:'75%',
    },
    dropdownButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
    },
    dropdownButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10, 
        width: 200,
        zIndex: 1,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    favoriteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },

    buttonText: {
        fontSize: 18, 
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scrollView: {
        padding: 16,
        width: '100%',
        backgroundColor:'lightblue',
        backgroundSize:'50%',
        borderRadius:10,
        paddingBottom:120,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
        alignSelf:'center'
    },
    locationText: {
        fontSize: 22,
        color: 'green',
        fontWeight:'bold',
        marginBottom: 8,
    },
    weatherContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        marginTop:10,
        width: '100%',
        alignItems: 'center',
        justifyContent:'center',
    },
    weatherText: {
        fontSize: 20,
        color: 'purple',
        fontWeight:'400',
        marginBottom: 5,
    },
    futureTitle: {
        alignSelf:'center',
        fontSize: 22,
        fontWeight: '600',
        color: '#444',
        marginTop: 10,
        marginBottom:10,
    },
    dayContainer: {
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        marginBottom: 10,
        padding:15,
        width: '100%',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'darkorange',
    },
    tempText: {
        fontSize: 18,
        color: 'black',
    },
    conditionText: {
        fontSize: 18,
        color: 'violet',
        fontWeight:'600'
    },
});

export default Weather;