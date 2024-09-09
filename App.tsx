import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

import Login from './src/views/Login/Login';
import Password from './src/views/Login/Password';
import Verificacion from './src/views/Login/Verificacion';
import CreacionCuenta from './src/views/Login/CreacionCuenta';
import HomeProject from './src/views/Projects/home';
import NewProject from './src/views/Projects/NewProject';
import Project from './src/views/Projects/Project';

SplashScreen.preventAutoHideAsync(); // Evita que el splash screen desaparezca automáticamente

export default function RootNavigator() {
  const Stack = createNativeStackNavigator();

  const Pages = [
    { name: 'Login', component: Login },
    { name: 'Password', component: Password },
    { name: 'Verificacion', component: Verificacion },
    { name: 'CreacionCuenta', component: CreacionCuenta },
    { name: 'HomeProject', component: HomeProject },
    { name: 'NewProject', component: NewProject },
    { name: 'Project', component: Project },
  ];

  useEffect(() => {
    // Simula una espera de 1 segundo antes de ocultar el splash screen
    const hideSplashScreen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1 segundo
      await SplashScreen.hideAsync(); // Oculta el splash screen
    };

    hideSplashScreen();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {Pages.map((page) => (
          <Stack.Screen
            key={page.name}
            name={page.name}
            component={page.component}
            options={{ headerShown: false }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
