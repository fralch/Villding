import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeProject = async (Project: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('@current_Project', JSON.stringify(Project));
  } catch (e) {
    console.error(e);
  }
};

const removeProject = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@current_Project');
  } catch (e) {
    console.error(e);
  }
};

const getProject = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem('@current_Project');
    return value;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// remove all projects this h

export { storeProject, removeProject, getProject };
