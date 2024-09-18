import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

export default function Hamburguesa(props: any) {
  const route = useRoute();

  const recibiendoProyecto = useMemo(() => {
    console.log('------------ HAMBURGUESA ----------------');
    if (route.params !== undefined && Object.entries(route.params).length > 0) {
      return route.params;
    }
    if (
      props.route.params !== undefined &&
      Object.entries(props.route.params).length > 0
    ) {
      return props.route.params;
    }

    return props.project;
  }, [props.route?.params, route.params]); // Solo se ejecuta cuando props.project cambie
  return (
    <View style={{ flex: 1, backgroundColor: '#05222F' }}>
      {/* Logo */}
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
      {/* Detalles del proyecto */}
      <View
        style={{
          backgroundColor: '#0A455E',
          paddingTop: 0,
          paddingBottom: 20,
        }}
      >
        <Image
          source={{
            uri: recibiendoProyecto.image || 'https://via.placeholder.com/200',
          }}
          style={{
            width: '100%',
            height: 200,
            resizeMode: 'contain',
            paddingHorizontal: 0,
            marginTop: 5,
          }}
        />
        <Text
          style={{ color: '#FFF', fontWeight: 'bold', paddingHorizontal: 20 }}
        >
          {recibiendoProyecto.title}
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          {recibiendoProyecto.subtitle}
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          {recibiendoProyecto.company}
        </Text>
      </View>
      {/* Opciones de administración */}
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
      <Divider style={{ backgroundColor: '#0A455E' }} />
      {/* Ver proyectos */}
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
