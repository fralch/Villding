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
import ConfirmModal from "../../components/Alerta/ConfirmationModal";
import LoadingModal from "../../components/Alerta/LoadingModal";

const { width, height } = Dimensions.get('window');

function Login(): JSX.Element {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [showModal, setShowModal] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState("Email correcto.");

  const [correo, setCorreo] = useState('');
  const [errorBoolean, setErrorBoolean] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setShowModalLoading(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogin = () => {
    if (correo !== '') {
      setShowModalLoading(true);
      const fetchData = async () => {
        const JsonLogin = {
          email: correo,
        };

        let reqOptions = {
          url: "https://www.centroesteticoedith.com/endpoint/user/email_exists",
          method: "POST",
          data: JsonLogin, // No necesitas usar JSON.stringify aquí
        };
        try {
          const response = await axios(reqOptions);
          console.log(response.data.message);

          if (response.data.message === "User already exists") {
            navigate('Password', { email: correo });
            setErrorBoolean(false);
            setShowModalLoading(false);
          } else {
            setMsjeModal("Email incorrecto.");
            setErrorBoolean(true);
            setShowModalLoading(false);
            setShowModal(true);
          }
        } catch (error) {
          console.error(error);
          setShowModalLoading(false);
        }
      };

      fetchData();
    } else {
      setErrorBoolean(true);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#0A3649' }}
    >
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
                color: '#05222F',
                fontSize: 17,
                textAlign: 'center',
                backgroundColor: '#DEDEDE',
                padding: 10,
                borderRadius: 5,
                width: '100%',
              }}
              onPress={() => handleLogin()}
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
              {/* <Image
                source={require('../../assets/images/google-logo.png')}
                style={{ width: 20, height: 20, marginRight: 10 }}
              /> */}
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ConfirmModal
        visible={showModal}
        message={msjeModal}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal visible={showModalLoading} />
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
