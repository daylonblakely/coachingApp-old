import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import DrillListScreen from '../../screens/drills/DrillListScreen';
import DrillCreateScreen from '../../screens/drills/DrillCreateScreen';
import DrillDetailScreen from '../../screens/drills/DrillDetailScreen';

const DrillNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="DrillList"
          options={{ title: 'Drills', headerShown: false }}
          component={DrillListScreen}
        />
        <Stack.Screen
          name="DrillDetail"
          options={{ title: 'Drills' }}
          component={DrillDetailScreen}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="DrillCreate"
          component={DrillCreateScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default DrillNavigator;