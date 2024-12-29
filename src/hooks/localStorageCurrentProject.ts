import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipo para el proyecto
interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  week: number;
}

/**
 * Almacena un proyecto en AsyncStorage.
 * @param project - El proyecto a almacenar.
 */
const storeProject = async (project: Project): Promise<void> => {
  try {
    await AsyncStorage.setItem('@current_Project', JSON.stringify(project));
  } catch (e) {
    console.error('Error al almacenar el proyecto:', e);
  }
};

/**
 * Elimina el proyecto actual de AsyncStorage.
 */
const removeProject = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@current_Project');
  } catch (e) {
    console.error('Error al eliminar el proyecto:', e);
  }
};

/**
 * Obtiene el proyecto actual de AsyncStorage.
 * @returns El proyecto actual o null si no existe.
 */
const getProject = async (): Promise<Project | null> => {
  try {
    const value = await AsyncStorage.getItem('@current_Project');
    if (value !== null) {
      return JSON.parse(value) as Project;
    }
    return null;
  } catch (e) {
    console.error('Error al obtener el proyecto:', e);
    return null;
  }
};

export { storeProject, removeProject, getProject };
