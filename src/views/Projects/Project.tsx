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
  React.useEffect(() => {
    if (
      proyectoRoute !== undefined &&
      Object.entries(proyectoRoute).length > 0
    ) {
      // console.log('Setting project from route.params');
      setProyectoRoute(proyectoRoute);
      storeProject(proyectoRoute);
    }
    if (
      props.route.params !== undefined &&
      Object.entries(props.route.params).length > 0
    ) {
      // console.log('Setting project from props');
      setProyectoRoute(props.route.params);
      storeProject(props.route.params);
    }
  }, [proyectoRoute, props.route.params]);

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
