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
import { SvgXml } from 'react-native-svg';

function LogoVertical() {
  return (
    <View>
      <Image source={require('../assets/images/logo-icon_dark.png')} />
      <Image source={require('../assets/images/logo-text_dark.png')} />
    </View>
  );
}

export default LogoVertical;
