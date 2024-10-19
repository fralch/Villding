import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather  } from "@expo/vector-icons"; // Para íconos
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const EditUser = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="chevron-back-outline" size={24} color="white" />
        <Image
          source={require("../../assets/images/logo-tex-simple_white.png")}
          style={{ width: 120, height: 40, resizeMode: "contain" }}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/user.png")}
            style={styles.avatar}
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          backgroundColor: "#0a3649",
        }}
      >
        <View style={{ backgroundColor: "#0a3649" }}>
          {/* Profile Image */}
          <View
            style={{
              alignItems: "center",
              marginTop: 20,
              backgroundColor: "#0a3649",
              padding: 10,
              paddingBottom: 20,
              borderBottomWidth: 1, // Esto agrega el borde solo en la parte inferior
              borderBottomColor: "#05222f", // Color del borde
            }}
          >
            <View style={styles.mainCircle}>
              <View style={styles.mainCircle}>
                <Image
                  source={require("../../assets/images/user.png")}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="pencil" size={24} color="black" />
              </View>
            </View>
          </View>
          {/* Personal Information */}
          <View style={styles.section}>
            <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
              <Text style={styles.sectionTitle}>Información personal</Text>
              <TouchableOpacity style={styles.item}>
                <Text style={styles.itemLabel}>Nombre</Text>
                <Text style={styles.itemValue}>Piero</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text style={styles.itemLabel}>Apellido</Text>
                <Text style={styles.itemValue}>Rodríguez</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Email */}
          <View style={styles.section}>
            <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
              <Text style={[styles.sectionTitle, { marginVertical: 10 }]}>Correo de contacto</Text>
              <TouchableOpacity style={[styles.item , {marginVertical: 10 }]}>
                <Text style={styles.itemLabel}>Correo de registro</Text>
                <Text style={styles.itemValue}>icemail@gmail.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addEmailButton, {marginVertical: 10 }]}>
                <Text style={styles.addEmailText}>
                  + Añadir correo de contacto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="power" size={25} color="#fff" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Feather name="trash" size={24} color="red" />
            <Text style={styles.deleteText}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05222F", // Background color of the app
  },

  header: {
    backgroundColor: "#05222F",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#0D465E",
    marginTop: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#666",
    padding: 5,
    borderRadius: 50,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: "#05222F",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  itemLabel: {
    color: "#ccc",
    fontSize: 14,
  },
  itemValue: {
    color: "#fff",
    fontSize: 14,
  },
  addEmailButton: {},
  addEmailText: {
    color: "#34c6eb",
    fontSize: 14,
  },
  footer: {
    padding: 20,
    backgroundColor: "#0a3649",
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 18,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteText: {
    color: "red",
    marginLeft: 10,
    fontSize: 18,
  },
  mainCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFDBAC", // Color de fondo similar al círculo principal
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E5E5E5", // Color de fondo del círculo pequeño
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    top: 0,
  },
});

export default EditUser;
