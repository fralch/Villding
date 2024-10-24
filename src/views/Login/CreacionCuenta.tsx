import { useState } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Importa el ícono
import ConfirmModal from "../../components/Alerta/ConfirmationModal";
import LoadingModal from "../../components/Alerta/LoadingModal";
import * as ImagePicker from "expo-image-picker";
const { width, height } = Dimensions.get("window");

function CreacionCuenta(): JSX.Element {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [secureText, setSecureText] = useState(true);
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null); // Estado para la imagen seleccionada
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [claveAgain, setClaveAgain] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState(
    "El usuario se ha registrado correctamente."
  );

  const pickImage = async () => {
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

    // Verificar si el usuario seleccionó una imagen
    if (
      !pickerResult.canceled &&
      pickerResult.assets &&
      pickerResult.assets.length > 0
    ) {
      setProfileImage(pickerResult.assets[0].uri); // Actualizar imagen seleccionada
    }
  };

  const handleCreateAccount = async () => {
    setShowModalLoading(true);

    if (nombres !== "" && apellidos !== "" && email !== "" && clave !== "") {
      if (clave.length < 8) {
        setErrorBoolean(true);
        setMsjeModal("La contraseña debe tener al menos 8 caracteres.");
        setShowModal(true);
        setShowModalLoading(false);
        return;
      }

      if (clave !== claveAgain) {
        setErrorBoolean(true);
        setMsjeModal("Las contraseñas no coinciden.");
        setShowModal(true);
        setShowModalLoading(false);
        return;
      }

      const fetchData = async () => {
        // Crear un nuevo FormData para adjuntar la imagen
        const formData = new FormData();

        // Agregar los campos de texto
        formData.append("name", nombres);
        formData.append("last_name", apellidos);
        formData.append("email", email);
        formData.append("password", clave);
        formData.append("is_paid_user", "0");
        formData.append("role", "user");

        // Si hay una imagen seleccionada, la agregamos al FormData
        if (profileImage) {
          const uriParts = profileImage.split(".");
          const fileType = uriParts[uriParts.length - 1];

          // es importante comprobar en el php y en nginx que puedan subir imagenes grandes 
          formData.append("uri", {
            uri: profileImage,
            name: `profile_image.${fileType}`,
            type: `image/${fileType}`, // Tipo de imagen
          } as any); // Especificar el tipo como 'any' para evitar errores de tipado en TypeScript
        }

        let reqOptions = {
          url: "https://www.centroesteticoedith.com/endpoint/user/create",
          method: "POST",
          data: formData, // Enviar el FormData
          headers: {
            "Content-Type": "multipart/form-data", // Asegurarse de usar el tipo correcto de contenido
          },
        };

        try {
          const response = await axios(reqOptions);
          console.log(response.data);

          setShowModalLoading(false);
          setShowModal(true);
          navigate("Verificacion", {
            id: response.data.user.id,
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            clave: clave,
            rol: "user",
            uri: profileImage,
          });
        } catch (error: any) {
          console.log(error);
          if (error.response) {
            console.log(error.response.data.message);
            setMsjeModal(error.response.data.message);
          } else {
            console.log(error.message);
            setMsjeModal(error.message);
          }
          setErrorBoolean(true);
          setShowModalLoading(false);
          setShowModal(true);
        }
      };

      fetchData();
    } else {
      setErrorBoolean(true);
      setShowModalLoading(false);
      setMsjeModal("Por favor, rellene todos los campos.");
      setShowModal(true);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "#0A3649" }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Creación de tu cuenta</Text>
          <View style={styles.mainCircle}>
            <View style={styles.mainCircle}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("../../assets/images/user.png")
                }
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity style={styles.iconCircle} onPress={pickImage}>
              <MaterialCommunityIcons name="pencil" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{ width: "90%", maxWidth: 300, marginTop: 30 }}>
            <Text
              style={{
                color: "grey",
                fontSize: 15,
                textAlign: "left",
                marginBottom: 10,
              }}
            >
              Nombres
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: "#05222F",
                borderRadius: 5,
                color: "white",
                paddingHorizontal: 10,
                fontSize: 17,
                marginBottom: 10,
              }}
              placeholder="Escribe tus nombres "
              placeholderTextColor="grey"
              autoCapitalize="none"
              value={nombres}
              onChangeText={setNombres}
            />
            {errorBoolean && nombres === "" ? (
              <Text style={{ color: "#ff7979", marginTop: 10 }}>
                Ingresa tus nombres
              </Text>
            ) : null}
            <Text
              style={{
                color: "grey",
                fontSize: 15,
                textAlign: "left",
                marginBottom: 10,
              }}
            >
              Apellidos
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: "#05222F",
                borderRadius: 5,
                color: "white",
                paddingHorizontal: 10,
                fontSize: 17,
              }}
              placeholder="Escribe tus apellidos "
              placeholderTextColor="grey"
              autoCapitalize="none"
              value={apellidos}
              onChangeText={setApellidos}
            />
            {errorBoolean && apellidos === "" ? (
              <Text style={{ color: "#ff7979", marginTop: 10 }}>
                Ingresa tus apellidos
              </Text>
            ) : null}
            <Text
              style={{
                color: "grey",
                fontSize: 15,
                textAlign: "left",
                marginBottom: 10,
              }}
            >
              Correo
            </Text>
            <TextInput
              style={{
                height: 50,
                backgroundColor: "#05222F",
                borderRadius: 5,
                color: "white",
                paddingHorizontal: 10,
                fontSize: 17,
              }}
              placeholder="Escribe tu correo "
              placeholderTextColor="grey"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {errorBoolean && email === "" ? (
              <Text style={{ color: "#ff7979", marginTop: 10 }}>
                Ingresa tu correo
              </Text>
            ) : null}
            <Text
              style={{
                color: "grey",
                fontSize: 15,
                textAlign: "left",
                marginBottom: 10,
              }}
            >
              Contraseña
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  height: 50,
                  backgroundColor: "#05222F",
                  borderRadius: 5,
                  color: "white",
                  paddingHorizontal: 10,
                  fontSize: 17,
                }}
                placeholder="Escribe tu contraseña"
                placeholderTextColor="grey"
                autoCapitalize="none"
                secureTextEntry={secureText}
                value={clave}
                onChangeText={setClave}
              />
              <TouchableOpacity
                onPress={() => setSecureText(!secureText)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={secureText ? "eye-off" : "eye"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            {errorBoolean && clave === "" ? (
              <Text style={{ color: "#ff7979", marginTop: 0 }}>
                Ingresa tu contraseña
              </Text>
            ) : null}
            {clave.length < 8 ? (
              <Text
                style={{ color: "#79ffd0", marginTop: 0, fontStyle: "italic" }}
              >
                Debe tener más de 8 caracteres
              </Text>
            ) : null}
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  height: 50,
                  backgroundColor: "#05222F",
                  borderRadius: 5,
                  color: "white",
                  paddingHorizontal: 10,
                  fontSize: 17,
                  marginTop: 20,
                }}
                placeholder="Repite tu contraseña"
                placeholderTextColor="grey"
                autoCapitalize="none"
                secureTextEntry={secureText}
                value={claveAgain}
                onChangeText={setClaveAgain}
              />
              <TouchableOpacity
                onPress={() => setSecureText(!secureText)}
                style={[styles.eyeIcon, { marginTop: 20 }]}
              >
                <Ionicons
                  name={secureText ? "eye-off" : "eye"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            {/* Validar si las contraseñas no coinciden */}
            {claveAgain !== "" && clave !== claveAgain ? (
              <Text style={{ color: "#ff7979", marginTop: 0 }}>
                Las contraseñas no coinciden
              </Text>
            ) : null}
          </View>
        </View>
        <View style={{ width: "90%", maxWidth: 300, marginTop: 30 }}>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color: "#05222F",
                fontSize: 17,
                textAlign: "center",
                backgroundColor: "#DEDEDE",
                padding: 10,
                borderRadius: 5,
                width: "100%",
              }}
              onPress={() => handleCreateAccount()}
            >
              Crear nueva cuenta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 20 }}>
            <Text
              style={{
                color: "white",
                fontSize: 17,
                textAlign: "center",
                padding: 10,
                borderRadius: 5,
                width: "100%",
                marginBottom: 50,
              }}
              onPress={() => navigate("Login")}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ConfirmModal
        visible={showModal}
        message={msjeModal}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal visible={showModalLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: "white",
    fontSize: 20,
    marginTop: 80,
    marginBottom: 30,
    textAlign: "center",
  },
  circle: {
    width: 80, // El tamaño del círculo
    height: 80,
    borderRadius: 40, // La mitad del tamaño para que sea un círculo
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2, // El borde del círculo
    borderColor: "white",
  },
  image_user: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginTop: 20,
    marginBottom: 20,
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
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
});

export default CreacionCuenta;
