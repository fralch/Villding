import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons"; // Importa el ícono
import MemberModal from "./MemberModal";
import { getSesion, removeSesion , updateSesion } from '../../hooks/localStorageUser';
import axios from "axios";

type User = {
  id: string;
  name: string;
  email: string;
  uri: string | null;
  user_code: string | null;
  is_admin: number;
};

type Project = {
  id: number;
  name: string;
  location: string;
  company: string;
  code: string;
  start_date: string;
  end_date: string;
  uri: string;
};

type ApiResponse = {
  project: Project;
  users: User[];
};

const VistaMiembros: React.FC<any> = (project) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisibleInsertUser, setModalVisibleInsertUser] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [idProject, setIdProject] = useState<any>(
    project?.route?.params?.id_project
  );
  const [users, setUsers] = useState<User[]>([]);
  const [userSelected, setUserSelected] = useState<User | null>(null);
  const [codeUser, setCodeUser] = useState("");
  const [ingresado, setIngresado] = useState();
  const [dataUser, setDataUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    console.log('Obteniendo sesion en vista miembros');
    getSesion().then((StoredSesion : any) => {
      let sesion = JSON.parse(StoredSesion);
      console.log(sesion);
      setDataUser(sesion);
    });
  }, []);

  useEffect(() => {
    const myHeaders = {
      "Content-Type": "application/json",
    };

    const data = {
      project_id: idProject,
    };

    axios
      .post(
        "https://centroesteticoedith.com/endpoint/project/check-attachment",
        data,
        {
          headers: myHeaders,
        }
      )
      .then((response) => {
        const apiResponse: ApiResponse = response.data;
        console.log(apiResponse.users);
        setUsers(apiResponse.users);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [ingresado]);

  useEffect(() => {
    users.filter((user) => {
      console.log("comprobando si es admin");
      console.log(dataUser?.id, user.id);
   ;
      if (user.id == dataUser?.id) {
        if(user.is_admin === 1 || dataUser?.is_admin === 1){
          setIsAdmin(true);
        }
      }
    });
    console.log(`isAdmin: ${isAdmin}`);
  }, []);

  const renderItem = ({ item, index }: { item: User; index: number }) => (
   <View>
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.is_admin) {
          setAdmin(true);
        }
        setUserSelected(item);
        setModalVisible(true);
      }}
    >
      <Image
        source={{
          uri: item.uri
            ? "https://centroesteticoedith.com/endpoint/images/profile/" +
              item.uri
            : "https://cdn-icons-png.flaticon.com/512/9385/9385289.png",
        }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>
          {item.email} | {item.is_admin ? "Admin" : "User"}
        </Text>
      </View>
      {item.is_admin ? <Text style={styles.adminBadge}>Admin</Text> : null}
    </TouchableOpacity>
   </View>
  );

  const handleAddUser = async () => {
    try {
      const userCodeRpt = await axios.post(
        "https://centroesteticoedith.com/endpoint/user/user_code",
        { user_code: codeUser }
      );
      const userId = userCodeRpt.data.id;

      const myHeaders = {
        "Content-Type": "application/json",
      };

      const data = {
        user_id: userId,
        project_id: idProject,
      };

      const response = await axios.post(
        "https://centroesteticoedith.com/endpoint/project/attach",
        data,
        { headers: myHeaders }
      );
      setIngresado(response.data);
      setModalVisibleInsertUser(false); // Close the modal after inserting the user
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18 }}>
          Administrar accesos
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.list}>
        <FlatList
          data={users}
          keyExtractor={(item, index) => `${item.id}-${item.email}-${index}`}
          renderItem={renderItem}
        />

        <TouchableOpacity
          style={[
            styles.inviteButton,
            { marginTop: -20, backgroundColor: "#05222f" },
          ]}
          onPress={() => setModalVisibleInsertUser(true)}
        >
          <MaterialIcons name="save-alt" size={24} color="gray" />
          <Text style={[styles.inviteText, { marginLeft: 10 }]}>
            Ingresar usuario
          </Text>
        </TouchableOpacity>
      </View>
      <MemberModal
        visible={isModalVisible}
        admin={isAdmin}
        user={userSelected}
        project= {idProject}
        onClose={() => setModalVisible(false)}
      />

      <Modal
        visible={isModalVisibleInsertUser}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Insertar usuario</Text>
            <TextInput
              placeholder="Codigo"
              style={styles.modalInput}
              placeholderTextColor="gray"
              value={codeUser}
              onChangeText={setCodeUser}
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "#05222f",
                    borderColor: "#0a3649",
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setModalVisibleInsertUser(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#0a3649" }]}
                onPress={() => handleAddUser()}
              >
                <Text style={styles.buttonText}>Insertar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#05222F",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "white", // Color del texto del título
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 20,
    padding: 10,
    width: "100%",
    borderRadius: 4,
    color: "#05222F", // Color del texto dentro del TextInput
    backgroundColor: "#eee", // Color de fondo del TextInput
    fontSize: 16, // Tamaño del texto dentro del TextInput
  },

  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#33baba",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default VistaMiembros;
