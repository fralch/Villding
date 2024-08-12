import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  TouchableHighlight,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import TextoInput from './../../components/inputs/TextInput';
import PasswordInput from './../../components/inputs/PasswordInput';

function LoginForm() {
  return (
    <View style={styles.container}>
      <TextoInput placeholder={'loginScreen.emailPlaceholder'} />
      <PasswordInput
        placeholder={'loginScreen.passPlaceholder'}
        label={'loginScreen.passPlaceholder'}
        onChange={() => {}}
      />
      <TouchableOpacity>
        <Text>{'loginScreen.btnSubmit'}</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default LoginForm;
