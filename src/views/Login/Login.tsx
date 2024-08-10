import { useNavigation } from '@react-navigation/native';
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
import { useEffect } from 'react';
import LogoSection from './../../components/LogoVertical';

import LoginForm from './LoginForm';

function Login(): JSX.Element {
  const { navigate } = useNavigation();

  return (
    <ScrollView>
      <View>
        <View>
          <LogoSection />
          <LoginForm />
        </View>
      </View>
    </ScrollView>
  );
}

export default Login;
