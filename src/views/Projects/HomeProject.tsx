import React, { useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
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
import { getSesion } from '../../hooks/localStorageUser';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  company: string;
  image: string;
  week: number;
}

export default function HomeProject() {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [search, setSearch] = React.useState<string>('');
  const [viewSearch, setViewSearch] = React.useState<boolean>(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = React.useState<Project[]>([]);
  const [imageUserSesion , setImageUserSesion] = React.useState<string>();

  const screenWidth = Dimensions.get('window').width;
  const headerWidth = Dimensions.get('window').width;

  

  useFocusEffect(
    useCallback(() => {
      getProjects().then((StoredProjects) => {
        if (StoredProjects) {
          setProjects(StoredProjects);
          setFilteredProjects(StoredProjects);
        }
      });
    }, [])
  );

  React.useEffect(() => {
    getSesion().then((StoredSesion : any) => {
      let sesion = JSON.parse(StoredSesion);
       console.log(sesion.uri);
       setImageUserSesion(sesion.uri);
    });
  }, [ ])

  useFocusEffect(
    useCallback(() => {
      // Esto se ejecuta cada vez que vuelves a la pantalla
      getSesion().then((StoredSesion: any) => {
        let sesion = JSON.parse(StoredSesion);
        console.log(sesion.uri);
        setImageUserSesion(sesion.uri);
      });
  
      return () => {
        // Limpieza si es necesario
      };
    }, [])
  );

  React.useEffect(() => {
    removeProject();
    const filtered = projects.filter((project) => {
      if (search === '') {
        return true;
      }
      return (
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        project.company.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredProjects(filtered);
  }, [search, projects]);

  return (
    <View style={[styles.container]}>
      <ExpoStatusBar style='dark' />

      {!viewSearch ? (
        <View style={[styles.header, { width: headerWidth }]}>
          <Image
            source={require('../../assets/images/logo-tex-simple_white.png')}
            style={styles.title}
          />
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setViewSearch(true)}>
              <Feather
                name='search'
                size={26}
                color='white'
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() =>  navigate('EditUser')}>
            <Image
              source={ imageUserSesion ? { uri: imageUserSesion } : require('../../assets/images/user.png')}
              style={styles.avatar}
            />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {viewSearch ? (
        <View
          style={[
            styles.header,
            {
              width: headerWidth,
            },
          ]}
        >
          <View style={[styles.headerSearch]}>
            <Feather
              name='search'
              size={26}
              color='white'
              style={[styles.icon, { marginRight: 0 }]}
            />
            <TextInput
              style={styles.input}
              placeholder='Buscar...'
              value={search}
              onChangeText={setSearch}
              placeholderTextColor='white'
            />
            <TouchableOpacity onPress={() => setViewSearch(false)}>
              <MaterialIcons
                name='cancel'
                size={26}
                color='white'
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {!viewSearch ? (
        <ProjectList projects={filteredProjects} />
      ) : (
        <ProjectListSearch projects={filteredProjects} />
      )}
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
  headerSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05222F',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#0D465E',
    marginHorizontal: 0,
    marginBottom: 20,
  },
  debug: {
    borderColor: 'red',
    borderWidth: 1,
  },
});
