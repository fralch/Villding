import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Pressable,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  MaterialCommunityIcons,
  Entypo,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import axios from "axios";
import { styles } from "./styles/ActivityItemCreateStyles";

// Tipos y constantes
interface ActivityItemCreateProps {
  tipo: string;
  date: string;
  project_id: number;
  tracking_id: number;
}

// Componente principal
const ActivityItemCreate = forwardRef<ActivityItemCreateRef, ActivityItemCreateProps>(({ tipo, project_id, tracking_id, date, }, ref) => {
  // estado del formulario 
  const [state, setState] = useState({
    tipoTask: tipo,
    titulo: "",
    description: "",
    location: "",
    horas: "",
    comments: "",
    selectedIcon: "local-shipping" as keyof typeof MaterialIcons.glyphMap,
    fecha_creacion: "",
  });
  const [tipoActual, setTipoActual] = useState(tipo);

  useEffect(() => {
    // date es la fecha pasada como prop para crear la actividad
    // Convertir formato de fecha "y/m" a "yyyy-mm-dd"
    let newDate = date.split("/").reverse().join("-");
    newDate = new Date().getFullYear() + "-" + newDate;
    newDate = new Date(newDate).toISOString().split('T')[0];
    setState(prevState => ({ ...prevState, fecha_creacion: newDate })); // añadiendo fecha de creación al formulario
  }, []);

  // Función para actualizar el estado (Pendiente,  Programado, Completado) del formulario
  const updateState = (updates: Partial<typeof state>) => { // recibo un objeto con los campos a actualizar en el parametro updates
    setState(prevState => ({ ...prevState, ...updates })); // fijo los valores del estado con los valores del objeto updates
  };

  // Función para actualizar el valor de un campo del formulario  
  const handleFieldChange = (field: string, value: string) => { // recibo el nombre del campo y el valor a actualizar
    updateState({ [field]: value } as Partial<typeof state>); // fijo los valores del estado con los valores del objeto updates
  };

  // Función para preparar los datos de la actividad
  const prepareActivityData = () => {
    // Comparar fecha de creación con la fecha actual
    const today = new Date().toISOString().split('T')[0];
    // si fecha de creación es mayor a la fecha actual, el estado es "programado", si no, el estado es el valor de tipoActual
    const status = state.fecha_creacion > today ? "programado" : tipoActual.toLowerCase(); 

    return {
      project_id,
      tracking_id,
      name: state.titulo,
      description: state.description,
      location: state.location,
      horas: state.horas,
      status: status,
      icon: `fa-${state.selectedIcon}`,
      comments: state.comments,
      fecha_creacion: state.fecha_creacion,
    };
  };

  const handleCreateActivity = async (): Promise<boolean> => {
    // Validación
    if (!state.titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return false;
    }

    const activityData = prepareActivityData(); // Preparo los datos de la actividad

    try {
      const response = await axios.post(
        'https://centroesteticoedith.com/endpoint/activities/create',
        activityData,
        {
          headers: {
            "Content-Type": "application/json",
            'Cookie': 'XSRF-TOKEN=...' // Usar el mismo token que en el componente padre
          }
        }
      );

      Alert.alert("Éxito", "Actividad creada correctamente");
      resetForm();
      return true;
    } catch (error) {
      console.error('Error al crear la actividad:', error);
      Alert.alert("Error", "No se pudo crear la actividad. Intente nuevamente.");
      return false;
    }
  };

  // Función crear actividad pero con el estado "completado"
  const finishTask = async (): Promise<boolean> => { 
    // Crear una copia de los datos actuales
    const activityData = {
      ...prepareActivityData(),
      status: "completado" // Forzar el estado a "completado" explícitamente
    };

    try {
      const response = await axios.post(
        'https://centroesteticoedith.com/endpoint/activities/create',
        activityData,
        {
          headers: {
            "Content-Type": "application/json",
            'Cookie': 'XSRF-TOKEN=...'
          }
        }
      );

      Alert.alert("Éxito", "Actividad completada correctamente");
      resetForm();
      return true;
    } catch (error) {
      console.error('Error al finalizar la actividad:', error);
      Alert.alert("Error", "No se pudo finalizar la actividad. Intente nuevamente.");
      return false;
    }
  };

  // Enviar métodos al componente padre a través de la referencia
  useImperativeHandle(ref, () => ({
    handleCreateActivity, // Método para crear una actividad
    finishTask, // Método para finalizar una actividad
  }));

  const resetForm = () => {
    setState({
      tipoTask: tipoActual,
      titulo: "",
      description: "",
      location: "",
      horas: "",
      comments: "",
      selectedIcon: "local-shipping",
      fecha_creacion: state.fecha_creacion,
    });
  };

  return (
    <View style={{ backgroundColor: "#0a3649" }}>
      <ExpoStatusBar style="light" />
      <ScrollView>
        <View>
          {/* Componente Indicador de Estado e Imagen */}
          <StatusIndicator tipoTask={state.tipoTask} />

          {/* Componente Sección de Título */}
          <TitleSection
            titulo={state.titulo}
            onTituloChange={(text) => updateState({ titulo: text })}
            onFinishTask={finishTask}
          />

          {/* Componente Campos del Formulario */}
          <FormFields
            description={state.description}
            location={state.location}
            horas={state.horas}
            comments={state.comments}
            onValueChange={handleFieldChange}
          />

          {/* Componente Selector de Íconos */}
          <IconSelector
            selectedIcon={state.selectedIcon}
            onIconSelect={(icon) => updateState({ selectedIcon: icon })}
          />
        </View>
      </ScrollView>
    </View>
  );
});


