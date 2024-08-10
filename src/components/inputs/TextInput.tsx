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
    <View>
      <Text>{label}</Text>
      <TextInput
        placeholder={placeholder}
        onChangeText={onChange}
      />
    </View>
  );
}

export default TextInput;
