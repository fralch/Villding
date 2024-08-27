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
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const NewProject: React.FC = () => {
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
      setProjectImage(result.uri);
    }
  };

  return (
    <View style={styles.container}>
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
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder='Fecha de inicio'
        placeholderTextColor='#888'
      />

      <Text style={styles.label}>Tiempo de ejecución</Text>
      <View style={styles.durationContainer}>
        <TextInput
          style={[styles.input, styles.durationInput]}
          value={duration}
          onChangeText={setDuration}
          keyboardType='numeric'
          placeholderTextColor='#888'
        />
        <Picker
          selectedValue={durationUnit}
          style={styles.picker}
          onValueChange={(itemValue) => setDurationUnit(itemValue)}
        >
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

      <Text style={styles.label}>Fecha estimada de fin:</Text>
      <Text style={styles.endDate}>Diciembre 2023</Text>

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

      <View style={styles.buttonsContainer}>
        <Button
          title='Cancelar'
          onPress={() => {}}
        />
        <Button
          title='Crear'
          onPress={() => {}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E4A5F',
    padding: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#034A5F',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationInput: {
    flex: 1,
  },
  picker: {
    flex: 1,
    color: '#fff',
  },
  endDate: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#034A5F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#777',
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
});

export default NewProject;
