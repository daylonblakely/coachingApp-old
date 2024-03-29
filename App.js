import React from 'react';
import { StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { theme, colorModeManager } from './src/theme';
import { Provider as DrillProvider } from './src/context/DrillContext';
import { Provider as PlayProvider } from './src/features/plays/PlayContext';
import RootComponent from './src/components/RootComponent';

const App = () => {
  return (
    <NativeBaseProvider theme={theme} colorModeManager={colorModeManager}>
      <PlayProvider>
        <DrillProvider>
          <StatusBar
            translucent
            backgroundColor="#17171780" // muted.900
            barStyle="light-content"
          />
          <RootComponent />
        </DrillProvider>
      </PlayProvider>
    </NativeBaseProvider>
  );
};

export default App;
