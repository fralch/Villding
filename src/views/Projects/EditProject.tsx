import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { saveProject, deleteProject } from "../../hooks/localStorageProject";
import { getSesion } from '../../hooks/localStorageUser';
import { useRoute, RouteProp } from "@react-navigation/native";
import { styles } from "./styles/NewProject";

import ConfirmModal from '../../components/Alerta/ConfirmationModal';
import LoadingModal from '../../components/Alerta/LoadingModal';

// Constante para el tamaño máximo de archivo en bytes (500 KB)
const MAX_FILE_SIZE = 500 * 1024;
const API_BASE_URL = "https://centroesteticoedith.com/endpoint";

// Interfaz para la estructura de un proyecto
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
  project_type_id?: string;
  project_subtype_id?: string;
  nearest_monday?: string;
}

// Tipos para los parámetros de la ruta
type RouteParams = {
  params: {
    project: Project; // Ahora project es requerido, no opcional
  };
};

// Editar un proyecto
const EditProject: React.FC = () => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "params">>();

  // Estados para los modales
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState('');

  // Estados para los datos del formulario
  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    company: "",
    startDate: new Date().toLocaleDateString("es-ES"),
    duration: "6",
    durationUnit: "Meses",
    durationOnWeeks: 0,
    projectImage: null as string | null,
    tipoProyecto: "",
    subtipoProyecto: ""
  });

  // Otros estados
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [tiposProyectos, setTiposProyectos] = useState<{ name: string; id: string }[]>([]);
  const [subtiposProyecto, setSubtiposProyecto] = useState<{ name: string; id: string; project_type_id: string }[]>([]);
  const [subtipoProyectoFilter, setSubtipoProyectoFilter] = useState<{ name: string; id: string }[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Función para actualizar los datos del formulario
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Obtener la sesión del usuario al montar el componente
  useEffect(() => {
    getSesion().then((storedSession: any) => {
      const session = JSON.parse(storedSession);
      setUserData(session);
    });
  }, []);

  // Obtener los tipos y subtipos de proyecto al montar el componente
  useEffect(() => {
    fetch(`${API_BASE_URL}/project/types`)
      .then(response => response.json())
      .then(data => setTiposProyectos(data));

    fetch(`${API_BASE_URL}/project/subtypes`)
      .then(response => response.json())
      .then(data => setSubtiposProyecto(data));
  }, []);

  // Calcular la fecha de finalización y la duración en semanas cuando cambian los valores relevantes
  useEffect(() => {
    calculateDurationOnWeeks();
  }, [formData.startDate, formData.duration, formData.durationUnit]);

  // Filtrar los subtipos de proyecto según el tipo de proyecto seleccionado
  useEffect(() => {
    const filteredSubtipos = subtiposProyecto.filter(
      subtipo => subtipo.project_type_id === formData.tipoProyecto
    );
    setSubtipoProyectoFilter(filteredSubtipos);
  }, [formData.tipoProyecto, subtiposProyecto]);

  // Cargar los datos del proyecto al montar el componente
  useEffect(() => {
    const project = route.params.project;

    // Calcular la duración y la unidad a partir de las semanas
    let duration = "";
    let durationUnit = "";
    const weeks = project.week;

    if (weeks >= 52) {
      duration = Math.floor(weeks / 52).toString();
      durationUnit = "Años";
    } else if (weeks >= 4) {
      duration = Math.floor(weeks / 4).toString();
      durationUnit = "Meses";
    } else {
      duration = weeks.toString();
      durationUnit = "Semanas";
    }

    setFormData({
      projectName: project.title,
      location: project.subtitle,
      company: project.company,
      startDate: project.start_date,
      duration,
      durationUnit,
      durationOnWeeks: weeks,
      projectImage: project.image,
      tipoProyecto: project.project_type_id || "",
      subtipoProyecto: project.project_subtype_id || ""
    });
  }, [route.params.project]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    // (dd/mm/yyyy) -> (yyyy-mm-dd)
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  // Función para mostrar el selector de fecha y hora
  const showDateTimePicker = () => {
    DateTimePickerAndroid.open({
      value: new Date(),
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          const formattedDate = new Date(date).toLocaleDateString("es-ES");
          updateFormData("startDate", formattedDate);
        }
      },
      mode: "date",
      is24Hour: true,
    });
  };

  // Función para calcular la fecha de finalización
  const calculateEndDate = () => {
    const [day, month, year] = formData.startDate.split("/").map(Number);
    const start = new Date(year, month - 1, day);
    const durationInUnits = parseInt(formData.duration, 10);

    switch(formData.durationUnit) {
      case "Meses":
        start.setMonth(start.getMonth() + durationInUnits);
        break;
      case "Años":
        start.setFullYear(start.getFullYear() + durationInUnits);
        break;
      case "Semanas":
        start.setDate(start.getDate() + durationInUnits * 7);
        break;
      case "Dias":
        start.setDate(start.getDate() + durationInUnits);
        break;
    }

    return start.toLocaleDateString("es-ES");
  };

  // Función para calcular la duración en semanas
  const calculateDurationOnWeeks = () => {
    const [day, month, year] = formData.startDate.split("/").map(Number);
    const start = new Date(year, month - 1, day);
    let durationInWeeks = 0;

    switch (formData.durationUnit) {
      case "Dias":
        durationInWeeks = parseInt(formData.duration, 10) / 7;
        break;
      case "Semanas":
        durationInWeeks = parseInt(formData.duration, 10);
        break;
      case "Meses":
        durationInWeeks = parseInt(formData.duration, 10) * 4.34524;
        break;
      case "Años":
        durationInWeeks = parseInt(formData.duration, 10) * 52.1429;
        break;
    }

    updateFormData("durationOnWeeks", Math.ceil(durationInWeeks));
  };

  // Función para obtener el lunes más cercano a la fecha de inicio
  const getNearestMonday = () => {
    const date = new Date(formatDate(formData.startDate));
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
  };

  // Función para manejar la selección de imágenes
  const handlePickImage = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      let selectedImage = pickerResult.assets[0].uri;
      await processImage(selectedImage);
    }
  };

  // Función para procesar la imagen seleccionada
  const processImage = async (imageUri: string) => {
    let compressLevel = 0.8;
    let resizedWidth = 800;

    let manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: resizedWidth } }],
      { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG }
    );

    let fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri) as any;

    // Reducir el tamaño de la imagen iterativamente si es necesario
    while (fileInfo.size > MAX_FILE_SIZE && compressLevel > 0.1) {
      compressLevel -= 0.1;
      resizedWidth -= 100;

      manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: resizedWidth } }],
        { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG }
      );

      fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
    }

    if (fileInfo.size <= MAX_FILE_SIZE) {
      updateFormData("projectImage", manipulatedImage.uri);
    } else {
      alert("La imagen seleccionada es demasiado grande incluso después de ser comprimida.");
    }
  };

  // Función para validar el formulario
  const validateForm = () => {
    if (
      formData.projectName === "" ||
      formData.location === "" ||
      formData.company === ""
    ) {
      setErrorBoolean(true);
      return false;
    }
    return true;
  };

  // Función para manejar la actualización de un proyecto
  const handleUpdateProject = async () => {
    setShowModalLoading(true);

    if (!validateForm()) {
      setShowModalLoading(false);
      return;
    }

    try {
      const projectId = route.params.project.id;

      const form = new FormData();
      form.append("name", formData.projectName);
      form.append("location", formData.location);
      form.append("company", formData.company);
      form.append("start_date", formatDate(formData.startDate));
      form.append("end_date", formatDate(calculateEndDate()));
      form.append("nearest_monday", getNearestMonday());

      if (formData.tipoProyecto !== "0") {
        form.append("project_type_id", formData.tipoProyecto);
      }

      if (formData.subtipoProyecto !== "0") {
        form.append("project_subtype_id", formData.subtipoProyecto);
      }

      // Agregar la imagen solo si se ha seleccionado una nueva
      if (formData.projectImage && !formData.projectImage.startsWith('http')) {
        const uriParts = formData.projectImage.split('.');
        const fileType = uriParts[uriParts.length - 1];

        form.append('uri', {
          uri: formData.projectImage,
          name: `project_image_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const reqOptions = {
        url: `${API_BASE_URL}/project/update/${projectId}`,
        method: "POST",
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      };

      const response = await axios(reqOptions);

      // Actualizar el almacenamiento local con los datos devueltos por el servidor
      const updatedProject: Project = {
        id: projectId,
        image: response.data.project.uri || formData.projectImage || "",
        title: response.data.project.name,
        subtitle: response.data.project.location,
        company: response.data.project.company,
        week: formData.durationOnWeeks,
        week_current: route.params.project.week_current || 0,
        start_date: formData.startDate,
        end_date: calculateEndDate(),
        nearest_monday: getNearestMonday(),
        project_type_id: response.data.project.project_type_id,
        project_subtype_id: response.data.project.project_subtype_id
      };

      await saveProject(updatedProject);

      setShowModalLoading(false);
      setMsjeModal(response.data.message || "Se ha actualizado el proyecto con éxito");
      setShowModalConfirm(true);

      navigate('HomeProject', 'proyectoActualizado');
    } catch (error: any) {
      console.error("Error al actualizar el proyecto:", error);
      setShowModalLoading(false);
      
      let errorMessage = "Error al actualizar el proyecto";
      if (error.response) {
        if (error.response.status === 422) {
          // Error de validación
          const validationErrors = error.response.data.errors;
          errorMessage = Object.values(validationErrors).flat().join('\n');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setMsjeModal(errorMessage);
      setShowModalConfirm(true);
    }
  };

  // Función para manejar la eliminación de un proyecto
  const handleDeleteProject = async () => {
    setShowModalLoading(true);

    try {
      const projectId = route.params.project.id;

      await deleteProject(projectId);

      await axios({
        url: `${API_BASE_URL}/project/delete/${projectId}`,
        method: "DELETE",
      });

      setShowModalLoading(false);
      setMsjeModal("Proyecto eliminado con éxito");
      setShowModalConfirm(true);

      navigate('HomeProject', 'proyectoEliminado');
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      setShowModalLoading(false);
      setMsjeModal("Error al eliminar el proyecto");
      setShowModalConfirm(true);
    }
  };

  // Función para capitalizar la primera letra de una cadena
  const capitalizarPrimeraLetra = (cadena: string) => {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
  };

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
          <TouchableOpacity onPress={() => navigate("HomeProject")}>
            <Text style={{ color: "white", fontSize: 18 }}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Editar proyecto
          </Text>
          <TouchableOpacity onPress={handleUpdateProject}>
            <Text style={{ color: "white", fontSize: 18 }}>
              Guardar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre del proyecto*</Text>
        <TextInput
          style={styles.input}
          value={formData.projectName}
          onChangeText={(value) => updateFormData("projectName", value)}
          placeholder="Nombre del proyecto"
          placeholderTextColor="#888"
        />
        {errorBoolean && formData.projectName === "" && (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Ingresa un nombre de proyecto
          </Text>
        )}

        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(value) => updateFormData("location", value)}
          placeholder="Ubicación"
          placeholderTextColor="#888"
        />
        {errorBoolean && formData.location === "" && (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Ingresa una ubicación
          </Text>
        )}

        <Text style={styles.label}>Empresa ejecutora</Text>
        <TextInput
          style={styles.input}
          value={formData.company}
          onChangeText={(value) => updateFormData("company", value)}
          placeholder="Empresa ejecutora"
          placeholderTextColor="#888"
        />
        {errorBoolean && formData.company === "" && (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Ingresa una empresa
          </Text>
        )}

        <Text style={styles.label}>Tipo de proyecto</Text>
        <Picker
          selectedValue={formData.tipoProyecto}
          style={{
            height: 50,
            width: "100%",
            backgroundColor: "#05222F",
            color: "white",
            borderRadius: 5,
          }}
          onValueChange={(value) => updateFormData("tipoProyecto", value)}
        >
          <Picker.Item label="Seleccionar" value="0" />
          {tiposProyectos.map((item, index) => (
            <Picker.Item
              key={index}
              label={capitalizarPrimeraLetra(item.name)}
              value={item.id}
            />
          ))}
        </Picker>

        {subtipoProyectoFilter.length > 0 && (
          <View>
            <Text style={styles.label}>Subtipo de proyecto</Text>
            <Picker
              selectedValue={formData.subtipoProyecto}
              style={{
                height: 50,
                width: "100%",
                backgroundColor: "#05222F",
                color: "white",
                borderRadius: 5,
              }}
              onValueChange={(value) => updateFormData("subtipoProyecto", value)}
            >
              <Picker.Item label="Seleccionar" value="0" />
              {subtipoProyectoFilter.map((item, index) => (
                <Picker.Item
                  key={index}
                  label={capitalizarPrimeraLetra(item.name)}
                  value={item.id}
                />
              ))}
            </Picker>
          </View>
        )}

        <Text style={styles.label}>Fecha de inicio</Text>
        <TouchableOpacity style={styles.input} onPress={showDateTimePicker}>
          <Text style={{ color: "#888" }}>{formData.startDate}</Text>
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
            value={formData.duration}
            onChangeText={(value) => updateFormData("duration", value)}
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
              selectedValue={formData.durationUnit}
              style={{
                height: 50,
                width: "100%",
                backgroundColor: "#05222F",
                color: "white",
                borderRadius: 5,
              }}
              onValueChange={(value) => updateFormData("durationUnit", value)}
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
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          {formData.projectImage ? (
            <Image source={{ uri: formData.projectImage }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Subir foto del proyecto</Text>
          )}
        </TouchableOpacity>
        {errorBoolean && !formData.projectImage && (
          <Text style={{ color: "#ff7979", marginTop: -20, marginBottom: 10 }}>
            Ingresa una imagen
          </Text>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: "#0A3649",
            borderColor: "#ff0033",
            borderWidth: 1,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            alignItems: "center",
            marginHorizontal: 20,
            marginBottom: 20,
          }}
          onPress={handleDeleteProject}
        >
          <Text
            style={{
              color: "#ff0033",
              fontSize: 16,
            }}
          >
            Eliminar proyecto
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showModalConfirm}
        message={msjeModal}
        onClose={() => {
          setShowModalConfirm(false);
          if (msjeModal.includes("éxito")) {
            navigate('HomeProject');
          }
        }}
      />
      <LoadingModal visible={showModalLoading} />
    </ScrollView>
  );
};

export default EditProject;
