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

export type Props = {
  onChange: (text: string) => void;
  label?: string;
  value?: string;
  placeholder?: string;
};

function TextoInput({ label, onChange, value, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label]}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        onChangeText={onChange}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 0,
    borderRadius: 5,
    padding: 8,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: '#000', // You can customize this based on your needs
  },
});
export default TextInput;
