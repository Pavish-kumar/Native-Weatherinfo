import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from './firebase'; // Ensure this path is correct
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigation } from '@react-navigation/native'; 

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignup = async () => {
    // Input validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'User created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert('Signup error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Function to get user-friendly error messages
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/email-already-in-use':
        return 'The email address is already in use by another account.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      default:
        return error.message;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      
      <Button title="Signup" onPress={handleSignup} disabled={loading} />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  linkText: {
    color: 'blue',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default SignupScreen;
