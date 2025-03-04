import React, { useState, forwardRef, useImperativeHandle } from "react";
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

interface ActivityItemCreateProps {
  tipo: string;
  date: string;
  project_id: number;
  tracking_id: number;
}

export interface ActivityItemCreateRef {
  handleCreateActivity: () => Promise<boolean>;
}

const ICON_OPTIONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  "local-shipping",
  "directions-car",
  "ac-unit",
  "adb",
  "agriculture",
];

const RECENT_ICONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  "local-shipping",
  "directions-car",
];

const ActivityItemCreate = forwardRef<ActivityItemCreateRef, ActivityItemCreateProps>(({
  tipo,
  project_id,
  tracking_id,
  date,
}, ref) => {
  const [state, setState] = useState({
    tipoTask: tipo,
    titulo: "",
    description: "",
    location: "",
    horas: "",
    comments: "",
    selectedIcon: "local-shipping" as keyof typeof MaterialIcons.glyphMap,
  });

  const updateState = (updates: Partial<typeof state>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const prepareActivityData = () => {
    return {
      project_id,
      tracking_id,
      name: state.titulo,
      description: state.description,
      location: state.location,
      horas: state.horas,
      status: state.tipoTask.toLowerCase(),
      icon: `fa-${state.selectedIcon}`,
      comments: state.comments,
      date, // Include the selected date
    };
  };

  const handleCreateActivity = async (): Promise<boolean> => {
    // Validation
    if (!state.titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return false;
    }

    const activityData = prepareActivityData();

    try {
      const response = await axios.post(
        'https://centroesteticoedith.com/endpoint/activities/create',
        activityData,
        { 
          headers: { 
            "Content-Type": "application/json",
            'Cookie': 'XSRF-TOKEN=...' // Use the same token as in the parent component
          } 
        }
      );

      Alert.alert("Éxito", "Actividad creada correctamente");
      console.log(response.data);
      resetForm();
      return true;
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert("Error", "No se pudo crear la actividad. Intente nuevamente.");
      return false;
    }
  };

  // Expose handleCreateActivity to parent component via ref
  useImperativeHandle(ref, () => ({
    handleCreateActivity,
  }));

  const resetForm = () => {
    setState({
      tipoTask: tipo,
      titulo: "",
      description: "",
      location: "",
      horas: "",
      comments: "",
      selectedIcon: "local-shipping",
    });
  };

  const finishTask = () => {
    updateState({ tipoTask: 'Completado' });
    handleCreateActivity();
  };

  const getStatusColor = () => {
    switch (state.tipoTask) {
      case "Programado": return "#0a3649";
      case "Pendiente": return "#d1a44c";
      case "Completado": return "#4ec291";
      default: return "#0a3649";
    }
  };

  const renderStatusIcon = () => {
    switch (state.tipoTask) {
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
    <View style={{ backgroundColor: "#0a3649" }}>
      <ExpoStatusBar style="dark" />
      <ScrollView>
        <View>
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
                borderTopColor: state.tipoTask === "Completado" ? "#0a3649" : "#d1a44c",
                borderBottomColor: state.tipoTask === "Completado" ? "#0a3649" : "#d1a44c",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                color: state.tipoTask === "Programado" ? "#d1a44c" : "#0a3649",
              }}
            >
              {state.tipoTask}
            </Text>
          </View>
          
          <View style={{ backgroundColor: "#0a3649", padding: 20 }}>
            <TextInput
              style={{
                fontSize: 35,
                width: "70%",
                color: "white",
                marginBottom: 10,
                textAlignVertical: "top",
              }}
              value={state.titulo}
              onChangeText={(text) => updateState({ titulo: text })}
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
              onPress={finishTask}
            >
              <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
                Finalizar
              </Text>
            </TouchableOpacity>
          </View>
          
          <View>
            {[
              { 
                icon: <Entypo name="text" size={24} color="white" />,
                placeholder: "Descripción",
                value: state.description,
                onChangeText: (text: string) => updateState({ description: text })
              },
              { 
                icon: <MaterialIcons name="location-on" size={24} color="white" />,
                placeholder: "Ubicación",
                value: state.location,
                onChangeText: (text: string) => updateState({ location: text })
              },
              { 
                icon: <MaterialCommunityIcons name="clock-outline" size={24} color="white" />,
                placeholder: "Horario",
                value: state.horas,
                onChangeText: (text: string) => updateState({ horas: text })
              },
              { 
                icon: <MaterialCommunityIcons name="comment-processing" size={24} color="white" />,
                placeholder: "Comentarios (opcional)",
                value: state.comments,
                onChangeText: (text: string) => updateState({ comments: text })
              }
            ].map((inputConfig, index) => (
              <View key={index} style={styles.inputContainer}>
                {inputConfig.icon}
                <TextInput
                  style={styles.input}
                  placeholder={inputConfig.placeholder}
                  placeholderTextColor="#888"
                  value={inputConfig.value}
                  onChangeText={inputConfig.onChangeText}
                />
              </View>
            ))}
          </View>
          
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
                    onPress={() => updateState({ selectedIcon: icon })}
                  >
                    <MaterialIcons
                      name={icon}
                      size={40}
                      color={state.selectedIcon === icon ? "white" : "grey"}
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
                    onPress={() => updateState({ selectedIcon: icon })}
                  >
                    <MaterialIcons
                      name={icon}
                      size={40}
                      color={state.selectedIcon === icon ? "white" : "grey"}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

export default ActivityItemCreate;