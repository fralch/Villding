import AsyncStorage from '@react-native-async-storage/async-storage';

const storeSesion = async (value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('@session_Key', value);
  } catch (e) {
    console.error(e);
  }
};

const removeSesion = async (): Promise<void> => {
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

function cube(x: number): number {
  return x * x * x;
}

export { storeSesion, removeSesion, getSesion, cube };
