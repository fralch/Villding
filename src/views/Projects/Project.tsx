import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/navbar';
import TaskList from '../../components/Task/TaskList';
import { useCurrentProject } from '../../hooks/localStorageCurrentProject';

const Drawer = createDrawerNavigator();

export default function Project() {
  const route = useRoute();
  const { project } = route.params as { project: any };

  // Asegúrate de invocar el hook de esta manera
  const { saveProject, clearProject } = useCurrentProject();

  React.useEffect(() => {
    // limpiar la tarea actual
    clearProject();

    console.log('project', project);
    if (project) {
      saveProject(project.id); // Llamar a la función saveProject correctamente
    }
  }, [project]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <NavBar />}
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
      />
    </Drawer.Navigator>
  );
}
