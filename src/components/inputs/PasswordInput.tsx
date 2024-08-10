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
  TextInput,
} from 'react-native';
import { useState } from 'react';

export type Props = {
  onChange: (text: string) => void;
  label?: string;
  value?: string;
  placeholder?: string;
};

function PasswordInput({ label, onChange, value, placeholder }: Props) {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        placeholder={placeholder}
        onChangeText={onChange}
        value={value}
      />
    </View>
  );
}

export default PasswordInput;
