import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
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
import { styles as baseStyles } from "./styles/NewProject";

import ConfirmModal from '../../components/Alerta/ConfirmationModal';
import LoadingModal from '../../components/Alerta/LoadingModal';

// Constante para el tamaño máximo de archivo en bytes (500 KB)
const MAX_FILE_SIZE = 500 * 1024;
const API_BASE_URL = "https://villding.lat/endpoint";

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
    project?: Project;
  };
};

// Editar un proyecto
const EditProject: React.FC = () => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "params">>();

  // Combinar los estilos base con los nuevos estilos para los modales
  const styles = StyleSheet.create({
    ...baseStyles,
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      backgroundColor: '#33baba',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    cancelButton: {
      backgroundColor: '#888',
      marginRight: 10,
    },
    deleteButton: {
      backgroundColor: '#d9534f',
    },
    loadingText: {
      color: 'white',
      marginTop: 10,
    },
    endDate: {
      color: '#33baba',
      fontSize: 16,
      marginBottom: 15,
    }
  });

  // Estados para los modales
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState<{ name: string; id: string }[]>([]);
  const [subtypeProyecto, setSubtypeProyecto] = useState<{ name: string; id: string; project_type_id: string }[]>([]);

  const [ModalDelete, setModalDelete] = useState(false);

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
    subtipoProyecto: "",
    endDate: ""
  });

  // Otros estados
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [tiposProyectos, setTiposProyectos] = useState<{ name: string; id: string }[]>([]);
  const [subtiposProyecto, setSubtiposProyecto] = useState<{ name: string; id: string; project_type_id: string }[]>([]);
  const [subtipoProyectoFilter, setSubtipoProyectoFilter] = useState<{ name: string; id: string }[]>([]);
  const [userData, setUserData] = useState<any>(null);

  // Función para actualizar los datos del formulario
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Si se está actualizando la duración o unidad, recalcular la fecha final
      if (field === 'duration' || field === 'durationUnit') {
        const endDate = calculateEndDate();
        newData.endDate = endDate;
      }

      return newData;
    });
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
    axios.get(`${API_BASE_URL}/project/types`)
      .then(response => response.data)
      .then(data => setTiposProyectos(data));

    axios.get(`${API_BASE_URL}/project/subtypes`)
      .then(response => response.data)
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

  // Calcular la fecha de finalización cuando cambian los valores relevantes
  useEffect(() => {
    const endDate = calculateEndDate();
    updateFormData("endDate", endDate);
  }, [formData.startDate, formData.duration, formData.durationUnit]);;

  // Cargar los datos del proyecto
  // In your useEffect for loading project data
