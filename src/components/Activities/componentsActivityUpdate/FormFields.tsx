// components/FormFields.tsx
/* Este componente es responsable de mostrar los inputs  de entrada de la actividad */

import React, {useState, useEffect} from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles/ActivityItemCreateStyles';

interface FormFieldsProps {
  description: string;
  location: string;
  horas: string;
  onValueChange: (field: string, value: string) => void;
  status: string;
  isAdmin: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  description,
  location,
  horas,
  onValueChange, 
  status,
  isAdmin
}) => {
  const [isEditable, setIsEditable] = useState(false);
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
  
  const puedeEditarActividad = (estadoActividad :any, esAdmin:any) => {
    // Caso 1: Si la actividad NO está completada, cualquier usuario puede editar
    if (estadoActividad !== "completado") {
      return true;
    }

    // Caso 2: Si la actividad está completada, SOLO los admin pueden editar
    if (estadoActividad === "completado" && esAdmin) {
      return true;
    }

    // En cualquier otro caso, no se puede editar
    return false;   
  }
  return (
    <View>
      {puedeEditarActividad(status, isAdmin) ? (
        fields.map((inputConfig, index) => (
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
        ))
      ) : (
        fields.map((inputConfig, index) => (
        <View key={index} style={[styles.inputContainer, {   backgroundColor: "#0a3649",}]}>
          {inputConfig.icon}
          <Text
            style={[
              styles.input,
              status === 'completado' && { opacity: 0.7 },
              { color: '#fff' }
            ]}
            numberOfLines={inputConfig.field === 'description' ? 4 : 1}
          >
            {inputConfig.value || inputConfig.placeholder}
          </Text>
        </View>
          ))
      )}
    
    </View>
  );
};

export default FormFields;