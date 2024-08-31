import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { saveProject , deleteProject } from '../../hooks/localStorageProject';

const NewProject: React.FC = () => {
  const { navigate } = useNavigation<NavigationProp<any>>();

  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('13/06/2023');
  const [duration, setDuration] = useState('6');
  const [durationUnit, setDurationUnit] = useState('Meses');
  const [projectImage, setProjectImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProjectImage(result.assets[0].uri);
    }
  };

  const showDataTimePicker = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange: (event, date) => {
        if (event.type === 'set') {
          const formattedDate = new Date(date).toLocaleDateString('es-ES');
          setStartDate(formattedDate);
        }
      },
      mode: 'date',
      is24Hour: true,
    });
  };

  const calculateEndDate = () => {
    const start = new Date(startDate);
    const durationInUnits = parseInt(duration, 10);
    if (durationUnit === 'Meses') {
      start.setMonth(start.getMonth() + durationInUnits);
    } else if (durationUnit === 'Años') {
      start.setFullYear(start.getFullYear() + durationInUnits);
    } else if (durationUnit === 'Semanas') {
      start.setDate(start.getDate() + durationInUnits * 7);
    } else if (durationUnit === 'Dias') {
      start.setDate(start.getDate() + durationInUnits);
    }
    return start.toLocaleDateString('es-ES');
  };

  const handleCreateProject = () => {
    console.log('Creando nuevo proyecto...');
    const newProject = {
      id: Date.now().toString(), // Genera un ID único
      image: projectImage || '',
      title: projectName,
      subtitle: location,
      company,
      week: parseInt(duration, 10),
    };

    saveProject(newProject);
    
    // verifica si se guardo el proyecto
    if (newProject) {
      navigate('HomeProject');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>Cancelar</Text>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            Nuevo proyecto
          </Text>
          <TouchableOpacity onPress={handleCreateProject}>
            <Text style={{ color: 'white', fontSize: 18 }}>Crear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre del proyecto*</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder='Nombre del proyecto'
          placeholderTextColor='#888'
        />

        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder='Ubicación'
          placeholderTextColor='#888'
        />

        <Text style={styles.label}>Empresa ejecutora</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder='Empresa ejecutora'
          placeholderTextColor='#888'
        />

        <Text style={styles.label}>Fecha de inicio</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={showDataTimePicker}
        >
          <Text style={{ color: '#888' }}>{startDate}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Tiempo de ejecución</Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={[
              styles.input,
              {
                width: '40%',
                textAlign: 'left',
              },
            ]}
            value={duration}
            onChangeText={setDuration}
            keyboardType='numeric'
            placeholderTextColor='#888'
          />
          <View
            style={{
              width: '50%',
              alignItems: 'center',
              marginTop: -15,
              marginLeft: 10,
              borderRadius: 5,
            }}
          >
            <Picker
              selectedValue={durationUnit}
              style={{
                height: 50,
                width: '100%',
                backgroundColor: '#05222F',
                color: 'white',
                borderRadius: 5,
              }}
              onValueChange={(itemValue) => setDurationUnit(itemValue)}
            >
              <Picker.Item
                label='Semanas'
                value='Semanas'
              />
              <Picker.Item
                label='Dias'
                value='Dias'
              />
              <Picker.Item
                label='Meses'
                value='Meses'
              />
              <Picker.Item
                label='Años'
                value='Años'
              />
            </Picker>
          </View>
        </View>

        <Text style={styles.label}>Fecha estimada de fin:</Text>
        <Text style={styles.endDate}>{calculateEndDate()}</Text>
        <Text style={styles.label}>Foto de proyecto</Text>

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handlePickImage}
        >
          {projectImage ? (
            <Image
              source={{ uri: projectImage }}
              style={styles.image}
            />
          ) : (
            <Text style={styles.imageText}>Subir foto del proyecto</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    height: 80,
    marginTop: 30,
  },
  label: {
    color: '#aaa',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#05222F',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  endDate: {
    color: '#fff',
    fontSize: 21,
    marginBottom: 16,
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#0A3649',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#777',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageText: {
    color: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#0A3649',
    padding: 16,
    margin: 0,
  },
});

export default NewProject;
