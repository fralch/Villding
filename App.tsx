import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Login from './src/views/Login/Login';
import Password from './src/views/Login/Password';
import Verificacion from './src/views/Login/Verificacion';
import CreacionCuenta from './src/views/Login/CreacionCuenta';

export default function RootNavigator() {
  const Stack = createNativeStackNavigator();

  const Pages = [
    {
      name: 'Login',
      component: Login,
    },
    {
      name: 'Password',
      component: Password,
    },
    {
      name: 'Verificacion',
      component: Verificacion,
    },
    {
      name: 'CreacionCuenta',
      component: CreacionCuenta,
    },
  ];

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
