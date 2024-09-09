// src/components/NavBar.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { List, Divider } from 'react-native-paper';

export default function NavBar() {
  return (
    <View style={{ flex: 1, backgroundColor: '#05222F' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#05222F',
          paddingTop: 30,
          paddingHorizontal: 20,
        }}
      >
        <Image
          source={require('../assets/images/logo-tex-simple_white.png')}
          style={{
            borderRadius: 8,
            width: '50%',
            height: 60,
            resizeMode: 'contain',
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: '#0A455E',
          paddingTop: 0,
          paddingBottom: 20,
        }}
      >
        <Image
          source={{
            uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKIJC0XQm26nBGa5VoTkZzjhBsAPsE9LdTeQ&s',
          }}
          style={{
            width: '100%',
            height: 200,
            resizeMode: 'contain',
            paddingHorizontal: 0,
            marginTop: -15,
          }}
        />
        <Text
          style={{ color: '#FFF', fontWeight: 'bold', paddingHorizontal: 20 }}
        >
          Multifamiliar Barranco
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          Jirón Dos de Mayo Barranco
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          Weinstein Ingenieros SAC
        </Text>
      </View>

      <List.Item
        title='Editar proyecto'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='pencil'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />
      <List.Item
        title='Administrar acceso'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='account'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />
      <List.Item
        title='Configurar proyecto'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='cog'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />

      <Divider style={{ backgroundColor: '#0A455E' }} />

      <List.Item
        title='Eliminar proyecto'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='delete'
            color='#FFF'
          />
        )}
        onPress={() => {}}
      />

      <View style={{ marginTop: 'auto' }}>
        <List.Item
          title='Ver proyectos'
          titleStyle={{ color: '#FFF' }}
          style={{ marginLeft: 20 }}
          onPress={() => {}}
        />
      </View>
    </View>
  );
}
