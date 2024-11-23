import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Importa el ícono

type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  avatar: string | null;
};

const users: User[] = [
  {
    id: "B6784K6",
    name: "Alfredo Salazar",
    email: "alo.alfredo@gmail.com",
    role: "Admin",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "A4678H4",
    name: "Ana Luisa Veltrac",
    email: "analui.sa@gmail.com",
    role: "Admin",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "K8567L2",
    name: "Jaime Contreras",
    email: "jaimeec@gmail.com",
    role: "User",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "P1267X5",
    name: "Noten Gofofo y texto largo",
    email: "usuariosinfotextolargo@gmail.com",
    role: "User",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "P6357B2",
    name: "Monopoly guy",
    email: "correo@gmail.com",
    role: "User",
    avatar: "https://via.placeholder.com/40",
  },
];

const VistaMiembros: React.FC = () => {
  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>
          {item.email} | {item.id}
        </Text>
      </View>
      {item.role === "Admin" && <Text style={styles.adminBadge}>Admin</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18 }}>Administrar accesos</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />
      <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteText}>Invitar por link</Text>
      </TouchableOpacity>
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
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  list: {
    flex: 1,
    backgroundColor: "#0a3649",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#0a3649",
    borderRadius: 8,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    color: "#b0c4de",
    fontSize: 12,
  },
  adminBadge: {
    backgroundColor: "#05222f",
    color: "white",
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  inviteButton: {
    backgroundColor: "#008CFF",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    
  },
  inviteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VistaMiembros;
