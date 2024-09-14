import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { getSesion } from './src/hooks/localStorageUser';
import { useCurrentProject } from './src/hooks/localStorageCurrentProject';
import { getProjects } from './src/hooks/localStorageProject';

import Login from './src/views/Login/Login';
import Password from './src/views/Login/Password';
import Verificacion from './src/views/Login/Verificacion';
import CreacionCuenta from './src/views/Login/CreacionCuenta';
import HomeProject from './src/views/Projects/home';
import NewProject from './src/views/Projects/NewProject';
import Project from './src/views/Projects/Project';

SplashScreen.preventAutoHideAsync(); // Evita que el splash screen desaparezca automáticamente

export default function RootNavigator() {
  const [stateLogin, setStateLogin] = useState(true); // Indica si debe ir a la pantalla de Login o HomeProject
  const [isLoading, setIsLoading] = useState(true); // Indica si aún se está verificando la sesión
  const [projectCurrent, setProjectCurrent] = useState<any>(null); // Inicializa como null
  const [initialRoute, setInitialRoute] = useState('Login'); // Maneja la ruta inicial
  const Stack = createNativeStackNavigator();

  const { currentProject } = useCurrentProject();

  const Pages = [
    { name: 'Login', component: Login },
    { name: 'Password', component: Password },
    { name: 'Verificacion', component: Verificacion },
    { name: 'CreacionCuenta', component: CreacionCuenta },
    { name: 'HomeProject', component: HomeProject },
    { name: 'NewProject', component: NewProject },
    { name: 'Project', component: Project },
  ];

  const handleLogin = async () => {
    const sesion = await getSesion();
    if (sesion !== null) {
      console.log('Login exitoso');
      setStateLogin(false);
    }
    setIsLoading(false); // Indica que la verificación de la sesión ha terminado
  };

  const handleProject = async (id: string) => {
    const projects = await getProjects();
    return projects.find((project) => project.id === id) || null;
  };

  useEffect(() => {
    const fetchProject = async () => {
      let route = 'HomeProject'; // Valor por defecto

      if (currentProject) {
        console.log('Hay proyecto actual');
        const project = await handleProject(currentProject); // Usa await aquí
        console.log('Project current: ', project);
        if (project) {
          console.log('Proyecto actual: ', project);
          setProjectCurrent(project); // Actualiza el estado de projectCurrent
          route = 'Project'; // Cambia la ruta a 'Project' si hay un proyecto válido
        }
      }

      setInitialRoute(route); // Actualiza el estado de la ruta inicial

      const hideSplashScreen = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 segundo
        await SplashScreen.hideAsync(); // Oculta el splash screen
      };

      hideSplashScreen();
    };

    fetchProject();
    console.log(`initialRoute: ${initialRoute}`);
    handleLogin();
  }, [currentProject]);

  if (isLoading) {
    // No renderices nada hasta que se haya terminado de verificar la sesión
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute} // Usa el estado initialRoute
      >
        {Pages.map((page) => (
          <Stack.Screen
            key={page.name}
            name={page.name}
            component={page.component}
            options={{ headerShown: false }}
            initialParams={page.name === 'Project' ? { projectCurrent } : {}}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
