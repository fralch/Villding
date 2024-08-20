import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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

const { width, height } = Dimensions.get('window');

function Verificacion(): JSX.Element {
  const { navigate } = useNavigation();

  const [codigo, setCodigo] = useState('');
  const [errorBoolean, setErrorBoolean] = useState(false);

  const handleLogin = () => {
    if (codigo !== '') {
      // navigate('CreacionCuenta');
      setErrorBoolean(false);
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
          <Text
            style={{
              color: 'grey',
              fontSize: 15,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Ingresa tu código
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
            placeholder='Ingresa código'
            placeholderTextColor='grey'
            keyboardType='number-pad'
            autoCapitalize='none'
            value={codigo}
            onChangeText={setCodigo}
          />
          {errorBoolean ? (
            <Text style={{ color: '#ff7979', marginTop: 10 }}>
              Ingresa un código para continuar
            </Text>
          ) : null}
          <Text style={{ color: 'grey', marginTop: 10 }}>
            Ingresa el código que enviamos a tu correo.
          </Text>
          <Text style={{ color: 'grey', marginTop: 5 }}>
            Recuerda revisar Spam o Notificaciones.
          </Text>
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
              Verificar
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => navigate('Login')}
        >
          <Text
            style={{
              color: '#ddd',
              fontSize: 17,
              textAlign: 'center',
              padding: 10,
              borderRadius: 5,
              width: '100%',
            }}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
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

export default Verificacion;
