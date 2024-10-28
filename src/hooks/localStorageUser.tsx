import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: any;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
  telefono?: string;
  uri?: string;
}

// Función para almacenar la sesión
const storeSesion = async (NewUser: User): Promise<void> => {
  try {
    await AsyncStorage.setItem('@session_Key', JSON.stringify(NewUser));
  } catch (e) {
    console.error(e);
  }
};

// Función para actualizar la sesión
const updateSesion = async (updatedUser: any): Promise<void> => {
  try {
    const storedUser = await getSesion();
    
    // Si hay una sesión almacenada
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);

      // Actualizamos los campos con los valores proporcionados en updatedUser
      parsedUser.nombres = updatedUser.nombres;
      parsedUser.apellidos = updatedUser.apellidos;
      parsedUser.email = updatedUser.email;

      // Mantenemos los valores actuales si no se están actualizando
      parsedUser.password = parsedUser.password;
      parsedUser.rol = parsedUser.rol;
      parsedUser.telefono = updatedUser.telefono;
      parsedUser.uri = updatedUser.uri ?? parsedUser.uri; // Si `uri` es undefined, se mantiene la existente

      // Guardar el usuario actualizado en AsyncStorage
      await storeSesion(parsedUser);
    }
  } catch (e) {
    console.error('Error updating session:', e);
  }
};

// Función para remover la sesión
const removeSesion = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@session_Key');
  } catch (e) {
    console.error(e);
  }
};

// Función para obtener la sesión
const getSesion = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem('@session_Key');
    return value;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export { storeSesion, removeSesion, getSesion, updateSesion };
