import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { List, Divider } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getSesion } from '../hooks/localStorageUser';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';


interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  start_date: string;
  end_date: string;
  week: number;
  week_current: number;
}

// Define el tipo para los parámetros de la ruta
type RouteParams = {
  params: {
    project?: Project;
  };
};

export default function Hamburguesa(props: any) {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  // Tipar la ruta para incluir los parámetros
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const [isAdmin, setIsAdmin] = useState(false);

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
      // console.log("Returning from route.params.project:", route.params?.project);
      return route.params?.project;
    }
    if (
      hasExactProjectStructure(route?.params) &&
      Object.entries(route?.params).length > 0
    ) {
      // console.log("Returning from route.params:", route.params);
      return route.params;
    }
    if (
      hasExactProjectStructure(props.route?.params) &&
      Object.entries(props.route?.params).length > 0
    ) {
      // console.log("Returning from props.route.params:", props.route.params);
      return props.route.params;
    }
    
    console.log("No valid project found, returning null");
    return null;
  }, [props.route?.params, route.params]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!recibiendoProyecto?.id) return;

      const session = JSON.parse(await getSesion() || "{}");
      
      if (session?.is_admin === 1) {
        setIsAdmin(true);
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/project/check-attachment`, { 
          project_id: recibiendoProyecto.id 
        });
        setIsAdmin(response.data.users.some((user: any) => 
          user.id === session?.id && user.is_admin === 1 
        ));
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, [recibiendoProyecto]);

  return (
    <View style={{ flex: 1, backgroundColor: '#05222F', paddingBottom: Math.max(insets.bottom, 16) }}>
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
      {isAdmin && (
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
            navigate('EditProject', {
              project: recibiendoProyecto,
            });
          }}
        />
      )}
      
      <List.Item
        title='Ver miembros'
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
