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
  Modal
} from 'react-native';
import axios from 'axios';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');

function CreacionCuenta(): JSX.Element {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [secureText, setSecureText] = useState(true);
  const [errorBoolean, setErrorBoolean] = useState(false);

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleCreateAccount = async () => {
    if (nombres !== '' && apellidos !== '' && email !== '' && clave !== '' ) {
      // const response = await fetch(
      //   'http://186.64.113.100:3000/api/whatsapp/text',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       nombre: nombres,
      //       Apellidos: apellidos,
      //       email: email,
      //       password: clave,
      //       rol: 'user',
      //     }),
      //   }
      // );

      //-------------------------------------
        if(clave.length < 8){
          console.log(clave.length)
          setErrorBoolean(true);
          return;
        }

        const fetchData = async () => {
          const JsonNewUser = {
            name: nombres,
            last_name: apellidos,
            email: email,
            password: clave,
            password_confirmation: clave,
            is_paid_user: false,
            role: 'user',
          };
        
          let reqOptions = {
            url: "https://www.centroesteticoedith.com/endpoint/user/create",
            method: "POST",
            data: JsonNewUser, // No necesitas usar JSON.stringify aquí
          };
        
          try {
            const response = await axios(reqOptions);
            console.log(response.data);
            // navigate('Verificacion', {
            //       nombres: nombres,
            //       apellidos: apellidos,
            //       email: email,
            //       clave: clave,
            //       rol: 'user',
            //     });

            setShowModal(true);

          } catch (error: any) {
            if (error.response) {
              console.log(error.response.data); // Imprime la respuesta completa del servidor
            } else {
              console.log(error.message);
            }
            setErrorBoolean(true);
          }
        };
        
        fetchData();
       

    }
    setErrorBoolean(true);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: '#0A3649' }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Creación de tu cuenta</Text>
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
              value={nombres}
              onChangeText={setNombres}
            />
            {errorBoolean && nombres === '' ? (
              <Text style={{ color: '#ff7979', marginTop: 10 }}>
                Ingresa tus nombres
              </Text>
            ) : null}
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
              value={apellidos}
              onChangeText={setApellidos}
            />
            {errorBoolean && apellidos === '' ? (
              <Text style={{ color: '#ff7979', marginTop: 10 }}>
                Ingresa tus apellidos
              </Text>
            ) : null}
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
              placeholder='Escribe tu correo '
              placeholderTextColor='grey'
              autoCapitalize='none'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />
            {errorBoolean && email === '' ? (
              <Text style={{ color: '#ff7979', marginTop: 10 }}>
                Ingresa tu correo
              </Text>
            ) : null}
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
              value={clave}
              onChangeText={setClave}
            />
            {errorBoolean && clave === '' ? (
              <Text style={{ color: '#ff7979', marginTop: 0 }}>
                Ingresa tu contraseña  
              </Text>
            ) : null}
            {clave.length < 8 ? (
              <Text style={{ color: '#79ffd0', marginTop: 0 }}>
                Debe tener más de 8 caracteres
              </Text>
            ) : null}
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
      <Modal transparent={true} animationType="slide" visible={showModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>El usuario se ha registrado correctamente.</Text>
          <TouchableOpacity style={styles.button} onPress={ () => setShowModal(false)}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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

  //-------------
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#0A3649',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color:"white", 
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#33baba',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CreacionCuenta;
