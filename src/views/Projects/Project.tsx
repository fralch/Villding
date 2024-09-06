// src/views/Projects/Project.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';

import NavBar from '../../components/navbar';
import TaskList from '../../components/Task/TaskList';
import { Ionicons } from '@expo/vector-icons'; // Importa los íconos que desees usar

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
        drawerType: 'front',
        swipeEnabled: true,
        drawerStyle: {
          backgroundColor: '#333', // Cambia el color de fondo del Drawer
        },
        headerStyle: {
          backgroundColor: '#05222F', // Cambia el color del encabezado (header)
          height: 100, // Ajusta la altura del encabezado si es necesario
        },
        headerTintColor: '#fff', // Cambia el color del texto y los íconos en el header
        headerRight: () => (
          <Ionicons
            name='person-circle-outline' // Ícono de usuario
            size={35}
            color='white'
            style={{ marginRight: 10 }} // Espaciado a la derecha
            onPress={() => {
              // Acción cuando se presiona el ícono
              alert('Perfil de usuario');
            }}
          />
        ),
      }}
    >
      <Drawer.Screen
        name='TaskList'
        component={TaskList}
        options={{
          title: 'Tareas',
        }}
      />
    </Drawer.Navigator>
  );
}
