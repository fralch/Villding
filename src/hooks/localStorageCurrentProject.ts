import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hook personalizado para manejar la tarea actual
export const useCurrentProject = () => {
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Guardar la tarea en AsyncStorage
  const saveProject = async (ProjectId: string) => {
    try {
      // comprobar si la tarea ya existe en AsyncStorage
      const savedProject = await AsyncStorage.getItem('currentProject');
      if (savedProject) {
        setCurrentProject(savedProject);
        return;
      }

      await AsyncStorage.setItem('currentProject', ProjectId);
      setCurrentProject(ProjectId);
    } catch (error) {
      console.error('Error al guardar el Project:', error);
    }
  };

  const clearProject = async () => {
    try {
      await AsyncStorage.removeItem('currentProject');
      setCurrentProject(null);
    } catch (error) {
      console.error('Error al borrar el Project:', error);
    }
  };

  // Cargar la tarea desde AsyncStorage
  const loadProject = async () => {
    try {
      const savedProject = await AsyncStorage.getItem('currentProject');
      if (savedProject) {
        setCurrentProject(savedProject);
      }
    } catch (error) {
      console.error('Error al cargar el Project:', error);
    }
  };

  // Cargar la tarea al iniciar
  useEffect(() => {
    loadProject();
  }, []);

  return { currentProject, saveProject, loadProject, clearProject };
};