// Referencia al componente
export interface ActivityItemCreateRef {
  handleCreateActivity: () => Promise<boolean>; // Método para crear una actividad
  finishTask: () => Promise<boolean>; // Método para finalizar una tarea
}

// Opciones de íconos
const ICON_OPTIONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  "local-shipping",
  "directions-car",
  "ac-unit",
  "adb",
  "agriculture",
];

// Íconos recientes
const RECENT_ICONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  "local-shipping",
  "directions-car",
];

// Componente indicador de estado e imagen 
const StatusIndicator = ({ tipoTask }: { tipoTask: string }) => {
  const getStatusColor = () => { // Obtiene el color del estado
    switch (tipoTask) {
      case "Programado": return "#0a3649";
      case "Pendiente": return "#d1a44c";
      case "Completado": return "#4ec291";
      default: return "#0a3649";
    }
  };

  const renderStatusIcon = () => {  // Renderiza el ícono del estado
    switch (tipoTask) {
      case "Programado":
        return <MaterialCommunityIcons name="progress-clock" size={20} color="#d1a44c" />;
      case "Pendiente":
        return (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <MaterialIcons name="agriculture" size={24} color="#eee" />
            <AntDesign name="clockcircle" size={24} color="#d1a44c" />
          </View>
        );
      case "Completado":
        return (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <MaterialIcons name="agriculture" size={24} color="#eee" />
            <MaterialCommunityIcons name="clock-check" size={24} color="#4ec291" />
          </View>
        );
    }
  };

  return (
    <>
      <Pressable style={styles.uploadBox}>
        <Image
          source={require("../../assets/images/add_img.png")}
          style={{ width: 30, height: 30 }}
        />
        <View style={styles.iconStatus}>
          {renderStatusIcon()}
        </View>
      </Pressable>

      <View
        style={[
          styles.statusProgramado,
          {
            backgroundColor: getStatusColor(),
            borderTopColor: tipoTask === "Completado" ? "#0a3649" : "#d1a44c",
            borderBottomColor: tipoTask === "Completado" ? "#0a3649" : "#d1a44c",
          },
        ]}
      >
        <Text
          style={{
            fontSize: 14,
            color: tipoTask === "Programado" ? "#d1a44c" : "#0a3649",
          }}
        >
          {tipoTask}
        </Text>
      </View>
    </>
  );
};

// Componente de sección de título
const TitleSection = ({
  titulo,
  onTituloChange,
  onFinishTask
}: {
  titulo: string,
  onTituloChange: (text: string) => void,
  onFinishTask: () => Promise<boolean>
}) => {
  return (
    <View style={{ backgroundColor: "#0a3649", padding: 20 }}>
      <TextInput
        style={{
          fontSize: 35,
          width: "70%",
          color: "white",
          marginBottom: 10,
          textAlignVertical: "top",
        }}
        value={titulo}
        onChangeText={onTituloChange}
        placeholder="Ingrese el título"
        placeholderTextColor="#888"
        multiline={true}
        numberOfLines={4}
      />
      <View style={styles.hr} />
      <TouchableOpacity
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
          backgroundColor: "#dedede",
          borderRadius: 5,
        }}
        onPress={onFinishTask}
      >
        <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
          Finalizar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente de campos del formulario
const FormFields = ({
  description,
  location,
  horas,
  comments,
  onValueChange
}: {
  description: string,
  location: string,
  horas: string,
  comments: string,
  onValueChange: (field: string, value: string) => void
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
    },
    {
      icon: <MaterialCommunityIcons name="comment-processing" size={24} color="white" />,
      placeholder: "Comentarios (opcional)",
      value: comments,
      field: "comments"
    }
  ];

  return (
    <View>
      {fields.map((inputConfig, index) => (
        <View key={index} style={styles.inputContainer}>
          {inputConfig.icon}
          <TextInput
            style={styles.input}
            placeholder={inputConfig.placeholder}
            placeholderTextColor="#888"
            value={inputConfig.value}
            onChangeText={(text) => onValueChange(inputConfig.field, text)}
          />
        </View>
      ))}
    </View>
  );
};

// Componente selector de íconos
const IconSelector = ({ selectedIcon, onIconSelect }: { selectedIcon: keyof typeof MaterialIcons.glyphMap, onIconSelect: (icon: keyof typeof MaterialIcons.glyphMap) => void }) => {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#05222f",
        }}
      >
        <Text style={{ fontSize: 17, color: "#dedede", padding: 15 }}>
          Seleccionar un ícono
        </Text>
        <MaterialIcons
          name="arrow-forward-ios"
          size={15}
          color="#dedede"
          style={{ marginTop: 5 }}
        />
      </View>

      <View style={{ backgroundColor: "#0a3649" }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          <View style={styles.iconRow}>
            {RECENT_ICONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onIconSelect(icon)}
              >
                <MaterialIcons
                  name={icon}
                  size={40}
                  color={selectedIcon === icon ? "white" : "grey"}
                  style={styles.icon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos los íconos</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onIconSelect(icon)}
              >
                <MaterialIcons
                  name={icon}
                  size={40}
                  color={selectedIcon === icon ? "white" : "grey"}
                  style={styles.icon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};



export default ActivityItemCreate;
