import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from '@globalComponents/ErrorBoundary';
import { AppDataProvider } from '@contexts/AppDataContext';
import { LocationProvider } from '@contexts/LocationContext';
import AppNavigator from '@navigation/AppNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppDataProvider>
          <LocationProvider>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AppNavigator />
          </LocationProvider>
        </AppDataProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
