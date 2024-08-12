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
  SafeAreaView,
} from 'react-native';
import { useEffect } from 'react';
import useColors from '../../hooks/useColors';
import LogoSection from './../../components/LogoVertical';

import LoginForm from './LoginForm';

function Login(): JSX.Element {
  const { navigate } = useNavigation();
  const { colors } = useColors();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.bg10 }}
    >
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ width: '90%', maxWidth: 300 }}>
          <LogoSection />
          <LoginForm />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

export default Login;
