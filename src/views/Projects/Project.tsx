import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Hamburguesa from '../../components/Hamburguesa';
import TaskList from '../../components/Task/TaskList';
import { storeProject } from '../../hooks/localStorageCurrentProject';

const Drawer = createDrawerNavigator();

export default function Project(props: any) {
  const route = useRoute();
  const [ProyectoActual, setProyectoRoute] = React.useState<any>(null);
  let { project: proyectoRoute } = route.params as { project: any };
  console.log('-------- Projects ------------');
  React.useEffect(() => {
    console.log('project desde PROJECT', proyectoRoute);
    if (proyectoRoute) {
      console.log('proyecto guardado');
      storeProject(proyectoRoute);
    } else {
      proyectoRoute = props;
    }
  }, [proyectoRoute]);

  return (
    <Drawer.Navigator
      drawerContent={(proyectoRoute) => <Hamburguesa {...proyectoRoute} />}
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
        name={proyectoRoute?.title || 'Project'}
        component={TaskList}
        options={{
          headerTitle: proyectoRoute?.title || 'Project',
        }}
      />
    </Drawer.Navigator>
  );
}
