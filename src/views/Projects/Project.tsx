import React, { useMemo } from 'react';
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

const hasExactProjectStructure = (obj: any): obj is Project => {
  const requiredKeys = ['company', 'id', 'image', 'subtitle', 'title', 'week'];
  return obj && requiredKeys.every((key) => key in obj);
};

const getStoredProject = (
  projectData: any,
  fallbackData: any
): Project | null => {
  if (
    hasExactProjectStructure(projectData) &&
    Object.entries(projectData).length > 0
  ) {
    storeProject(projectData);
    return projectData;
  }
  if (
    hasExactProjectStructure(fallbackData) &&
    Object.entries(fallbackData).length > 0
  ) {
    storeProject(fallbackData);
    return fallbackData;
  }
  return null;
};

export default function Project({ route: propsRoute }: any) {
  const route = useRoute<RouteProp<RouteParams, 'params'>>();

  const ProyectoActual = useMemo(() => {
    return getStoredProject(route.params?.project, propsRoute?.params);
  }, [route.params, propsRoute]);

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
          height: 90,
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <Ionicons
            name='person-circle-outline'
            size={35}
            color='white'
            style={{ marginRight: 10 }}
            onPress={() => alert('Perfil de usuario')}
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
