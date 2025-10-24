// components/FormFields.tsx
/* Este componente es responsable de mostrar los inputs de entrada de la actividad */

import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
  const [showTimePickerInicio, setShowTimePickerInicio] = useState(false);
  const [showTimePickerFin, setShowTimePickerFin] = useState(false);
  const [selectedTimeInicio, setSelectedTimeInicio] = useState(new Date());
  const [selectedTimeFin, setSelectedTimeFin] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

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
  
  // Inicializar las horas desde el formato "HH:MM - HH:MM"
  useEffect(() => {
    if (horas) {
      const partes = horas.split(' - ');
      if (partes.length === 2) {
        setHoraInicio(partes[0]);
        setHoraFin(partes[1]);
      }
    }
  }, [horas]);
  
  // Función para manejar el cambio de hora de inicio en el DateTimePicker
  const onChangeTimeInicio = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePickerInicio(false); // Ocultar el selector independientemente de la acción
    if (event.type === 'set' && selectedDate) { // 'set' significa que el usuario seleccionó una hora
      setSelectedTimeInicio(selectedDate);
      // Formatear la hora seleccionada (HH:MM)
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      setHoraInicio(formattedTime);
      
      // Actualizar el valor combinado de horas
      const horasCombinadas = horaFin ? `${formattedTime} - ${horaFin}` : formattedTime;
      onValueChange("horas", horasCombinadas);
    }
  };

  // Función para manejar el cambio de hora de fin en el DateTimePicker
  const onChangeTimeFin = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePickerFin(false); // Ocultar el selector independientemente de la acción
    if (event.type === 'set' && selectedDate) { // 'set' significa que el usuario seleccionó una hora
      setSelectedTimeFin(selectedDate);
      // Formatear la hora seleccionada (HH:MM)
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      setHoraFin(formattedTime);
      
      // Actualizar el valor combinado de horas
      const horasCombinadas = horaInicio ? `${horaInicio} - ${formattedTime}` : formattedTime;
      onValueChange("horas", horasCombinadas);
    }
  };

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
    }
  ];

  return (
    <View>
      {/* Campos de texto normales */}
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
          // Mostrar el campo de descripción siempre, ubicación solo si tiene valor
          (inputConfig.field === 'description' || inputConfig.value) ? (
            <View key={index} style={[styles.inputContainer, { backgroundColor: "#0a3649" }]}>
              {inputConfig.icon}
              <Text
                style={[
                  styles.input,
                  status === 'completado' && { opacity: 0.7 },
                  { color: inputConfig.value ? '#fff' : '#888' }
                ]}
                numberOfLines={inputConfig.field === 'description' ? undefined : 1}
              >
                {inputConfig.value || (inputConfig.field === 'description' ? 'Sin descripción' : '')}
              </Text>
            </View>
          ) : null
        ))
      )}

      {/* Campo de horario */}
      {esEditable ? (
        <View style={styles.inputContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="clock" size={24} color="white" style={{ marginRight: 10 }} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              style={[styles.input, { flex: 0.48, justifyContent: 'center' }]} 
              onPress={() => setShowTimePickerInicio(true)}
              disabled={status === 'completado' && !isAdmin}
            >
              <Text style={{ color: horaInicio ? 'white' : '#888' }}>
                {horaInicio || "Hora de inicio"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.input, { flex: 0.48, justifyContent: 'center' }]} 
              onPress={() => setShowTimePickerFin(true)}
              disabled={status === 'completado' && !isAdmin}
            >
              <Text style={{ color: horaFin ? 'white' : '#888' }}>
                {horaFin || "Hora de fin"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Solo mostrar el horario si tiene un valor y no es "0"
        horas && horas !== "0" ? (
          <View style={[styles.inputContainer, { backgroundColor: "#0a3649" }]}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="white" />
            <Text
              style={[
                styles.input,
                status === 'completado' && { opacity: 0.7 },
                { color: '#fff' }
              ]}
              numberOfLines={1}
            >
              {horas}
            </Text>
          </View>
        ) : null
      )}
      
      {/* DateTimePicker para seleccionar la hora de inicio */}
      {showTimePickerInicio && (
        <DateTimePicker
          value={selectedTimeInicio}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeTimeInicio}
        />
      )}

      {/* DateTimePicker para seleccionar la hora de fin */}
      {showTimePickerFin && (
        <DateTimePicker
          value={selectedTimeFin}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeTimeFin}
        />
      )}
    </View>
  );
};

export default FormFields;