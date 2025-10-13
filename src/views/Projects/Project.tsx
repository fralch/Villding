import React, { useMemo, useEffect, useCallback } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Hamburguesa from '../../components/Hamburguesa';
import TrackingCurrent from '../../components/Activities/TrackingCurrent';
import { storeProject } from '../../hooks/localStorageCurrentProject';
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { getSesion } from "../../hooks/localStorageUser";
import axios from 'axios';

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

type RouteParams = {
  params: {
    project?: Project;
  };
};

const Drawer = createDrawerNavigator();

export default function Project(props: any) {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const [imageUserSesion, setImageUserSesion] = React.useState<string>();
  const [user, setUser] = React.useState<any>();

  React.useEffect(() => {
    getSesion().then((StoredSesion: any) => {
      let sesion = JSON.parse(StoredSesion);
      // console.log(sesion.id);
      setImageUserSesion(sesion.uri);
      setUser(sesion);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Esto se ejecuta cada vez que vuelves a la pantalla
      getSesion().then((StoredSesion: any) => {
        let sesion = JSON.parse(StoredSesion);
        // console.log(sesion.uri);
        setImageUserSesion(sesion.uri);
        setUser(sesion);
      });

      return () => {
        // Limpieza si es necesario
      };
    }, [])
  );

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

  // El useMemo ser utiliza 
  const ProyectoActual = useMemo(() => { 
    // console.log(route.params?.project);
    if (
      hasExactProjectStructure(route.params?.project) &&
      Object.entries(route.params?.project).length > 0
    ) {
      storeProject(JSON.stringify(route.params?.project));
      return route.params?.project;
    }
    if (
      hasExactProjectStructure(route?.params) &&
      Object.entries(route?.params).length > 0
    ) {
      storeProject(JSON.stringify(route?.params));
      return route.params;
    }
    if (
      hasExactProjectStructure(props.route?.params) &&
      Object.entries(props.route?.params).length > 0
    ) {
      storeProject(JSON.stringify(props.route.params));
      return props.route.params;
    }

    return null;
  }, [props.route?.params, route.params]);


  useEffect(() => {
    if (ProyectoActual) {
      // Sirve para actulizar las actividades pendientes o programadas 
      axios.post(`https://villding.lat/endpoint/activities_check/${ProyectoActual.id}`)
        .then(response => {
        })
        .catch(error => {
          // console.error(error);
        });

    }
  }, [ProyectoActual]);



  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#05222F" translucent />
      <Drawer.Navigator
        drawerContent={(drawerContentProps) => (
          <Hamburguesa
            {...drawerContentProps}
            project={ProyectoActual}
          />
        )}
        screenOptions={{
          drawerType: 'front',
          swipeEnabled: true,
          drawerStyle: {
            backgroundColor: '#333', // Cambia el color de fondo del drawer
          },
          headerStyle: {
            backgroundColor: '#05222F',
            height: Dimensions.get('window').height * 0.12, // Altura proporcional al 11% de la altura del dispositivo
          },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigate("EditUser")}>
              <Image
                source={
                  imageUserSesion
                    ? { uri: imageUserSesion }
                    : require("../../assets/images/user.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen
          name={ProyectoActual?.title || 'Project'}
          component={TrackingCurrent}
        /> 
      </Drawer.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
