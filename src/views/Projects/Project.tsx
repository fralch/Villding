import React, { useMemo, useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute, RouteProp } from '@react-navigation/native';
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

type RouteParams = {
  params: {
    project?: Project;
  };
};

const Drawer = createDrawerNavigator();

export default function Project(props: any) {
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

  const ProyectoActual = useMemo(() => {
    if (
      hasExactProjectStructure(route.params?.project) &&
      Object.entries(route.params?.project).length > 0
    ) {
      storeProject(route.params?.project);
      return route.params?.project;
    }
    if (
      hasExactProjectStructure(route?.params) &&
      Object.entries(route?.params).length > 0
    ) {
      storeProject(route?.params);
      return route.params;
    }
    if (
      hasExactProjectStructure(props.route?.params) &&
      Object.entries(props.route?.params).length > 0
    ) {
      storeProject(props.route.params);
      return props.route.params;
    }

    return null;
  }, [props.route?.params, route.params]);

  return (
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
          backgroundColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#05222F',
          height: 90, // Ajusta la altura de la barra de encabezado
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
      />
    </Drawer.Navigator>
  );
}
