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
import { useRoute } from "@react-navigation/native";
import { storeSesion } from "../../hooks/localStorageUser";
import ConfirmModal from "../../components/Alerta/ConfirmationModal";
import LoadingModal from "../../components/Alerta/LoadingModal";

const { width, height } = Dimensions.get("window");

function Password(): JSX.Element {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { email } = route.params as { email: any };

  const [secureText, setSecureText] = useState(true);
  const [clave, setClave] = useState("");
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState("Login correcto.");
  const [userID, setUserID] = useState("");

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setShowModalLoading(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogin = () => {
    if (clave !== "") {
      setShowModalLoading(true);
      const fetchData = async () => {
        const JsonLogin = {
          email: email,
          password: clave,
        };

        let reqOptions = {
          url: "https://centroesteticoedith.com/endpoint/user/login",
          method: "POST",
          data: JsonLogin,
        };
        try {
          const response = await axios(reqOptions);
          console.log(response.data);

          if (response.data.message === "Login successful") {
            navigation.navigate("Verificacion", {
              id: response.data.user.id,
              nombres: response.data.user.name,
              apellidos: response.data.user.last_name,
              email: response.data.user.email,
              clave: "",
              telefono: response.data.user.telefono
                ? response.data.user.telefono
                : "",
              rol: response.data.user.role,
              user_code : response.data.user_code,
              uri: response.data.user.uri
                ? "https://centroesteticoedith.com/endpoint/images/profile/" +
                  response.data.user.uri
                : "",
            });

            // Generate CODE
              const fetchCode = async () => {
                const JsonCode = {
                  user_id: response.data.user.id,
                };
                let reqOptions = {
                  url: "https://centroesteticoedith.com/endpoint/user/generate-code",
                  method: "POST",
                  data: JsonCode,
                };

                try {
                  const response2 = await axios(reqOptions);
                  console.log(response2.data);

                  // Send Code to whatsapp
                    const fetchCodeWhatsapp = async () => {
                      const JsonCodeWhatsapp = {
                        message:  "Ingresa este código: " + response2.data.code,
                        phone:  response.data.user.telefono
                      };
                      console.log("Ingresa este código: " + response2.data.code);
                      let reqOptions = {
                        url: "https://www.centroesteticoedith.com/whatsapp/api/whatsapp/text",
                        method: "POST",
                        data: JsonCodeWhatsapp,
                      };

                      try {
                        const response3 = await axios(reqOptions);
                        console.log(response3.data);
                      } catch (error) {
                        console.error(error);
                      }
                    };

                    fetchCodeWhatsapp();
                } catch (error) {
                  console.error(error);
                }
              };

              // fetchCode();

            setErrorBoolean(false);
            setShowModalLoading(false);
          } else {
            setMsjeModal("Contraseña incorrecta.");
            setErrorBoolean(true);
            setShowModalLoading(false);
            setShowModal(true);
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchData();
    } else {
      setErrorBoolean(true);
      setShowModalLoading(false);
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
