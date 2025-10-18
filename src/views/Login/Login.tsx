import { useState, useEffect } from 'react';
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
  AppState,
  AppStateStatus,
} from 'react-native';
import axios from "axios";
import { API_BASE_URL } from '../../config/api';

const { width, height } = Dimensions.get('window');

function Login(): any {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [correo, setCorreo] = useState('');
  const [errorBoolean, setErrorBoolean] = useState(false);



  const handleLogin = () => {
    if (correo === '') {
      setErrorBoolean(true); // Muestra el error si el correo está vacío
      return;
    }


    const fetchData = async () => {
      const JsonLogin = {
        email: correo,
      };

      let reqOptions = {
        url: `${API_BASE_URL}/user/email_exists`,
        method: "POST",
        data: JsonLogin,
      };
      console.log(reqOptions);

      try {
        const response = await axios(reqOptions);
        console.log(response.data.message);

        if (response.data.message === "User already exists") {
          navigate('Password', { email: correo });
          setErrorBoolean(false);
        } else {
      setErrorBoolean(true);
    }
      } catch (error: any) {
        console.error(error);
      }
    };

    fetchData();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#0A3649' }}>
      <SafeAreaView style={styles.container}>
        <Image
          style={{
            width: width * 0.35,
            height: width * 0.35,
            resizeMode: 'contain',
            marginTop: height * 0.2,
            alignSelf: 'center',
            tintColor: 'white',
            marginBottom: 0,
          }}
          source={require('../../assets/images/logo-icon_white.png')}
        />
        <Image
          source={require('../../assets/images/logo-text_white.png')}
          style={{ width: width * 0.5, resizeMode: 'contain', marginTop: -10 }}
        />
        <View style={{ width: '90%', maxWidth: 300 }}>
          <TextInput
            style={{
              height: 50,
              backgroundColor: '#05222F',
              borderRadius: 5,
              color: 'white',
              paddingHorizontal: 10,
              fontSize: 17,
            }}
            placeholder='Escribe tu correo '
            placeholderTextColor='grey'
            keyboardType='email-address'
            autoCapitalize='none'
            value={correo}
            onChangeText={setCorreo}
          />
          {errorBoolean ? (
            <Text style={{ color: '#ff7979', marginTop: 10 }}>
              Ingresa un correo
            </Text>
          ) : null}

          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color:  '#05222F',
                fontSize: 17,
                textAlign: 'center',
                backgroundColor: correo === '' || errorBoolean ? '#DEDEDE' : '#DEDEDE',
                padding: 10,
                borderRadius: 5,
                width: '100%',
              }}
              onPress={() => correo !== '' && handleLogin()} // Solo llama handleLogin si el correo no está vacío
            >
              Continuar
            </Text>
          </TouchableOpacity>

          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
            O
          </Text>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
                backgroundColor: '#1C4360',
                padding: 10,
                borderRadius: 5,
                width: '100%',
              }}
              onPress={() => navigate('CreacionCuenta')}
            >
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Login;
