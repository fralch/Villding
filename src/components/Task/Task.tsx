import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ProjectList from '../../components/Project/ProjectList';
import ProjectListSearch from '../../components/Project/ProjectListSearch';
import { getProjects } from '../../hooks/localStorageProject';
import { removeProject } from '../../hooks/localStorageCurrentProject';

export default function Task() {
  const screenWidth = Dimensions.get('window').width;
  const headerWidth = React.useRef(new Animated.Value(screenWidth)).current;

  return (
    <View style={[styles.container]}>
      <ExpoStatusBar style='light' />
      <View style={[styles.header, { width: headerWidth }]}>
        <MaterialIcons
          name='arrow-back'
          size={24}
          color='white'
        />
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            marginLeft: 10,
          }}
        >
          Primer piso - torre "A"
        </Text>
        <MaterialIcons
          name='more-vert'
          size={24}
          color='white'
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05222F', // Background color of the app
  },

  header: {
    backgroundColor: '#05222F',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 20,
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#0D465E',
    marginTop: 20,
  },
  title: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#05222F',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: 'white',
    fontSize: 16,
  },
});
