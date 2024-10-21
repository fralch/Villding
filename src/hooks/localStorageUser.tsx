import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
  uri?: string;
}

const storeSesion = async (NewUser: User): Promise<void> => {
  try {
    await AsyncStorage.setItem('@session_Key', JSON.stringify(NewUser));
  } catch (e) {
    console.error(e);
  }
};

const removeSesion = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@session_Key');
  } catch (e) {
    console.error(e);
  }
};

const getSesion = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem('@session_Key');
    return value;
  } catch (e) {
    console.error(e);
    return null;
  }
};



export { storeSesion, removeSesion, getSesion };