useEffect(() => {
  if (route.params?.project) {
    const project = route.params.project;

    // Ensure start_date is in the correct format (dd/mm/yyyy)
    let formattedStartDate = project.start_date;
    if (formattedStartDate.includes('-')) {
      // Convert from yyyy-mm-dd to dd/mm/yyyy
      const [year, month, day] = formattedStartDate.split('-');
      formattedStartDate = `${day}/${month}/${year}`;
    }

    // Calculate the duration and unit from weeks
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
      startDate: formattedStartDate,
      duration,
      durationUnit,
      durationOnWeeks: weeks,
      projectImage: project.image,
      tipoProyecto: project.project_type_id || "",
      subtipoProyecto: project.project_subtype_id || "",
      endDate: project.end_date
    });

    // Obtener el tipo y subtipo específico del proyecto
    if (project.id) {
      // Obtener el tipo de proyecto específico
      axios.get(`${API_BASE_URL}/project/types/${project.id}`)
        .then(response => response.data)
        .then(data => {
          console.log('Tipo de proyecto:', data);
          if (data.type) {
            setTipoProyecto([data.type]);
            setFormData(prev => ({
              ...prev,
              tipoProyecto: data.type.id
            }));
          }
          if (data.subtype) {
            setSubtypeProyecto([data.subtype]);
            setFormData(prev => ({
              ...prev,
              subtipoProyecto: data.subtype.id
            }));
          }
        })
        .catch(error => console.error("Error al obtener tipos de proyecto específicos:", error));

    
    }
  } else {
    // Redirect if no project to edit
    navigate('HomeProject');
  }
}, [route.params?.project]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      let day, month, year;
      
      // Handle different date formats
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Check if year comes first (yyyy/mm/dd)
          if (parts[0].length === 4) {
            [year, month, day] = parts;
          } else {
            // Assume dd/mm/yyyy
            [day, month, year] = parts;
          }
        } else {
          throw new Error('Invalid date format');
        }
      } else if (dateString.includes('-')) {
        // Handle yyyy-mm-dd format
        const parts = dateString.split('-');
        if (parts.length === 3) {
          [year, month, day] = parts;
        } else {
          throw new Error('Invalid date format');
        }
      } else {
        throw new Error('Unsupported date format');
      }

      // Convert to numbers and pad with zeros if needed
      day = parseInt(day, 10).toString().padStart(2, '0');
      month = parseInt(month, 10).toString().padStart(2, '0');
      year = parseInt(year, 10);

      // Return in YYYY-MM-DD format
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
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
    try {
      // Add this at the beginning of calculateEndDate
      console.log('Starting date calculation with:', {
        startDate: formData.startDate,
        duration: formData.duration,
        durationUnit: formData.durationUnit
      });

      // Handle different date formats and normalize them
      let day, month, year;
      
      if (formData.startDate.includes('/')) {
        // Handle dd/mm/yyyy format
        const parts = formData.startDate.split('/');
        if (parts.length === 3) {
          // Check if the year comes first (yyyy/mm/dd)
          if (parts[0].length === 4) {
            [year, month, day] = parts;
          } else {
            // Assume dd/mm/yyyy
            [day, month, year] = parts;
          }
        } else {
          throw new Error('Invalid date format');
        }
      } else if (formData.startDate.includes('-')) {
        // Handle yyyy-mm-dd format
        const parts = formData.startDate.split('-');
        if (parts.length === 3) {
          [year, month, day] = parts;
        } else {
          throw new Error('Invalid date format');
        }
      } else {
        throw new Error('Unsupported date format');
      }

      // Convert all parts to numbers
      day = parseInt(day, 10);
      month = parseInt(month, 10);
      year = parseInt(year, 10);

      // Validate date components
      if (isNaN(day) || isNaN(month) || isNaN(year) ||
          day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100) {
        console.log('Invalid date components:', { day, month, year });
        throw new Error('Invalid date components');
      }

      console.log('Parsed date components:', { day, month, year });
      
      // Create a date object using the parsed components
      const start = new Date(year, month - 1, day);
      
      console.log('Created date object:', start, 'valid?', !isNaN(start.getTime()));
      
      // Validate the created date
      if (isNaN(start.getTime())) {
        throw new Error('Invalid date created');
      }
      
      // Get the duration value as a number
      const durationInUnits = parseInt(formData.duration, 10) || 0;
      
      // Create a new date for the end date calculation
      const endDate = new Date(start.getTime());
      
      // Apply the duration based on the selected unit
      switch (formData.durationUnit) {
        case "Meses":
          endDate.setMonth(endDate.getMonth() + durationInUnits);
          break;
        case "Años":
          endDate.setFullYear(endDate.getFullYear() + durationInUnits);
          break;
        case "Semanas":
          endDate.setDate(endDate.getDate() + (durationInUnits * 7));
          break;
        case "Dias":
          endDate.setDate(endDate.getDate() + durationInUnits);
          break;
      }
      
      // Format the result to Spanish locale date format (dd/mm/yyyy)
      const formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
      console.log('Calculated end date:', formattedEndDate);
      
      return formattedEndDate;

    } catch (error) {
      console.error('Error calculating end date:', error);
      // Return current date as fallback
      const now = new Date();
      return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    }
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
    try {
      const [year, month, day] = formatDate(formData.startDate).split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const dayOfWeek = date.getDay();
      const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      date.setDate(date.getDate() + diff);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error getting nearest Monday:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Función para manejar la selección de imágenes
  const handlePickImage = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
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
      const projectId = route.params?.project?.id;
      if (!projectId) {
        throw new Error("Project ID is required for update");
      }

      const form = new FormData();
      
      // Append all required fields with correct names
      form.append("name", formData.projectName);
      form.append("location", formData.location);
      form.append("company", formData.company);
      form.append("start_date", formatDate(formData.startDate));
      form.append("end_date", formatDate(formData.endDate));
      form.append("nearest_monday", getNearestMonday());

      // Only append project_type_id if a valid type is selected
      if (formData.tipoProyecto && formData.tipoProyecto !== "0") {
        form.append("project_type_id", formData.tipoProyecto);
      }

      // Only append project_subtype_id if a valid subtype is selected
      if (formData.subtipoProyecto && formData.subtipoProyecto !== "0") {
        form.append("project_subtype_id", formData.subtipoProyecto);
      }

      // Agregar la imagen solo si se ha seleccionado una nueva y no es una URL
      if (formData.projectImage && !formData.projectImage.startsWith('http')) {
        const uriParts = formData.projectImage.split('.');
        const fileType = uriParts[uriParts.length - 1];

        // Get the file info to check size
        const fileInfo = await FileSystem.getInfoAsync(formData.projectImage);
        
        // Check if file exists and has size info
        if (!fileInfo.exists || !('size' in fileInfo)) {
          throw new Error('No se pudo obtener información del archivo');
        }
        
        // Check if file size is within 2MB limit (2 * 1024 * 1024 bytes)
        if (fileInfo.size > 2 * 1024 * 1024) {
          throw new Error('La imagen seleccionada excede el límite de 2MB permitido');
        }

        form.append('uri', {
          uri: formData.projectImage,
          name: `project_image_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      console.log('Form data to be sent:', {
        name: formData.projectName,
        location: formData.location,
        company: formData.company,
        start_date: formatDate(formData.startDate),
        end_date: formatDate(formData.endDate),
        nearest_monday: getNearestMonday(),
        project_type_id: formData.tipoProyecto,
        project_subtype_id: formData.subtipoProyecto
      });
      console.log(`${API_BASE_URL}/project/update/${projectId}`);

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
      console.log('Response from server:', response.data);

      // Actualizar el almacenamiento local con los datos devueltos por el servidor
      const updatedProject: Project = {
        id: projectId,
        image: response.data.project.uri || formData.projectImage || "",
        title: response.data.project.name,
        subtitle: response.data.project.location,
        company: response.data.project.company,
        week: formData.durationOnWeeks,
        week_current: route.params.project?.week_current || 0,
        start_date: response.data.project.start_date,
        end_date: response.data.project.end_date,
        nearest_monday: response.data.project.nearest_monday,
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
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMsjeModal(errorMessage);
      setShowModalConfirm(true);
    }
  };

  // Función para mostrar el modal de confirmación antes de eliminar
  const confirmDeleteProject = () => {
    setErrorBoolean(true);
  };

  // Función para manejar la eliminación de un proyecto
  const handleDeleteProject = async () => {
    setShowModalLoading(true);

    try {
      const projectId = route.params?.project?.id;
      if (!projectId) {
        throw new Error("Project ID is required for deletion");
      }

      await deleteProject(projectId);

      await axios({
        url: `${API_BASE_URL}/project/destroy/${projectId}`,
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

  // Función para manejar cambios en la duración
  const handleDurationChange = (value: string) => {
    // Validar que sea un número
    if (/^\d*$/.test(value)) {
      updateFormData("duration", value);
    }
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
            onChangeText={handleDurationChange}
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
        <Text style={styles.endDate}>{formData.endDate}</Text>

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
          onPress={confirmDeleteProject}
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
      <Modal
        visible={showModalLoading}
        transparent={true}
        animationType="fade">
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#33baba" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </Modal>

      {/* Modal de confirmación para eliminar proyecto */}
      <Modal
        visible={ModalDelete}
        transparent={true}
        animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{msjeModal}</Text>
            <TouchableOpacity style={styles.button} onPress={() =>  setModalDelete(false)}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para eliminar proyecto */}
      <Modal
        visible={errorBoolean}
        transparent={true}
        animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Estás seguro que deseas eliminar este proyecto?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setErrorBoolean(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={() => {
                  setErrorBoolean(false);
                  handleDeleteProject();
                }}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <LoadingModal visible={showModalLoading} />
    </ScrollView>
  );
};

export default EditProject;