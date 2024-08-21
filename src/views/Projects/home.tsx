import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import ProjectList from '../../components/Project/ProjectList';

interface Project {
  title: string;
  subtitle: string;
  company: string;
  image: string;
  week: number;
}

export default function HomeProject() {
  const projects: Project[] = [
    {
      title: 'Multifamiliar Barranco',
      subtitle: 'Jirón Dos de Mayo Barranco',
      company: 'Weinstein Ingenieros SAC',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKIJC0XQm26nBGa5VoTkZzjhBsAPsE9LdTeQ&s',
      week: 7,
    },
    {
      title: 'Nave industrial',
      subtitle: 'Jirón Dos de Mayo Barranco',
      company: 'Weinstein Ingenieros SAC',
      image:
        'https://danpal.com/wp-content/uploads/2020/09/Fachadas-de-Edificios-Contempor%C3%A1neos-2.jpg',
      week: 7,
    },
    {
      title: 'Nave industrial',
      subtitle: 'Jirón Dos de Mayo Barranco',
      company: 'Weinstein Ingenieros SAC',
      image:
        'https://danpal.com/wp-content/uploads/2020/09/Fachadas-de-Edificios-Contempor%C3%A1neos-2.jpg',
      week: 7,
    },
    {
      title: 'Nave industrial',
      subtitle: 'Jirón Dos de Mayo Barranco',
      company: 'Weinstein Ingenieros SAC',
      image:
        'https://danpal.com/wp-content/uploads/2020/09/Fachadas-de-Edificios-Contempor%C3%A1neos-2.jpg',
      week: 7,
    },
    {
      title: 'Nave industrial',
      subtitle: 'Jirón Dos de Mayo Barranco',
      company: 'Weinstein Ingenieros SAC',
      image:
        'https://danpal.com/wp-content/uploads/2020/09/Fachadas-de-Edificios-Contempor%C3%A1neos-2.jpg',
      week: 7,
    },
  ];

  return (
    <View style={styles.container}>
      <ExpoStatusBar style='dark' />
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo-tex-simple_white.png')}
          style={styles.title}
        />
        <View style={styles.headerIcons}>
          <Feather
            name='search'
            size={24}
            color='white'
            style={styles.icon}
          />

          <Image
            source={require('../../assets/images/user.png')}
            style={styles.avatar}
          />
        </View>
      </View>
      <ProjectList projects={projects} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginRight: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
