// localStorageCurrentActvity.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Activity {
    project_id: number;
    tracking_id: number;
    activity: string| JSON | object | null;
    date: string;
    isAdmin?: boolean;
    editMode?: boolean;
}

/**
 * Almacena una actividad en AsyncStorage.
 * @param activity - La actividad a almacenar.
 */
const storeActivity = async (activity: Activity | string): Promise<void> => {
    try {
        await AsyncStorage.setItem('@current_Activity', JSON.stringify(activity));
    } catch (e) {
        console.error('Error al almacenar la actividad:', e);
    }
};

/**
 * Elimina la actividad actual de AsyncStorage.
 */
const removeActivity = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('@current_Activity');
    } catch (e) {
        console.error('Error al eliminar la actividad:', e);
    }
};

/**
 * Obtiene la actividad actual de AsyncStorage.
 * @returns La actividad actual o null si no existe.
 */
const getActivity = async (): Promise<Activity | null> => {
    try {
        const value = await AsyncStorage.getItem('@current_Activity');
        if (value !== null) {
            return JSON.parse(value) as Activity;
        }
        return null;
    } catch (e) {
        console.error('Error al obtener la actividad:', e);
        return null;
    }
};

export { storeActivity, removeActivity, getActivity };