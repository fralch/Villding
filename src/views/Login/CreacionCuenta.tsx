import { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');

function CreacionCuenta(): JSX.Element {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [secureText, setSecureText] = useState(true);

  const handleCreateAccount = () => {
    navigate('Verificacion');
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#0A3649' }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Confirma la creación de tu cuenta</Text>
          <View style={styles.mainCircle}>
            <View style={styles.mainCircle}>
              <Image
                source={require('../../assets/images/user.png')}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name='pencil'
                size={24}
                color='black'
              />
            </View>
          </View>
          <View style={{ width: '90%', maxWidth: 300, marginTop: 30 }}>
            <Text
              style={{
                color: 'grey',
                fontSize: 15,
                textAlign: 'left',
                marginBottom: 10,
              }}
            >
              Nombres
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: '#05222F',
                borderRadius: 5,
                color: 'white',
                paddingHorizontal: 10,
                fontSize: 17,
                marginBottom: 10,
              }}
              placeholder='Escribe tus nombres '
              placeholderTextColor='grey'
              autoCapitalize='none'
            />
            <Text
              style={{
                color: 'grey',
                fontSize: 15,
                textAlign: 'left',
                marginBottom: 10,
              }}
            >
              Apellidos
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: '#05222F',
                borderRadius: 5,
                color: 'white',
                paddingHorizontal: 10,
                fontSize: 17,
              }}
              placeholder='Escribe tus apellidos '
              placeholderTextColor='grey'
              autoCapitalize='none'
            />
            <Text
              style={{
                color: 'grey',
                fontSize: 15,
                textAlign: 'left',
                marginBottom: 10,
              }}
            >
              Correo
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: '#05222F',
                borderRadius: 5,
                color: 'white',
                paddingHorizontal: 10,
                fontSize: 17,
              }}
              placeholder='Escribe tus apellidos '
              placeholderTextColor='grey'
              autoCapitalize='none'
              keyboardType='email-address'
            />
            <Text
              style={{
                color: 'grey',
                fontSize: 15,
                textAlign: 'left',
                marginBottom: 10,
              }}
            >
              Contraseña
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: '#05222F',
                borderRadius: 5,
                color: 'white',
                paddingHorizontal: 10,
                fontSize: 17,
              }}
              placeholder='Escribe tu contraseña '
              placeholderTextColor='grey'
              autoCapitalize='none'
              secureTextEntry={secureText}
            />
          </View>
        </View>
        <View style={{ width: '90%', maxWidth: 300, marginTop: 30 }}>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color: '#05222F',
                fontSize: 17,
                textAlign: 'center',
                backgroundColor: '#DEDEDE',
                padding: 10,
                borderRadius: 5,
                width: '100%',
              }}
              onPress={() => handleCreateAccount()}
            >
              Crear nueva cuenta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color: 'white',
                fontSize: 17,
                textAlign: 'center',
                padding: 10,
                borderRadius: 5,
                width: '100%',
                marginBottom: 50,
              }}
              onPress={() => navigate('Login')}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    color: 'white',
    fontSize: 20,
    marginTop: 80,
    marginBottom: 30,
    textAlign: 'center',
  },
  circle: {
    width: 80, // El tamaño del círculo
    height: 80,
    borderRadius: 40, // La mitad del tamaño para que sea un círculo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // El borde del círculo
    borderColor: 'white',
  },
  image_user: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 20,
  },
  mainCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFDBAC', // Color de fondo similar al círculo principal
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5E5', // Color de fondo del círculo pequeño
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default CreacionCuenta;
