import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Hamburguesa from '../../components/Hamburguesa';
import TaskList from '../../components/Task/TaskList';
import { storeProject } from '../../hooks/localStorageCurrentProject';

const Drawer = createDrawerNavigator();

export default function Project() {
  const route = useRoute();
  const { project } = route.params as { project: any };

  React.useEffect(() => {
    console.log('project', project);
    if (project) {
      console.log('proyecto guardado');
      storeProject(project);
    }
  }, [project]);

  return (
    <Drawer.Navigator
      drawerContent={(project) => <Hamburguesa {...project} />}
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
        name={project?.title || 'Project'}
        component={TaskList}
        options={{
          headerTitle: project?.title || 'Project',
        }}
      />
    </Drawer.Navigator>
  );
}
