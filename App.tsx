import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { getSesion } from './src/hooks/localStorageUser';
import { getProject } from './src/hooks/localStorageCurrentProject';
import Login from './src/views/Login/Login';
import Password from './src/views/Login/Password';
import Verificacion from './src/views/Login/Verificacion';
import CreacionCuenta from './src/views/Login/CreacionCuenta';
import EditUser from './src/views/Login/EditUser';
import HomeProject from './src/views/Projects/HomeProject';
import NewProject from './src/views/Projects/NewProject';
import Project from './src/views/Projects/Project';
import Task from './src/components/Task/Task';
import VistaMiembros from './src/views/Accesos/VistaMiembros';

SplashScreen.preventAutoHideAsync(); // Evita que el splash screen desaparezca automáticamente



export default function RootNavigator() {
  const [stateLogin, setStateLogin] = useState(true); // Indica si debe ir a la pantalla de Login o HomeProject
  const [isLoading, setIsLoading] = useState(true); // Indica si aún se está verificando la sesión
  const [projectState, setProject] = useState<any>(null);
  const [initialRoute, setInitialRoute] = useState('Login'); // Maneja la ruta inicial
  const Stack = createNativeStackNavigator();

  const Pages = [
    { name: 'Login', component: Login },
    { name: 'Password', component: Password },
    { name: 'Verificacion', component: Verificacion },
    { name: 'CreacionCuenta', component: CreacionCuenta },
    { name: 'HomeProject', component: HomeProject },
    { name: 'NewProject', component: NewProject },
    { name: 'Project', component: Project },
    { name: 'Task', component: Task },
    { name: 'EditUser', component: EditUser },
    { name: 'VistaMiembros', component: VistaMiembros },
  ];

  const handleLogin = async () => {
    const sesion = await getSesion();
    if (sesion !== null) {
      console.log('Login exitoso');
      const proyecto = await getProject();
      if (proyecto) {
        // Asegúrate de que `proyecto` no es null antes de usar `JSON.parse`
       if( typeof proyecto === 'string'){
        setProject(JSON.parse(proyecto));
       } else {
        setProject(proyecto);
       }
      } else {
        setProject(null); // Maneja el caso cuando `proyecto` es null
      }
      setStateLogin(false);
    }
    setIsLoading(false); // Indica que la verificación de la sesión ha terminado
  };

  useEffect(() => {
    const hideSplashScreen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 1 segundo
      await SplashScreen.hideAsync(); // Oculta el splash screen
    };

    handleLogin();
    hideSplashScreen();
  }, []);

  if (isLoading) {
    // No renderices nada hasta que se haya terminado de verificar la sesión
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          stateLogin ? 'Login' : projectState ? 'Project' : 'HomeProject'
        }
      >
        {Pages.map((page) => (
          <Stack.Screen
            key={page.name}
            name={page.name}
            component={page.component}
            options={{ headerShown: false }}
            initialParams={page.name === 'Project' ? projectState : {}}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}