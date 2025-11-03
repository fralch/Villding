import { useState, useEffect } from "react";
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
  AppState,
  AppStateStatus,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Importa el ícono
import axios from "axios";
import { API_BASE_URL } from '../../config/api';
import { useRoute } from "@react-navigation/native";
import { storeSesion } from "../../hooks/localStorageUser";

const { width, height } = Dimensions.get("window");

function Password():any {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { email } = route.params as { email: any };

  const [secureText, setSecureText] = useState(true);
  const [clave, setClave] = useState("");
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userID, setUserID] = useState("");



  const handleLogin = () => {
    if (clave !== "") {
  
      const fetchData = async () => {
        const JsonLogin = {
          email: email,
          password: clave,
        };

        let reqOptions = {
          url: `${API_BASE_URL}/user/login`,
          method: "POST",
          data: JsonLogin,
        };
        try {
          const response = await axios(reqOptions);
          console.log("Datos de Usuario");
          console.log(response.data);

          if (response.data.message === "Login successful") {
            const rawUri: string = response?.data?.user?.uri ?? "";

            // Resolver correctamente la URI de la imagen del perfil
            // Casos:
            // - Si ya es una URL completa (http/https), usarla tal cual
            // - Si es una ruta relativa de S3 (profiles/..., projects/..., activities/...), prefix S3
            // - Si es solo un nombre de archivo, usar la ruta del backend /images/profile
            const S3_BASE_URL = "https://villding.s3.us-east-2.amazonaws.com";
            const isFullUrl = rawUri.startsWith("http://") || rawUri.startsWith("https://");
            const isLocalFile = rawUri.startsWith("file://") || rawUri.startsWith("content://");
            const isRelativeS3Path = /^(profiles|projects|activities)\//.test(rawUri);
            const finalUri = !rawUri
              ? ""
              : isFullUrl || isLocalFile
                ? rawUri
                : isRelativeS3Path
                  ? `${S3_BASE_URL}/${rawUri}`
                  : `${API_BASE_URL}/images/profile/${rawUri}`;

            storeSesion({
              id: response.data.user.id,
              nombres: response.data.user.name,
              apellidos: response.data.user.last_name,
              email: response.data.user.email,
              password: "",
              rol: response.data.user.role,
              user_code: response.data.user.user_code,
              telefono: response.data.user.telefono
                ? response.data.user.telefono
                : "",
              uri: finalUri,
              tamano_img: response.data.profile_image_size
            });
            navigation.navigate("HomeProject");

            setErrorBoolean(false);
          } else {
            setErrorBoolean(true);
            setShowModal(true);
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchData();
    } else {
      setErrorBoolean(true);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "#0A3649" }}
    >
      <SafeAreaView style={styles.container}>
        <Image
          style={{
            width: width * 0.35,
            height: width * 0.35,
            resizeMode: "contain",
            marginTop: height * 0.2,
            alignSelf: "center",
            tintColor: "white",
            marginBottom: 0,
          }}
          source={require("../../assets/images/logo-icon_white.png")}
        />
        <Image
          source={require("../../assets/images/logo-text_white.png")}
          style={{ width: width * 0.5, resizeMode: "contain", marginTop: -10 }}
        />
        <View style={{ width: "90%", maxWidth: 300 }}>
          <Text
            style={{
              color: "grey",
              fontSize: 15,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Ingresa tu contraseña
          </Text>
          <View style={{ position: "relative", width: "100%" }}>
            <TextInput
              style={{
                height: 50,
                backgroundColor: "#05222F",
                borderRadius: 5,
                color: "white",
                paddingHorizontal: 10,
                fontSize: 17,
                paddingRight: 40, // Espacio para el ícono
              }}
              placeholder="Escribe tu contraseña"
              placeholderTextColor="grey"
              autoCapitalize="none"
              secureTextEntry={secureText} // Usar el estado
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
          {errorBoolean ? (
            <Text style={{ color: "#ff7979", marginTop: 10 }}>
              Ingresa una contraseña para continuar
            </Text>
          ) : null}
          <TouchableOpacity style={{ marginTop: 20 }} onPress={handleLogin}>
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
            >
              Ingresar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
});

export default Password;
