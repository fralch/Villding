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

export const useProject = () => {
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

  return { project, saveProject };
};
