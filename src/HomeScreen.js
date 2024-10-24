import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Weather from './Weather';

const HomeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
      <Weather />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 5, 
  },
  scrollContainer: {
    flexGrow: 5, 
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom:'5%',
  },
});

export default HomeScreen;
