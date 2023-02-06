import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import PlayHomeScreen from '../../screens/plays/PlayHomeScreen';
import PlayListScreen from '../../screens/plays/PlayListScreen';
import PlayCreateScreen from '../../screens/plays/PlayCreateScreen';

const PlayNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: 'white',
      }}
    >
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="PlayHome"
          options={{ title: 'Explore Plays', headerShown: false }}
          component={PlayHomeScreen}
        />
        <Stack.Screen
          name="PlayList"
          options={({ route }) => ({ title: route.params.title })}
          component={PlayListScreen}
        />
        <Stack.Screen
          name="PlayCreate"
          options={({ route }) => ({
            headerShown: true,
            title: route.params.title,
            headerRight: () => <Text>Step: 1</Text>,
          })}
          component={PlayCreateScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default PlayNavigator;
