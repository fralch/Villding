import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import { getInfoAsync } from 'expo-file-system/legacy';
import axios from 'axios';
import { saveProject, deleteProject } from "../../hooks/localStorageProject";
import { getSesion, removeSesion , updateSesion } from '../../hooks/localStorageUser';
import { useRoute, RouteProp } from "@react-navigation/native";
import { styles } from "./styles/NewProject";

import ConfirmModal from '../../components/Alerta/ConfirmationModal';
import LoadingModal from '../../components/Alerta/LoadingModal';
const MAX_FILE_SIZE = 500 * 1024; // 500 KB en bytes

interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  start_date: string;
  end_date: string;
  week: number;
  week_current: number;
}
type RouteParams = {
  params: {
    project?: Project;
  };
};

const NewProject: React.FC = () => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "params">>();
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState('');

  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString("es-ES"));
  const [duration, setDuration] = useState("6");
  const [durationUnit, setDurationUnit] = useState("Meses");
  const [durationOnWeeks, setDurationOnWeeks] = useState(0);
  const [projectImage, setProjectImage] = useState<string | null>(null);
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [tipoProyecto, setTipoProyecto] = useState("");
  const [tiposProyectos, setTiposProyectos] = useState<
    { name: string; id: string }[]
  >([]);
  const [subtiposProyecto, setSubtiposProyecto] = useState<
    { name: string; id: string; project_type_id: string }[]
  >([]);
  const [subtipoProyectoFilter, setSubtipoProyectoFilter] = useState<
    { name: string; id: string }[]
  >([]);
  const [subtipoProyecto, setSubtipoProyecto] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);


  React.useEffect(() => {
    getSesion().then((StoredSesion : any) => {
      let sesion = JSON.parse(StoredSesion);
      setUserData(sesion);  
    });
  }, [ ]);

  useEffect(() => {
    fetch("https://villding.lat/endpoint/project/types")
      .then((response) => response.json())
      .then((data) => {
        setTiposProyectos(data);
      });
  }, []);

  useEffect(() => {
    fetch("https://villding.lat/endpoint/project/subtypes")
      .then((response2) => response2.json())
      .then((data2) => {
        setSubtiposProyecto(data2);
      });
  }, []);

  useEffect(() => {
    calculateEndDate();
    handleCalculationOnWeeks();
  }, [startDate, duration, durationUnit]);

  useEffect(() => {
    const filteredSubtipos = subtiposProyecto.filter(
      (subtipo) => subtipo.project_type_id == tipoProyecto
    );
    setSubtipoProyectoFilter(filteredSubtipos);
  }, [tipoProyecto]);

  const handleCalculationOnWeeks = () => {
    const [day, month, year] = startDate.split("/").map(Number);
    const start = new Date(year, month - 1, day); // Meses en JavaScript son 0-indexados
    let durationInWeeks = 0;

    switch (durationUnit) {
      case "Dias":
        durationInWeeks = parseInt(duration, 10) / 7; // Convertir días a semanas
        break;
      case "Semanas":
        durationInWeeks = parseInt(duration, 10);
        break;
      case "Meses":
        durationInWeeks = parseInt(duration, 10) * 4.34524; // 1 mes ≈ 4.345 semanas
        break;
      case "Años":
        durationInWeeks = parseInt(duration, 10) * 52.1429; // 1 año ≈ 52.14 semanas
        break;
      default:
        console.error("Unidad de duración no reconocida");
        return;
    }

    const end = new Date(start);
    end.setDate(start.getDate() + Math.ceil(durationInWeeks * 7)); // Sumar las semanas en días

    console.log(`Duration on weeks: ${durationInWeeks}`);
    setDurationOnWeeks(Math.ceil(durationInWeeks));
  };
  const handlePickImage = async () => {
    console.log("Iniciando selección de imagen...");
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log("Resultado del picker:", pickerResult);

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      let selectedImage = pickerResult.assets[0].uri;
      console.log("Imagen seleccionada:", selectedImage);

      let compressLevel = 0.8;
      let resizedWidth = 800;

      let manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage,
        [{ resize: { width: resizedWidth } }],
        { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("Imagen manipulada:", manipulatedImage.uri);

      let fileInfo = await getInfoAsync(manipulatedImage.uri) as any;
      console.log(`Tamaño inicial: ${(fileInfo.size / 1024).toFixed(2)} KB`);

      // Reducir el tamaño iterativamente si supera 500 KB
      while (fileInfo.size > MAX_FILE_SIZE && compressLevel > 0.1) {
        compressLevel -= 0.1;
        resizedWidth -= 100;
        console.log(`Recomprimiendo: compress=${compressLevel.toFixed(1)}, width=${resizedWidth}`);
        manipulatedImage = await ImageManipulator.manipulateAsync(
          selectedImage,
          [{ resize: { width: resizedWidth } }],
          { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG }
        );
        fileInfo = await getInfoAsync(manipulatedImage.uri);
        console.log(`Nuevo tamaño: ${(fileInfo.size / 1024).toFixed(2)} KB`);
      }

      if (fileInfo.size <= MAX_FILE_SIZE) {
        console.log(`✓ Imagen lista: ${(fileInfo.size / 1024).toFixed(2)} KB`);
        console.log("✓ Estableciendo projectImage con URI:", manipulatedImage.uri);
        setProjectImage(manipulatedImage.uri);
        console.log("✓ Estado actualizado, projectImage debería cambiar");
      } else {
        console.log("✗ No se pudo reducir la imagen a menos de 500 KB.");
        alert("La imagen seleccionada es demasiado grande incluso después de ser comprimida.");
      }
    } else {
      console.log("Selección de imagen cancelada o sin resultados");
    }
  };

  const showDataTimePicker = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          const formattedDate = new Date(date).toLocaleDateString("es-ES");
          setStartDate(formattedDate);
        }
      },
      mode: "date",
      is24Hour: true,
    });
  };

  const calculateEndDate = () => {
    const [day, month, year] = startDate.split("/").map(Number);
    const start = new Date(year, month - 1, day); // Meses en JavaScript son 0-indexados

    const durationInUnits = parseInt(duration, 10);
    if (durationUnit === "Meses") {
      start.setMonth(start.getMonth() + durationInUnits);
    } else if (durationUnit === "Años") {
      start.setFullYear(start.getFullYear() + durationInUnits);
    } else if (durationUnit === "Semanas") {
      start.setDate(start.getDate() + durationInUnits * 7);
    } else if (durationUnit === "Dias") {
      start.setDate(start.getDate() + durationInUnits);
    }
    
    return start.toLocaleDateString("es-ES");
  };

  const formatDate = (dateString: string) => {
    // (dd/mm/yyyy) -> (yyyy-mm-dd)
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleCreateProject = async () => {
    setShowModalLoading(true);
    console.log("Creando nuevo proyecto...");
    if (
      projectName === "" ||
      location === "" ||
      company === "" ||
      tipoProyecto === "0"
    ) {
      setErrorBoolean(true);
      setShowModalLoading(false);
      return;
    }

    let monday = new Date(formatDate(startDate));
    let day = monday.getDay();  // Obtiene el día de la semana (0 = Domingo, 1 = Lunes, ...)
    let diff = (day === 0 ? -6 : 1) - day;  // Calcula la diferencia para ajustar al lunes
    monday.setDate(monday.getDate() + diff); // 

    // Guarda el proyecto y espera a que se complete antes de navegar
    const formdata = new FormData();
    formdata.append("name", projectName);
    formdata.append("location", location);
    formdata.append("company", company);
    formdata.append("start_date", formatDate(startDate));
    formdata.append("end_date", formatDate(calculateEndDate()));
    formdata.append("project_type_id", tipoProyecto);
    formdata.append("nearest_monday", monday.toISOString().split('T')[0]);
    if (subtipoProyecto !== "0") {
      formdata.append("project_subtype_id", subtipoProyecto);
    }

    

    // Si hay una imagen seleccionada, la agregamos al FormData
    if (projectImage) {
      const uriParts = projectImage.split('.');
      const fileExtensionRaw = uriParts[uriParts.length - 1] || 'jpg';
      const fileExtension = fileExtensionRaw.toLowerCase();
      const mimeType = fileExtension === 'jpg' ? 'image/jpeg' : `image/${fileExtension}`;

      console.log("Agregando imagen al FormData:", projectImage);
      console.log("Tipo de archivo:", fileExtension);

      formdata.append('uri', {
        uri: projectImage,
        name: `project_image.${fileExtension}`,
        type: mimeType,
      } as any);
    } else {
      console.log("No hay imagen seleccionada para enviar");
    }

    let reqOptions = {
      url: "https://villding.lat/endpoint/project/store",
      method: "POST",
      data: formdata,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      console.log("Enviando petición al servidor...");
      let response = await axios(reqOptions);
      console.log("Respuesta del servidor:", response.status);
      console.log("Proyecto creado en el servidor:", response.data);

      const createdProject = response.data;

      const AttachUserProjectJson = {
        user_id:  userData.id,
        project_id: createdProject.id,
        is_admin: true,
      };

      let reqOptions2 = {
        url: "https://villding.lat/endpoint/project/attach",
        method: "POST",
        data: AttachUserProjectJson,
      };

      const attachResponse = await axios(reqOptions2);
      console.log("Usuario asociado al proyecto:", attachResponse.data);

      console.log("Se ha creado el proyecto con exito");

      const newProject: any = {
        id: createdProject.id,
        image: createdProject.uri || "",
        title: projectName,
        subtitle: location,
        company,
        week: durationOnWeeks,
        start_date: startDate,
        nearest_monday: monday.toISOString().split('T')[0],
      };

      setShowModalLoading(false);
      //  setMsjeModal("Se ha actualizado el perfil con exito") ;
      // setShowModalConfirm (true);
      
      
      await saveProject(newProject)
        .then(() => {
          console.log("Proyecto guardado en el almacenamiento local");
        })
        .catch((error) => {
          console.error("Error al guardar el proyecto en el almacenamiento local:", error);
        });
      navigate('HomeProject', 'nuevoProyecto'); // Navega a HomeProject después de que se guarde
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      setShowModalLoading(false);
      alert("Error al crear el proyecto. Por favor, intenta nuevamente.");
    }
  };

  const handleCancel = () => {
    navigate("HomeProject");
  };

  const capitalizarPrimeraLetra = (cadena: string) => {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  }
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <TouchableOpacity onPress={handleCancel}>
            <Text style={{ color: "white", fontSize: 18 }}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Nuevo proyecto
          </Text>
          <TouchableOpacity onPress={handleCreateProject}>
            <Text style={{ color: "white", fontSize: 18 }}>Crear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre del proyecto*</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Nombre del proyecto"
          placeholderTextColor="#888"
        />
        {errorBoolean && projectName === "" ? (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Este campo es obligatorio
          </Text>
        ) : null}
        <Text style={styles.label}>Ubicación*</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ubicación"
          placeholderTextColor="#888"
        />
        {errorBoolean && location === "" ? (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Este campo es obligatorio
          </Text>
        ) : null}

        <Text style={styles.label}>Empresa ejecutora*</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="Empresa ejecutora"
          placeholderTextColor="#888"
        />
        {errorBoolean && company === "" ? (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Este campo es obligatorio
          </Text>
        ) : null}
        <Text style={styles.label}>Tipo de proyecto*</Text>
        <Picker
          selectedValue={tipoProyecto}
          style={{
            height: 50,
            width: "100%",
            backgroundColor: "#05222F",
            color: "white",
            borderRadius: 5,
          }}
          onValueChange={(itemValue) => setTipoProyecto(itemValue)}
        >
           <Picker.Item label="Seleccionar" value="0" />
          {tiposProyectos.map((item, index) => (
            <Picker.Item key={index} label={capitalizarPrimeraLetra(item.name)} value={item.id} />
          ))}
        </Picker>
        {errorBoolean && tipoProyecto === "0" ? (
          <Text style={{ color: "#ff7979", marginBottom: 10 }}>
            Seleccione un tipo de proyecto
          </Text>
        ) : null}
        {subtipoProyectoFilter.length > 0 ? (
          <View>
            <Text style={styles.label}>Subtipo de proyecto</Text>
            <Picker
              selectedValue={subtipoProyecto}
              style={{
                height: 50,
                width: "100%",
                backgroundColor: "#05222F",
                color: "white",
                borderRadius: 5,
              }}
              onValueChange={(itemValue) => setSubtipoProyecto(itemValue)}
            >
              <Picker.Item label="Seleccionar" value="0" />
              {subtipoProyectoFilter.map((item, index) => (
                <Picker.Item key={index} label={capitalizarPrimeraLetra(item.name)} value={item.id} />
              ))}
            </Picker>
          </View>
        ) : null}
        <Text style={styles.label}>Fecha de inicio</Text>
        <TouchableOpacity style={styles.input} onPress={showDataTimePicker}>
          <Text style={{ color: "#888" }}>{startDate}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Tiempo de ejecución</Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={[
              styles.input,
              {
                width: "40%",
                textAlign: "left",
              },
            ]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
          <View
            style={{
              width: "50%",
              alignItems: "center",
              marginTop: -15,
              marginLeft: 10,
              borderRadius: 5,
            }}
          >
            <Picker
              selectedValue={durationUnit}
              style={{
                height: 50,
                width: "100%",
                backgroundColor: "#05222F",
                color: "white",
                borderRadius: 5,
              }}
              onValueChange={(itemValue) => setDurationUnit(itemValue)}
            >
              <Picker.Item label="Semanas" value="Semanas" />
              <Picker.Item label="Dias" value="Dias" />
              <Picker.Item label="Meses" value="Meses" />
              <Picker.Item label="Años" value="Años" />
            </Picker>
          </View>
        </View>

        <Text style={styles.label}>Fecha estimada de entrega:</Text>
        <Text style={styles.endDate}>{calculateEndDate()}</Text>
        <Text style={styles.label}>Foto de proyecto</Text>

        <TouchableOpacity
              style={styles.imagePicker}
              onPress={handlePickImage}
            >
              {projectImage ? (
                <Image
                  key={projectImage}
                  source={{ uri: projectImage }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.imageText}>Seleccionar imagen</Text>
              )}
            </TouchableOpacity>
        {route.params.project ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#0A3649", // Color de fondo
              borderColor: "#ff0033", // Color del borde
              borderWidth: 1, // Grosor del borde
              paddingVertical: 10, // Espaciado vertical
              paddingHorizontal: 20, // Espaciado horizontal
              borderRadius: 8, // Esquinas redondeadas
              alignItems: "center", // Centrar el texto
              marginHorizontal: 20, // Margen horizontal
            }}
          >
            <Text
              style={{
                color: "#ff0033", // Color del texto
                fontSize: 16, // Tamaño de la fuente
              }}
            >
              Eliminar proyecto
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ConfirmModal visible={showModalConfirm} message={msjeModal} onClose={() => setShowModalConfirm(false)} />
      <LoadingModal visible={showModalLoading} />
    </ScrollView>
  );
};



export default NewProject;
