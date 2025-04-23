// components/FormFields.tsx
/* Este componente es responsable de mostrar los inputs de entrada de la actividad */

import React, { useState, useEffect } from 'react';
import { View, TextInput, Text } from 'react-native';
import { Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles/ActivityItemCreateStyles';
import { getActivity } from '../../../hooks/localStorageCurrentActvity';

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
  const [esEditable, setEsEditable] = useState(false);

  // Verificar la editabilidad al cargar el componente
  useEffect(() => {
    const obteniendoActividad = async () => {
      const actividad = await getActivity();
      if (actividad) {
        const puedeEditar = actividad.editMode;
        setEsEditable(puedeEditar || false);
      }
    };
    obteniendoActividad();
  }, []); // Ejecutar solo al montar el componente

  // Refrescar periódicamente el estado de edición
  useEffect(() => {
    const refreshEditableStatus = async () => {
      const actividad = await getActivity();
      if (actividad) {
        const puedeEditar = actividad.editMode;
        setEsEditable(puedeEditar || false);
      }
    };

    // Crear un intervalo para verificar periódicamente
    const intervalId = setInterval(refreshEditableStatus, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

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
      {esEditable ? (
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
              editable={status !== 'completado' || isAdmin} // Admin puede editar incluso si está completado
            />
          </View>
        ))
      ) : (
        fields.map((inputConfig, index) => (
          <View key={index} style={[styles.inputContainer, { backgroundColor: "#0a3649" }]}>
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