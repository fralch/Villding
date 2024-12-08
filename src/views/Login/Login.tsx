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
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from "axios";

const { width, height } = Dimensions.get('window');

function Login(): JSX.Element {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [showModal, setShowModal] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState("Email correcto.");
  const [correo, setCorreo] = useState('');
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error

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
    if (correo === '') {
      setErrorBoolean(true); // Muestra el error si el correo está vacío
      return;
    }

    setShowModalLoading(true);
    const fetchData = async () => {
      const JsonLogin = {
        email: correo,
      };

      let reqOptions = {
        url: "https://centroesteticoedith.com/endpoint/user/email_exists",
        method: "POST",
        data: JsonLogin,
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
      } catch (error: any) {
        console.error(error);
        setShowModalLoading(false);

        // Manejo del error y actualización del estado con el mensaje de error
        if (error.response) {
          setErrorMessage(error.response.data?.message || "Hubo un error en la conexión.");
        } else if (error.request) {
          setErrorMessage("No se pudo conectar al servidor.");
        } else {
          setErrorMessage("Error desconocido: " + error.message);
        }

        // Mostrar el modal de error
        setShowModal(true);
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
                color: correo === '' || errorBoolean ? '#B0B0B0' : '#05222F',
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

      {/* Modal de error que muestra los errores de la consulta de axios */}
      <Modal
        transparent={true}
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)} // Asegura que se pueda cerrar el modal
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.message}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de carga */}
      <Modal transparent={true} visible={showModalLoading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#05222F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    color: 'white',
    fontSize: 20,
  },
});

export default Login;
