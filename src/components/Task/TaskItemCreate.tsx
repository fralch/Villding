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
} from "@expo/vector-icons";

const TaskItemCreate: React.FC = (tipo) => {
  return (
    <View style={{ backgroundColor: "#0a3649" }}>
      <ExpoStatusBar style="dark" />
      <ScrollView>
        <View>
          <TouchableOpacity style={styles.uploadBox}>
            <Image
              source={require("../../assets/images/add_img.png")}
              style={{ width: 30, height: 30 }}
            />
            <View style={styles.iconStatus}>
              <MaterialCommunityIcons
                name="progress-clock"
                size={20}
                color="#d1a44c"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.statusProgramado}>
            <Text style={{ fontSize: 14, color: "#d1a44c" }}>Programado</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: "#0a3649", padding: 20 }}>
            <Text
              style={{
                fontSize: 35,
                width: "70%",
                color: "white",
                marginBottom: 10,
              }}
            >
              Compactación sector 05
            </Text>
            <View style={styles.hr} />
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
                backgroundColor: "#dedede",
                borderRadius: 5,
              }}
            >
              <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
                Finalizar
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
});

export default TaskItemCreate;
