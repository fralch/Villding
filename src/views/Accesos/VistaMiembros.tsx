import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"; // Importa el ícono
import MemberModal from './MemberModal';
import axios from "axios";

type User = {
  id: string;
  name: string;
  last_name: string;
  user_code: string;
  telefono: string;
  email: string;
  role:  string;
  uri: string | null;
};



const VistaMiembros: React.FC<any> = (project) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [idProject, setIdProject] = useState<any>(project?.route?.params?.id_project);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const myHeaders = {
      'Content-Type': 'application/json',
    };

    const data = {
      project_id: idProject
    };

    axios.post('https://centroesteticoedith.com/endpoint/project/check-attachment', data, {
      headers: myHeaders
    })
      .then(response => {
        setUsers(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const renderItem = ({ item, index }: { item: User, index: number }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => {
      if (item.role !== "user") {
        setAdmin(true);
      }
      setModalVisible(true);
    }}>
      <Image
        source={{ uri: "https://centroesteticoedith.com/endpoint/images/profile/"+item.uri || "https://via.placeholder.com/40" }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>
          {item.email} | {item.role}
        </Text>
      </View>
      {item.role !== "user" && <Text style={styles.adminBadge}>Admin</Text>}
    </TouchableOpacity>
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
      <View style={styles.list}>
        <FlatList
          data={users}
          keyExtractor={(item, index) => `${item.id}-${item.email}-${index}`}
          renderItem={renderItem}
        />
        <TouchableOpacity style={styles.inviteButton}>
          <MaterialCommunityIcons name="content-copy" size={24} color="gray" />
          <Text style={[styles.inviteText, { marginLeft: 10 }]}>
            Codigo de proyecto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.inviteButton, { marginTop: -20, backgroundColor: "#05222f" }]}>
          <MaterialIcons name="save-alt" size={24} color="gray" />
          <Text style={[styles.inviteText, { marginLeft: 10 }]}>
            Ingresar codigo
          </Text>
        </TouchableOpacity>
      </View>
      <MemberModal visible={isModalVisible} admin={admin} onClose={() => setModalVisible(false)} />
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
    backgroundColor: "#eee",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 30,
    marginHorizontal: 20,
    justifyContent: "center",
    flexDirection: "row",
  },
  inviteText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "bold",
    alignItems: "center",
  },
});

export default VistaMiembros;
