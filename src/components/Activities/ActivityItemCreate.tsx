import React, { useState } from "react";
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

const ActivityItemCreate: React.FC<ActivityItemCreateProps> = ({
  tipo,
  date,
  project_id,
  tracking_id,
  
}) => {
  const recentIcons: Array<keyof typeof MaterialIcons.glyphMap> = [
    "local-shipping",
    "directions-car",
  ];

  const [tipoTask, setTipoTask] = useState(tipo);
  const [titulo, setTitulo] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [horas, setHoras] = useState("");
  const [comments, setComments] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof MaterialIcons.glyphMap>("local-shipping");

  const allIcons: Array<keyof typeof MaterialIcons.glyphMap> = [
    "local-shipping",
    "directions-car",
    "ac-unit",
    "adb",
    "agriculture",
    // Add more icons as needed
  ];

  const handleCreateActivity = async () => {
    if (!titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    const data = {
      project_id,
      tracking_id,
      name: titulo,
      description,
      location,
      horas,
      status: tipoTask.toLowerCase(),
      icon: `fa-${selectedIcon}`,
      comments,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post(
        'https://centroesteticoedith.com/endpoint/activities/create',
        data,
        { headers }
      );

      Alert.alert("Éxito", "Actividad creada correctamente");
      console.log(response.data);
      resetForm();
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert("Error", "No se pudo crear la actividad. Intente nuevamente.");
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescription("");
    setLocation("");
    setHoras("");
    setComments("");
    setSelectedIcon("local-shipping");
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
              {tipoTask === "Programado" ? (
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={20}
                  color="#d1a44c"
                />
              ) : tipoTask === "Pendiente" ? (
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <MaterialIcons name="agriculture" size={24} color="#eee" />
                  <AntDesign name="clockcircle" size={24} color="#d1a44c" />
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <MaterialIcons name="agriculture" size={24} color="#eee" />
                  <MaterialCommunityIcons name="clock-check" size={24} color="#4ec291" />
                </View>
              )}
            </View>
          </Pressable>
          <View
            style={[
              styles.statusProgramado,
              {
                backgroundColor:
                  tipoTask === "Programado"
                    ? "#0a3649"
                    : tipoTask === "Pendiente"
                    ? "#d1a44c"
                    : "#4ec291",
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
              onChangeText={setTitulo}
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
              onPress={()=>{
                setTipoTask('Completado');
                handleCreateActivity();
              }}
            >
              <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
                Finalizar
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.inputContainer}>
              <Entypo name="text" size={24} color="white" />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={24} color="white" />
              <TextInput
                style={styles.input}
                placeholder="Ubicación"
                placeholderTextColor="#888"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="white"
              />
              <TextInput
                style={styles.input}
                placeholder="Horario"
                placeholderTextColor="#888"
                value={horas}
                onChangeText={setHoras}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="comment-processing"
                size={24}
                color="white"
              />
              <TextInput
                style={styles.input}
                placeholder="Comentarios (opcional)"
                placeholderTextColor="#888"
                value={comments}
                onChangeText={setComments}
              />
            </View>
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
                {recentIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedIcon(icon)}
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
                {allIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedIcon(icon)}
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
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Ult edición: Gerardo el 14/05/2024
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ActivityItemCreate;
