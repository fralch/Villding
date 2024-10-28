import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput, 
  Modal, 
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  Entypo,
  AntDesign,
} from "@expo/vector-icons"; // Para íconos
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getSesion, removeSesion , updateSesion } from '../../hooks/localStorageUser';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import ConfirmModal from '../../components/Alerta/ConfirmationModal';
import LoadingModal from '../../components/Alerta/LoadingModal';

const EditUser = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [editBool, setEditBool] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState('');
  const [modalEdit, setModalEdit] = useState(false);
  const [modalData, setModalData] = useState({
    titulo: "",
    texto: "",
  });
  const [Data, setData] = useState({
    id: "1",
    nombres: "Piero",
    apellidos: "Rodriguez",
    email: "icemail@gmail.com",
    telefono: "123456789",
    uri: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  

  React.useEffect(() => {
    getSesion().then((StoredSesion : any) => {
      let sesion = JSON.parse(StoredSesion);
      console.log(sesion);
      setProfileImage(sesion.uri);
      setData(sesion);
        
    });
  }, [ editBool === false]);


   
  const logout = () => {
    removeSesion().then(() => {
      navigation.navigate('Login');
    })
  }


  const OpenEdit = (titulo: string, texto: string) => {
    setEditBool(true);
    setModalEdit(true);
    setModalData({ titulo, texto });
  };

  const handleSave = () => {
    // Actualiza los datos dependiendo de cuál campo se está editando
    if (modalData.titulo === "Nombre") {
      setData({ ...Data, nombres: modalData.texto });
    } else if (modalData.titulo === "Apellido") {
      setData({ ...Data, apellidos: modalData.texto });
    } else if (modalData.titulo === "Correo de registro") {
      setData({ ...Data, email: modalData.texto });
    }else if (modalData.titulo === "Teléfono") {
      setData({ ...Data, telefono: modalData.texto });
    }
    setModalEdit(false); // Cierra el modal después de guardar
  };

  const pickImage = async () => {
    setEditBool(true);
    // Solicitar permisos para acceder a la galería
    let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permiso para acceder a las fotos es necesario.");
      return;
    }

    // Abrir selector de imágenes
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // Verificar si el usuario seleccionó una imagen o canceló la acción
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setProfileImage(pickerResult.assets[0].uri); // Actualizar imagen seleccionada
      setData({ ...Data, uri: pickerResult.assets[0].uri });
    }
  };

  const handleEditAcount = () => { 
    setShowModalLoading(true);
    const fetchData = async () => {
      // Crear un nuevo FormData para adjuntar la imagen
      const formData = new FormData();

      // Agregar los campos de texto
      formData.append('id', Data.id);
      formData.append('name', Data.nombres);
      formData.append('last_name', Data.apellidos);
      if (Data.telefono) formData.append('telefono', Data.telefono);   
      formData.append('email', Data.email);

      // Si hay una imagen seleccionada, la agregamos al FormData
      if (profileImage) {
        const uriParts = profileImage.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('uri', {
          uri: profileImage,
          name: `profile_image.${fileType}`,
          type: `image/${fileType}`, // Tipo de imagen
        } as any); // Especificar el tipo como 'any' para evitar errores de tipado en TypeScript
      }

      let reqOptions = {
        url: "https://www.centroesteticoedith.com/endpoint/user/update",
        method: "POST",
        data: formData, // Enviar el FormData
        headers: {
          'Content-Type': 'multipart/form-data', // Asegurarse de usar el tipo correcto de contenido
        },
      };

      try {
        console.log(Data); 
        await axios(reqOptions);
        await updateSesion(Data);
        setEditBool(false);
        setShowModalLoading(false);
        setMsjeModal("Se ha actualizado el perfil con exito") ;
        setShowModalConfirm (true);

      } catch (error: any) {
        if (error.response) {
          console.log(error.response.data.message);
          setEditBool(false);
          setShowModalLoading(false);
          setMsjeModal(error.response.data.message);
          setShowModalConfirm (true);

        } else {
          console.log(error.message);
        }
      }
    };

    fetchData();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Image
          source={require("../../assets/images/logo-tex-simple_white.png")}
          style={{ width: 120, height: 40, resizeMode: "contain" }}
        />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={profileImage ? { uri: profileImage } : require("../../assets/images/user.png")}
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
                  source={profileImage ? { uri: profileImage } : require("../../assets/images/user.png")} // Usar la imagen seleccionada o la predeterminada
                  style={styles.profileImage}
                />
              </View>
              <TouchableOpacity style={styles.iconCircle} onPress={pickImage}>
                <MaterialCommunityIcons name="pencil" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Personal Information */}
          <View style={styles.section}>
            <View style={{ marginHorizontal: 20, marginVertical: 15 }}>
            <Text style={[styles.sectionTitle, { marginVertical: 15 }]}>Información personal</Text>
              <TouchableOpacity style={styles.item} onPress={() => { OpenEdit("Nombre", Data.nombres)}}>
                <Text style={styles.itemLabel}>Nombre</Text>
                <Text style={styles.itemValue}>{Data.nombres}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item} onPress={() => { OpenEdit("Apellido", Data.apellidos)}}>
                <Text style={styles.itemLabel}>Apellido</Text>
                <Text style={styles.itemValue}>{Data.apellidos}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Email */}
          <View style={styles.section}>
            <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
              <Text style={[styles.sectionTitle, { marginVertical: 10 }]}>
                Correo de contacto
              </Text>
              <TouchableOpacity style={[styles.item, { marginVertical: 10 }]}  onPress={() => { OpenEdit("Correo de registro", Data.email)}}>
                <Text style={styles.itemLabel}>Correo de registro</Text>
                <Text style={styles.itemValue}>{Data.email}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.item, { marginVertical: 10}]}  onPress={() => { OpenEdit("Teléfono", Data.telefono)}}>
                <Text style={[styles.itemLabel, {color: "#34c6eb"}]}>Celular</Text>
                <Text style={[styles.itemValue, {color: "#34c6eb"}]}>{Data.telefono}</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          {editBool ? (
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                style={[styles.logoutButton, { marginBottom: 0 }]}
                onPress={handleEditAcount}
              >
                <Entypo name="save" size={24} color="white" />
                <Text style={styles.logoutText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { marginTop: 0, marginLeft: 10 }]}
                onPress={() => setEditBool(false)}
              >
                <AntDesign name="close" size={24} color="#c92a42" />
                <Text
                  style={[
                    styles.deleteText,
                    {
                      marginLeft: 0,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      color: "#c92a42",
                    },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="power" size={25} color="#fff" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={logout}>
                <Feather name="trash" size={24} color="#c92a42" />
                <Text style={styles.deleteText}>Eliminar cuenta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={modalEdit}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEdit(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalData.titulo}</Text>
            <TextInput
              style={styles.modalInput}
              value={modalData.texto}
              onChangeText={(text: string) =>
                setModalData({ ...modalData, texto: text })
              }
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", gap: 30 }}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#05222F" }]}
                onPress={() => {
                  setModalEdit(false);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ConfirmModal visible={showModalConfirm} message={msjeModal} onClose={() => setShowModalConfirm(false)} />
      <LoadingModal visible={showModalLoading} />
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
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
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
    color: "#c92a42",
    marginLeft: 10,
    fontSize: 18,
  },
  mainCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0D465E", // Color de fondo similar al círculo principal
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
  //----------------------
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#0A3649',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#33baba',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalInput: {
    backgroundColor: '#05222F',
    width: '80%',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
  }
});

export default EditUser;
