import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AttendanceScreen from '@screens/AttendanceScreen';
import HistoryScreen from '@screens/HistoryScreen';
import ConfigurationScreen from '@screens/ConfigurationScreen';
import { RootTabParamList } from './types';
import { colors } from '@theme/index';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }}
    >
      <Tab.Navigator
        initialRouteName="Attendance"
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,

          tabBarStyle: {
            height: 62 + insets.bottom,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },

          tabBarIcon: ({ color, size }) => {
            const icon =
              route.name === 'Attendance'
                ? 'location-outline'
                : route.name === 'History'
                  ? 'calendar-outline'
                  : 'settings-outline';

            return <Ionicons name={icon} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Configuration" component={ConfigurationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}