import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  PanResponder,
  TextInput,
  Image,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  MaterialCommunityIcons,
  Entypo,
  MaterialIcons,
  AntDesign, 
} from "@expo/vector-icons";

interface ActivityItemCreateProps {
  tipo: string;
}

const ActivityItemCreate: React.FC<ActivityItemCreateProps> = ({ tipo }) => {
  const recentIcons: Array<keyof typeof MaterialIcons.glyphMap> = [
    "local-shipping",
    "directions-car",
  ];

  const [tipoTask, setTipoTask] = useState(tipo);
  const [titulo, setTitulo] = useState(""); // Estado para el título

  // Arreglo de íconos para "Todos los íconos"
  const allIcons: Array<keyof typeof MaterialIcons.glyphMap> = [
    "local-shipping",
    "directions-car",
    "ac-unit",
    "adb",
    "agriculture",
    "local-shipping",
    "directions-car",
    "ac-unit",
    "adb",
    "agriculture",
    "local-shipping",
    "directions-car",
    "ac-unit",
    "adb",
    "agriculture",
    "local-shipping",
    "directions-car",
    "ac-unit",
    "adb",
    "agriculture",
  ];

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
              />): tipoTask === "Pendiente" ? (
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <MaterialIcons name="agriculture" size={24} color="#eee" />
                  <AntDesign name="clockcircle" size={24} color="#d1a44c" />
                </View>
              ):(
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <MaterialIcons name="agriculture" size={24} color="#eee" />
                  <MaterialCommunityIcons name="clock-check" size={24} color="#4ec291" />
                </View>
              )
            }
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
                borderBottomColor:  tipoTask === "Completado" ? "#0a3649" : "#d1a44c",  
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
              textAlignVertical: "top", // Alinea el texto en la parte superior
            }}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ingrese el título"
            placeholderTextColor="#888"
            multiline={true} // Permite múltiples líneas
            numberOfLines={4} // Número inicial de líneas visibles (opcional)
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
            onPress={() => {
              // Aquí puedes agregar la lógica para finalizar
              console.log("Título ingresado:", titulo);
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
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={24} color="white" />
              <TextInput
                style={styles.input}
                placeholder="Ubicación"
                placeholderTextColor="#888"
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
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1, // Línea de borde abajo
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
                  <MaterialIcons
                    key={index}
                    name={icon}
                    size={40}
                    color="grey"
                    style={styles.icon}
                  />
                ))}
              </View>
            </View>

            {/* Sección de Todos los íconos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Todos los íconos</Text>
              <View style={styles.iconRow}>
                {allIcons.map((icon, index) => (
                  <MaterialIcons
                    key={index}
                    name={icon}
                    size={40}
                    color="grey"
                    style={styles.icon}
                  />
                ))}
              </View>
            </View>

            {/* Sección de Pie de página */}
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

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "#05222f",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    color: "#dedede",
    borderTopWidth: 1, // Línea de borde arriba
    borderBottomWidth: 1, // Línea de borde abajo
    borderTopColor: "#0a3649", // Color del borde superior
    borderBottomColor: "#0a3649", // Color del borde inferior
    borderLeftWidth: 0, // Sin borde en los costados
    borderRightWidth: 0, // Sin borde en los costados
    fontSize: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadBox: {
    backgroundColor: "#0a455e",
    height: 200,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statusProgramado: {
    alignItems: "center",
    borderTopWidth: 1, // Línea de borde arriba
    borderBottomWidth: 1, // Línea de borde abajo
    borderTopColor: "#d1a44c", // Color del borde superior
    borderBottomColor: "#d1a44c", // Color del borde inferior
    borderLeftWidth: 0, // Sin borde en los costados
    borderRightWidth: 0, // Sin borde en los costados
    padding: 5,
  },
  iconStatus: {
    backgroundColor: "#0a3649",
    color: "#d1a44c",
    position: "absolute",
    zIndex: 1,
    bottom: 10,
    left: 0,
    padding: 10,
    borderRadius: 5,
  },
  hr: {
    borderBottomColor: "#ccc", // Color de la línea
    borderBottomWidth: 1, // Grosor de la línea
    marginVertical: 10, // Espaciado arriba y abajo de la línea
  },
  input: {
    flex: 1,
    color: "#fff", // Color del texto
    fontSize: 16,
    marginLeft: 10,
  },

  // -----
  section: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 10,
    gap: 10,
  },
  icon: {
    marginVertical: 10,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  footerText: {
    color: "#ccc",
    fontSize: 12,
    textAlign: "center",
  },
});

export default ActivityItemCreate;
