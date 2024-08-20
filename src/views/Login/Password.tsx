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

function Password(): JSX.Element {
  const { navigate } = useNavigation();
  const [secureText, setSecureText] = useState(true);
  const [clave, setClave] = useState('');
  const [errorBoolean, setErrorBoolean] = useState(false);

  const handleLogin = () => {
    if (clave !== '') {
      navigate('Verificacion');
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
            Ingresa tu contraseña
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
            placeholder='Escribe tu contraseña '
            placeholderTextColor='grey'
            autoCapitalize='none'
            secureTextEntry={true}
            value={clave}
            onChangeText={setClave}
          />
          {errorBoolean ? (
            <Text style={{ color: '#ff7979', marginTop: 10 }}>
              Ingresa una contraseña para continuar
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
              Ingresar
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

export default Password;
