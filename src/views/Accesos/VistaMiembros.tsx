import React, {useState} from "react";
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
    avatar: "https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=2444",
  },
  {
    id: "A4678H4",
    name: "Ana Luisa Veltrac",
    email: "analui.sa@gmail.com",
    role: "Admin",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6BAHlIuDPK6lkExHi1DWN6cdzB2OJkmSSMNxEhQXpLnHQ3fslHw7AqUJsZEDvu85xhWw&usqp=CAU",
  },
  {
    id: "K8567L2",
    name: "Jaime Contreras",
    email: "jaimeec@gmail.com",
    role: "User",
    avatar: "https://images.squarespace-cdn.com/content/v1/58f2f33603596e9d44cde2c7/1719583455788-G5VBFIW35ALMXY0JP0K7/1671741176329.jpeg?format=1000w",
  },
  {
    id: "P1267X5",
    name: "Noten Gofofo y texto largo",
    email: "usuariosinfotextolargo@gmail.com",
    role: "User",
    avatar: "https://www.startplatz.de/wp-content/uploads/2014/02/sebastian-b%C3%BCttner1-e1415696229562-300x300.jpg",
  },
  {
    id: "P6357B2",
    name: "Monopoly guy",
    email: "correo@gmail.com",
    role: "User",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNlwuBstycsyHcMyatzBQeFRphcEpFhLuRkkB87S_DXjuRjhXmoefv-MNuH4BsBY6_9TM&usqp=CAU",
  },
];

const VistaMiembros: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);


  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => setModalVisible(true)}> 
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
      <View  style={styles.list}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
       
      />
      <TouchableOpacity style={styles.inviteButton}>
          <MaterialCommunityIcons name="content-copy" size={24} color="gray" />
        <Text style={[styles.inviteText, { marginLeft: 10 }]}>
          Codigo de proyecto 
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.inviteButton, { marginTop: -20 , backgroundColor: "#05222f"}]}>
        <MaterialIcons name="save-alt" size={24} color="gray" />
        <Text style={[styles.inviteText, { marginLeft: 10 }]}>
           Ingresar codigo 
        </Text>
      </TouchableOpacity>
      </View>

        
        <MemberModal visible={isModalVisible} onClose={() => setModalVisible(false)} />
   
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
