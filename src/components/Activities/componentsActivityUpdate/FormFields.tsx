// components/FormFields.tsx
/* Este componente es responsable de mostrar los inputs  de entrada de la actividad */

import React from 'react';
import { View, TextInput } from 'react-native';
import { Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles/ActivityItemCreateStyles';

interface FormFieldsProps {
  description: string;
  location: string;
  horas: string;
  onValueChange: (field: string, value: string) => void;
  status: string;
}

const FormFields: React.FC<FormFieldsProps> = ({
  description,
  location,
  horas,
  onValueChange, 
  status
}) => {
  const fields = [
    {
      icon: <Entypo name="text" size={24} color="white" />,
      placeholder: "Descripción",
      value: description,
      field: "description"
    },
    {
      icon: <MaterialIcons name="location-on" size={24} color="white" />,
      placeholder: "Ubicación",
      value: location,
      field: "location"
    },
    {
      icon: <MaterialCommunityIcons name="clock-outline" size={24} color="white" />,
      placeholder: "Horario",
      value: horas,
      field: "horas"
    }
  ];

  return (
    <View>
      {fields.map((inputConfig, index) => (
        <View key={index} style={styles.inputContainer}>
          {inputConfig.icon}
          <TextInput
            style={[
              styles.input,
              status === 'completado' && { opacity: 0.7 }
            ]}
            placeholder={inputConfig.placeholder}
            placeholderTextColor="#888"
            value={inputConfig.value}
            onChangeText={(text) => onValueChange(inputConfig.field, text)}
            multiline={inputConfig.field === 'description'}
            numberOfLines={inputConfig.field === 'description' ? 4 : 1}
            editable={status !== 'completado'}
          />
        </View>
      ))}
    </View>
  );
};

export default FormFields;