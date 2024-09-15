import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { getSesion } from './src/hooks/localStorageUser';

import Login from './src/views/Login/Login';
import Password from './src/views/Login/Password';
import Verificacion from './src/views/Login/Verificacion';
import CreacionCuenta from './src/views/Login/CreacionCuenta';
import HomeProject from './src/views/Projects/home';
import NewProject from './src/views/Projects/NewProject';
import Project from './src/views/Projects/Project';

SplashScreen.preventAutoHideAsync(); // Evita que el splash screen desaparezca automáticamente

export default function RootNavigator() {
  const [stateLogin, setStateLogin] = useState(true); // Indica si debe ir a la pantalla de Login o HomeProject
  const [isLoading, setIsLoading] = useState(true); // Indica si aún se está verificando la sesión
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

  const handleLogin = async () => {
    const sesion = await getSesion();
    if (sesion !== null) {
      console.log('Login exitoso');
      setStateLogin(false);
    }
    setIsLoading(false); // Indica que la verificación de la sesión ha terminado
  };

  useEffect(() => {
    const hideSplashScreen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 1 segundo
      await SplashScreen.hideAsync(); // Oculta el splash screen
    };

    handleLogin();
    hideSplashScreen();
  }, []);

  if (isLoading) {
    // No renderices nada hasta que se haya terminado de verificar la sesión
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={stateLogin ? 'Login' : 'HomeProject'}>
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