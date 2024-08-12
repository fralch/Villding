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
    <View>
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

export default LoginForm;
