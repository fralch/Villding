import React, { useMemo, useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Hamburguesa from '../../components/Hamburguesa';
import TaskList from '../../components/Task/TaskList';
import { storeProject } from '../../hooks/localStorageCurrentProject';
interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  week: number;
}

const Drawer = createDrawerNavigator();

export default function Project(props: any) {
  const route = useRoute();

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
  const ProyectoActual = useMemo(() => {
    console.log('------------ HAMBURGUESA ----------------');
    console.log('route.params');
    console.log(route.params?.project);
    console.log('props.route?.params');
    console.log(props.route?.params);
    if (
      hasExactProjectStructure(route.params?.project) &&
      Object.entries(route.params?.project).length > 0
    ) {
      console.log('guardado en route.params.project');
      storeProject(route.params?.project);
      return route.params?.project;
    }
    if (
      hasExactProjectStructure(route?.params) &&
      Object.entries(route?.params).length > 0
    ) {
      console.log('guardado en route.params');
      storeProject(route?.params);
      return route.params;
    }
    if (
      hasExactProjectStructure(props.route?.params) &&
      Object.entries(props.route?.params).length > 0
    ) {
      console.log('guardado en props.route.params');
      storeProject(props.route.params);
      return props.route.params;
    }

    return null;
  }, [props.route?.params, route.params]); // Solo se ejecuta cuando props.project cambie

  return (
    <Drawer.Navigator
      drawerContent={(ProyectoActual) => <Hamburguesa {...ProyectoActual} />}
      screenOptions={{
        drawerType: 'front',
        swipeEnabled: true,
        drawerStyle: {
          backgroundColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#05222F',
          height: 100,
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <Ionicons
            name='person-circle-outline'
            size={35}
            color='white'
            style={{ marginRight: 10 }}
            onPress={() => {
              alert('Perfil de usuario');
            }}
          />
        ),
      }}
    >
      <Drawer.Screen
        name={ProyectoActual?.title || 'Project'}
        component={TaskList}
        options={{
          headerTitle: ProyectoActual?.title || 'Project',
        }}
      />
    </Drawer.Navigator>
  );
}
