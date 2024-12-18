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
  ActivityIndicator, // Indicador de carga
} from "react-native";
import { storeSesion } from "../../hooks/localStorageUser";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const { width, height } = Dimensions.get("window");

interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
  user_code: string;
  telefono?: string;
  uri?: string;
  tamano_img : number;
}

function Verificacion(props: any): JSX.Element {
  const navigation = useNavigation<NavigationProp<any>>();
  const [propsUser, setPropsUser] = useState(props.route.params as User);
  const [codigo, setCodigo] = useState("");
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [loading, setLoading] = useState(false); // Estado de carga
  const [porcentajeDescarga, setPorcentajeDescarga] = useState(0);

  useEffect(() => {
    console.log(propsUser);
  }, []);

  const handleVerificacion = async () => {
    if (codigo === "") {
      setErrorBoolean(true); // Mostrar error si el código está vacío
      return;
    }

    setLoading(true); // Iniciar el estado de carga

    try {
      const JsonCodeWhatsapp = {
        user_id: propsUser.id,
        code: codigo,
      };

      // let reqOptions = {
      //   url: "https://centroesteticoedith.com/endpoint/user/verify-code",
      //   method: "POST",
      //   data: JsonCodeWhatsapp,
      // };

      // const response = await axios(reqOptions);

      // if (response.status === 200) { // Suponiendo que 200 es éxito
      if (true) { // Suponiendo que 200 es éxito
        const imageUri = propsUser.uri ?? "";
        let localUri = "";

        if (imageUri && (imageUri.startsWith("http://") || imageUri.startsWith("https://"))) {
          const fileName = imageUri.split("/").pop();
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          const downloadResumable = FileSystem.createDownloadResumable(
            imageUri,
            fileUri,
            {},
            (downloadProgress) => {
              const progress =
                downloadProgress.totalBytesWritten / propsUser.tamano_img;
              setPorcentajeDescarga(progress);
              console.log(`Download progress: ${progress * 100}%`);
            }
          );

          const downloadResult = await downloadResumable.downloadAsync();
          if (downloadResult && downloadResult.uri) {
            localUri = downloadResult.uri;
          }
        } else if (imageUri.startsWith("file://")) {
          localUri = imageUri;
        }

        // Guardar sesión y navegar
        storeSesion({
          id: propsUser.id,
          nombres: propsUser.nombres,
          apellidos: propsUser.apellidos,
          email: propsUser.email,
          password: propsUser.password,
          rol:    propsUser.rol,
          user_code: propsUser.user_code,
          telefono: propsUser.telefono ?? "",
          uri: localUri,
        });

        setErrorBoolean(false);
        navigation.navigate("HomeProject");
      } else {
        setErrorBoolean(true); // Mostrar error si la verificación falla
      }
    } catch (error) {
      console.log("Error en la verificación:", error);
      setErrorBoolean(true); // Mostrar error en caso de excepción
    } finally {
      setLoading(false); // Finalizar el estado de carga
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
            Ingresa tu código
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
            placeholder="Ingresa código"
            placeholderTextColor="grey"
            autoCapitalize="none"
            value={codigo}
            onChangeText={setCodigo}
          />
          {errorBoolean ? (
            <Text style={{ color: "#ff7979", marginTop: 10 }}>
              Ingresa el código para continuar
            </Text>
          ) : null}
          <Text style={{ color: "grey", marginTop: 10 }}>
            Te enviamos el codigo a tu whatsapp.
          </Text>

          <TouchableOpacity style={{ marginTop: 20 }}>
            {loading ? ( // Mostrar indicador de carga
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>
                  Descargando datos: {(porcentajeDescarga * 100).toFixed(2)}%
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${porcentajeDescarga * 100}%` }]} />
                </View>
              </View>
            ) : (
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
                onPress={() => handleVerificacion()}
              >
                Verificar
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => navigation.navigate("Login")}
        >
          <Text
            style={{
              color: "#ddd",
              fontSize: 17,
              textAlign: "center",
              padding: 10,
              borderRadius: 5,
              width: "100%",
            }}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },
  progressBarContainer: {
    width: "70%",
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#05222F",
  },
});

export default Verificacion;
