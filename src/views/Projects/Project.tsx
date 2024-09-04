// src/views/Projects/Project.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';

import NavBar from '../../components/navbar';

const Drawer = createDrawerNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

export default function Project() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <NavBar />}
      screenOptions={{
        drawerType: 'front', // Hace que el drawer se superponga al contenido
        swipeEnabled: true, // Habilita el gesto de swipe (predeterminado)
      }}
    >
      <Drawer.Screen
        name='Home'
        component={HomeScreen}
      />
    </Drawer.Navigator>
  );
}
