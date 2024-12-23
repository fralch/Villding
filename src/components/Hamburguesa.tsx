import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  week: number;
}

// Define el tipo para los parámetros de la ruta
type RouteParams = {
  params: {
    project?: Project;
  };
};

export default function Hamburguesa(props: any) {
  const { navigate } = useNavigation<NavigationProp<any>>();

  // Tipar la ruta para incluir los parámetros
  const route = useRoute<RouteProp<RouteParams, 'params'>>();

  const hasExactProjectStructure = (obj: any): obj is Project => {
    if (!obj) {
      return false;
    }

    const requiredKeys = [
      'company',
      'id',
      'image',
      'subtitle',
      'title',
      'week',
    ];

    return requiredKeys.every((key) => key in obj);
  };

  const recibiendoProyecto = useMemo(() => {
    if (
      hasExactProjectStructure(route.params?.project) &&
      Object.entries(route.params?.project).length > 0
    ) {
      return route.params?.project;
    }
    if (
      hasExactProjectStructure(route?.params) &&
      Object.entries(route?.params).length > 0
    ) {
      return route.params;
    }
    if (
      hasExactProjectStructure(props.route?.params) &&
      Object.entries(props.route?.params).length > 0
    ) {
      return props.route.params;
    }

    return null;
  }, [props.route?.params, route.params]);

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
            uri: recibiendoProyecto?.image || 'https://via.placeholder.com/200',
          }}
          style={{
            width: '100%',
            height: 200,
            resizeMode: 'cover', // Cambiado a 'cover'
            paddingHorizontal: 0,
            marginTop: 0,
          }}
        />

        <Text
          style={{
            color: '#FFF',
            fontWeight: 'bold',
            paddingHorizontal: 20,
            marginTop: 10,
            fontSize: 20,
          }}
        >
          {recibiendoProyecto?.title}
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          {recibiendoProyecto?.subtitle}
        </Text>
        <Text style={{ color: '#7AA0B8', paddingHorizontal: 20 }}>
          {recibiendoProyecto?.company}
        </Text>
      </View>
      {/* Opciones de administración */}
      <List.Item
        title='Administrar accesos'
        titleStyle={{ color: '#FFF' }}
        right={(props) => (
          <List.Icon
            {...props}
            icon='account'
            color='#FFF'
          />
        )}
        onPress={() => {
          navigate('VistaMiembros', {
            id_project: recibiendoProyecto.id,
          });
        }}
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
        onPress={() => {
          navigate('NewProject', {
            project: recibiendoProyecto,
          });
        }}
      />
      <Divider style={{ backgroundColor: '#0A455E' }} />
      {/* Ver proyectos */}
      <View style={{ marginTop: 'auto' }}>
        <List.Item
          title='Ver proyectos'
          left={(props) => (
            <List.Icon
              {...props}
              icon='arrow-left'
              color='#FFF'
            />
          )}
          titleStyle={{ color: '#FFF' }}
          style={{ marginLeft: 10 }}
          onPress={() => {
            navigate('HomeProject');
          }}
        />
      </View>
    </View>
  );
}
