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
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Importa el ícono
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import ConfirmModal from "../../components/Alerta/ConfirmationModal";
import LoadingModal from "../../components/Alerta/LoadingModal";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
const { width, height } = Dimensions.get("window");


const MAX_FILE_SIZE = 500 * 1024; // 500 KB en bytes

function CreacionCuenta()  {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [secureText, setSecureText] = useState(true);
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null); // Estado para la imagen seleccionada
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [genero, setGenero] = useState("");
  const [nacimiento, setNacimiento] = useState("");
  const [edad, setEdad] = useState(0);
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [claveAgain, setClaveAgain] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState(
    "El usuario se ha registrado correctamente."
  );

  const pickImage = async () => {
    console.log("📸 INICIO - pickImage ejecutándose");
    
    try {
      // Solicitar permisos para acceder a la galería
      console.log("🔐 PERMISOS - Solicitando permisos de galería");
      let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("- Permisos concedidos:", result.granted);
      
      if (result.granted === false) {
        console.log("❌ PERMISOS DENEGADOS - Usuario no concedió permisos");
        alert("Permiso para acceder a las fotos es necesario.");
        return;
      }
    
      // Abrir selector de imágenes
      console.log("🖼️ SELECTOR - Abriendo selector de imágenes");
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
      });
      console.log("- Resultado del picker:", {
        canceled: pickerResult.canceled,
        assetsLength: pickerResult.assets ? pickerResult.assets.length : 0
      });
    
      // Verificar si el usuario seleccionó una imagen
      if (
        !pickerResult.canceled &&
        pickerResult.assets &&
        pickerResult.assets.length > 0
      ) {
        const selectedImage = pickerResult.assets[0].uri;
        console.log("✅ IMAGEN SELECCIONADA:", selectedImage);

        let compressLevel = 0.8; // Comenzamos con 80% de compresión
        let resizedWidth = 800; // Ancho inicial para redimensionar
        console.log("🔧 CONFIGURACIÓN INICIAL - Compresión:", compressLevel, "Ancho:", resizedWidth);

        // Manipulamos la imagen inicialmente
        console.log("⚙️ MANIPULANDO IMAGEN - Redimensionando y comprimiendo");
        let manipulatedImage = await ImageManipulator.manipulateAsync(
          selectedImage,
          [{ resize: { width: resizedWidth } }], // Redimensionamos
          { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG } // Comprimimos
        );
        console.log("- Imagen manipulada URI:", manipulatedImage.uri);

        // Obtener información del archivo manipulado
        console.log("📊 OBTENIENDO INFO - Verificando tamaño del archivo");
        let fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri) as any;
        console.log("- Info del archivo:", {
          exists: fileInfo.exists,
          size: fileInfo.size,
          sizeKB: fileInfo.size ? (fileInfo.size / 1024).toFixed(2) + " KB" : "N/A"
        });

        // Verificar si el archivo existe y tiene tamaño válido
        if (fileInfo.exists) {
          console.log(`📏 TAMAÑO INICIAL: ${(fileInfo.size / 1024).toFixed(2)} KB (Límite: ${(MAX_FILE_SIZE / 1024).toFixed(2)} KB)`);

          // Reducir el tamaño iterativamente si supera los 500 KB
          let iterations = 0;
          while (fileInfo.size > MAX_FILE_SIZE && compressLevel > 0.1) {
            iterations++;
            compressLevel -= 0.1; // Reducir el nivel de compresión
            resizedWidth -= 100; // Reducir el ancho de la imagen
            console.log(`🔄 ITERACIÓN ${iterations} - Nueva compresión: ${compressLevel.toFixed(1)}, Nuevo ancho: ${resizedWidth}`);

            manipulatedImage = await ImageManipulator.manipulateAsync(
              selectedImage,
              [{ resize: { width: resizedWidth } }], // Redimensionar
              { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG } // Comprimir
            );
            fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
            console.log(`- Nuevo tamaño: ${(fileInfo.size / 1024).toFixed(2)} KB`);
          }

          if (fileInfo.size <= MAX_FILE_SIZE) {
            console.log(`✅ IMAGEN OPTIMIZADA: ${(fileInfo.size / 1024).toFixed(2)} KB - Dentro del límite`);
            // Actualizar la imagen reducida
            setProfileImage(manipulatedImage.uri);
            console.log("📱 ESTADO ACTUALIZADO - profileImage establecido");
          } else {
            console.log("❌ ERROR TAMAÑO - No se pudo reducir la imagen a menos de 500 KB");
            console.log(`- Tamaño final: ${(fileInfo.size / 1024).toFixed(2)} KB`);
            alert("La imagen seleccionada es demasiado grande incluso después de ser comprimida.");
          }
        } else {
          console.error("❌ ERROR ARCHIVO - No se pudo obtener el tamaño de la imagen o el archivo no existe");
          console.error("- fileInfo:", fileInfo);
          alert("Hubo un error al procesar la imagen.");
        }
      } else {
        console.log("❌ CANCELADO - Usuario canceló la selección de imagen");
      }
    } catch (error: any) {
      console.error("❌ ERROR CRÍTICO en pickImage:", error);
      console.error("- Tipo de error:", typeof error);
      console.error("- Mensaje:", error.message || "Sin mensaje");
      alert("Ocurrió un error inesperado al seleccionar la imagen.");
    } finally {
      console.log("🏁 FIN - pickImage terminado");
    }
  };

  const handleCreateAccount = async () => {
    console.log("🚀 INICIO - handleCreateAccount ejecutándose");
    console.log("📋 DATOS RECIBIDOS:", {
      nombres,
      apellidos,
      email,
      celular,
      genero,
      nacimiento,
      edad,
      claveLength: clave.length,
      profileImageExists: !!profileImage
    });

    // setShowModalLoading(true);

    if (nombres !== "" && apellidos !== "" && email !== "" && clave !== "") {
      console.log("✅ VALIDACIÓN - Campos básicos completados");
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
        console.log("🌐 INICIO - fetchData ejecutándose");
        
        try {
          // Crear un nuevo FormData para adjuntar la imagen
          const formData = new FormData();

          // Agregar los campos de texto
          formData.append("name", nombres);
          formData.append("last_name", apellidos);
          formData.append("email", email);
          formData.append("telefono", celular);
          formData.append("genero", genero);
          formData.append("edad", edad.toString());
          formData.append("password", clave);
          formData.append("is_paid_user", "0");
          formData.append("role", "user");

          console.log("📦 FORMDATA CREADO - Campos agregados:");
          console.log("- name:", nombres);
          console.log("- last_name:", apellidos);
          console.log("- email:", email);
          console.log("- telefono:", celular);
          console.log("- genero:", genero);
          console.log("- edad:", edad.toString());
          console.log("- password: [OCULTA]");
          console.log("- is_paid_user: 0");
          console.log("- role: user");

          // Si hay una imagen seleccionada, la agregamos al FormData
          if (profileImage) {
            console.log("🖼️ IMAGEN DETECTADA - Procesando imagen de perfil");
            const uriParts = profileImage.split(".");
            const fileType = uriParts[uriParts.length - 1];
            console.log("- URI de imagen:", profileImage);
            console.log("- Tipo de archivo:", fileType);

            // es importante comprobar en el php y en nginx que puedan subir imagenes grandes
            formData.append("uri", {
              uri: profileImage,
              name: `profile_image.${fileType}`,
              type: `image/${fileType}`, // Tipo de imagen
            } as any); // Especificar el tipo como 'any' para evitar errores de tipado en TypeScript
            
            console.log("✅ Imagen agregada al FormData");
          } else {
            console.log("⚠️ NO HAY IMAGEN - Continuando sin imagen de perfil");
          }

          console.log("🚀 ENVIANDO PETICIÓN - Configuración de axios:");
          let reqOptions = {
            url: "https://villding.lat/endpoint/user/create",
            method: "POST",
            data: formData, // Enviar el FormData
            headers: {
              "Content-Type": "multipart/form-data", // Asegurarse de usar el tipo correcto de contenido
            },
          };
          console.log("- URL:", reqOptions.url);
          console.log("- Método:", reqOptions.method);
          console.log("- Headers:", reqOptions.headers);

          const response = await axios(reqOptions);
          console.log("✅ RESPUESTA EXITOSA - Usuario creado:");
          console.log("- Status:", response.status);
          console.log("- Data completa:", response.data);
          
          if (response.data && response.data.user && response.data.user.id) {
            console.log("- ID de usuario creado:", response.data.user.id);
          } else {
            console.log("⚠️ ADVERTENCIA - Respuesta no contiene user.id esperado");
          }
          // Generate CODE
          const fetchCode = async () => {
            console.log("🔢 GENERANDO CÓDIGO - Iniciando fetchCode");
            const JsonCode = {
              user_id: response.data.user.id,
            };
            console.log("- User ID para código:", JsonCode.user_id);
            
            let reqOptions2 = {
              url: "https://villding.lat/endpoint/user/generate-code",
              method: "POST",
              data: JsonCode,
            };
            console.log("- URL generación código:", reqOptions2.url);
  
            try {
              const response2 = await axios(reqOptions2);
              console.log("✅ CÓDIGO GENERADO - Respuesta:");
              console.log("- Status:", response2.status);
              console.log("- Data completa:", response2.data);
              
              if (response2.data && response2.data.code) {
                console.log("- Código generado:", response2.data.code);
              } else {
                console.log("⚠️ ADVERTENCIA - Respuesta no contiene código esperado");
              }
                
              // Send Code to whatsapp
              const fetchCodeWhatsapp = async () => {
                console.log("📱 ENVIANDO WHATSAPP - Iniciando envío");
                const JsonCodeWhatsapp = {
                  message:  "Ingresa este código: " + response2.data.code,
                  phone:  celular
                };
                console.log("- Mensaje:", JsonCodeWhatsapp.message);
                console.log("- Teléfono:", JsonCodeWhatsapp.phone);
                
                let reqOptions3 = {
                  url: "https://villding.lat:3000/api/whatsapp/text",
                  method: "POST",
                  data: JsonCodeWhatsapp,
                };
                console.log("- URL WhatsApp:", reqOptions3.url);
        
                try {
                  const response3 = await axios(reqOptions3);
                  console.log("✅ WHATSAPP ENVIADO - Respuesta:");
                  console.log("- Status:", response3.status);
                  console.log("- Data:", response3.data);
                } catch (error: any) {
                  console.error("❌ ERROR WHATSAPP:", error);
                  if (error.response) {
                    console.error("- Status:", error.response.status);
                    console.error("- Data:", error.response.data);
                  }
                }
              };
        
              fetchCodeWhatsapp();
            } catch (error: any) {
              console.error("❌ ERROR GENERACIÓN CÓDIGO:", error);
              if (error.response) {
                console.error("- Status:", error.response.status);
                console.error("- Data:", error.response.data);
              }
            }
          };
  
          //fetchCode();
          // ----------------

          console.log("🎯 FINALIZANDO PROCESO - Configurando navegación");
          setShowModalLoading(false);
          setShowModal(true);
          
          console.log("📍 NAVEGANDO A VERIFICACIÓN - Datos enviados:");
          console.log("- ID:", response.data.user.id);
          console.log("- Nombres:", nombres);
          console.log("- Apellidos:", apellidos);
          console.log("- Email:", email);
          console.log("- Rol: user");
          console.log("- Teléfono:", celular ? celular : "");
          console.log("- URI imagen:", profileImage);
          console.log("- User code:", response.data.user.user_code);
          
          navigate("Verificacion", {
            id: response.data.user.id,
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            clave: clave,
            rol: "user",
            telefono: celular ? celular : "",
            uri: profileImage,
            user_code: response.data.user.user_code,
          });
        } catch (error: any) {
          console.error("❌ ERROR PRINCIPAL EN FETCHDATA:", error);
          
          if (error.response) {
            console.error("- Error con respuesta del servidor:");
            console.error("  - Status:", error.response.status);
            console.error("  - Data:", error.response.data);
            console.error("  - Message:", error.response.data.message);
            setMsjeModal(error.response.data.message);
          } else if (error.request) {
            console.error("- Error de red/conexión:");
            console.error("  - Request:", error.request);
            console.error("  - Message:", error.message);
            setMsjeModal("Error de conexión: " + error.message);
          } else {
            console.error("- Error desconocido:");
            console.error("  - Message:", error.message);
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

  const showDataTimePicker = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          const formattedDate = new Date(date).toLocaleDateString("es-ES");
          setNacimiento(formattedDate);

          // Calcular la edad
          const birthYear = new Date(date).getFullYear();
          const currentYear = new Date().getFullYear();
          const calculatedAge = currentYear - birthYear;
          setEdad(calculatedAge);
        }
      },
      mode: "date",
      is24Hour: true,
    });
  };

  return (
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
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#0A3649",  alignItems: "center" }}
      >
        <View style={{ width: "100%", maxWidth: 300, marginTop: 30 }}>
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
              marginBottom: 10,
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
            Fecha de nacimiento
          </Text>
          <TouchableOpacity
            onPress={showDataTimePicker}
            style={{
              height: 50,
              backgroundColor: "#05222F",
              borderRadius: 5,
              paddingHorizontal: 10,
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{ color: nacimiento ? "white" : "grey", fontSize: 17 }}
            >
              {nacimiento || "Fecha de nacimiento"}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              color: "grey",
              fontSize: 15,
              textAlign: "left",
              marginBottom: 10,
            }}
          >
            Genero
          </Text>
          <RNPickerSelect
            onValueChange={(value) => setGenero(value)}
            items={[
              { label: 'Masculino', value: 'masculino' },
              { label: 'Femenino', value: 'femenino' },
              { label: 'Otro', value: 'otro' },
            ]}
            style={{
              inputIOS: styles.inputSelect,
              inputAndroid: styles.inputSelect,
            }}
            placeholder={{
              label: 'Selecciona tu género...',
              value: null,
              color: 'grey',
            }}
            value={genero}
          />
          <Text
            style={{
              color: "grey",
              fontSize: 15,
              textAlign: "left",
              marginBottom: 10,
            }}
          >
            Celular
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
            placeholder="Escribe tu celular "
            placeholderTextColor="grey"
            autoCapitalize="none"
            keyboardType="phone-pad"
            value={celular}
            onChangeText={setCelular}
          />
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
              marginBottom: 10,
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
      </ScrollView>

      <ConfirmModal
        visible={showModal}
        message={msjeModal}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal visible={showModalLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A3649",
  },
  header: {
    alignItems: "center",
    width: "100%",
    backgroundColor: "#0A3649",
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    marginTop: 20,
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
  //
  inputSelect: {
    height: 50,
    backgroundColor: "#05222F",
    borderRadius: 5,
    color: "white",
    paddingHorizontal: 10,
    fontSize: 17,
  },
});

export default CreacionCuenta;
