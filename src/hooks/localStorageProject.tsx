import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Project {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  company: string;
  week: number;
}

export const localStorageProject = () => {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const savedProject = await AsyncStorage.getItem('project');
        if (savedProject) {
          setProject(JSON.parse(savedProject));
        }
      } catch (error) {
        console.log('Error al cargar el proyecto desde AsyncStorage:', error);
      }
    };

    loadProject();
  }, []);

  const saveProject = async (newProject: Project) => {
    try {
      await AsyncStorage.setItem('project', JSON.stringify(newProject));
      setProject(newProject);
    } catch (error) {
      console.log('Error al guardar el proyecto en AsyncStorage:', error);
    }
  };

  const deleteProject = async () => {
    try {
      await AsyncStorage.removeItem('project');
      setProject(null);
    } catch (error) {
      console.log('Error al eliminar el proyecto de AsyncStorage:', error);
    }
  };

  return { project, saveProject, deleteProject };
};
