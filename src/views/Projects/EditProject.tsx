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
const MAX_FILE_SIZE = 500 * 1024; // 500 KB en bytes
const API_BASE_URL = "https://centroesteticoedith.com/endpoint";

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

type RouteParams = {
  params: {
    project?: Project;
  };
};

const EditProject: React.FC = () => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "params">>();
  
  // Modal states
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [showModalLoading, setShowModalLoading] = useState(false);
  const [msjeModal, setMsjeModal] = useState('');
  
  // Form states
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
  
  // Other states
  const [errorBoolean, setErrorBoolean] = useState(false);
  const [tiposProyectos, setTiposProyectos] = useState<{ name: string; id: string }[]>([]);
  const [subtiposProyecto, setSubtiposProyecto] = useState<{ name: string; id: string; project_type_id: string }[]>([]);
  const [subtipoProyectoFilter, setSubtipoProyectoFilter] = useState<{ name: string; id: string }[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Update form data with a single function
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch user session
  useEffect(() => {
    getSesion().then((storedSession: any) => {
      const session = JSON.parse(storedSession);
      setUserData(session);
    });
  }, []);

  // Fetch project types
  useEffect(() => {
    fetch(`${API_BASE_URL}/project/types`)
      .then(response => response.json())
      .then(data => setTiposProyectos(data));
      
    fetch(`${API_BASE_URL}/project/subtypes`)
      .then(response => response.json())
      .then(data => setSubtiposProyecto(data));
  }, []);

  // Calculate end date and duration in weeks when relevant values change
  useEffect(() => {
    calculateDurationOnWeeks();
  }, [formData.startDate, formData.duration, formData.durationUnit]);

  // Filter subtypes based on selected project type
  useEffect(() => {
    const filteredSubtipos = subtiposProyecto.filter(
      subtipo => subtipo.project_type_id === formData.tipoProyecto
    );
    setSubtipoProyectoFilter(filteredSubtipos);
  }, [formData.tipoProyecto, subtiposProyecto]);

  // Load project data if editing
  useEffect(() => {
    if (route.params?.project) {
      const project = route.params.project;
      setIsEditing(true);
      
      // Calculate duration and unit from weeks
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
    }
  }, [route.params?.project]);

  // Date handling functions
  const formatDate = (dateString: string) => {
    // (dd/mm/yyyy) -> (yyyy-mm-dd)
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

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

  // Get nearest Monday from start date
  const getNearestMonday = () => {
    const date = new Date(formatDate(formData.startDate));
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
  };

  // Image handling
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

  const processImage = async (imageUri: string) => {
    let compressLevel = 0.8;
    let resizedWidth = 800;
  
    let manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: resizedWidth } }],
      { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG }
    );
  
    let fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri) as any;
  
    // Reduce size iteratively if needed
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

  // Form validation
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

  // API interaction functions
  const createFormData = () => {
    const formdata = new FormData();
    formdata.append("name", formData.projectName);
    formdata.append("location", formData.location);
    formdata.append("company", formData.company);
    formdata.append("start_date", formatDate(formData.startDate));
    formdata.append("end_date", formatDate(calculateEndDate()));
    formdata.append("project_type_id", formData.tipoProyecto);
    formdata.append("nearest_monday", getNearestMonday());
    
    if (formData.subtipoProyecto !== "0" && formData.subtipoProyecto !== "") {
      formdata.append("project_subtype_id", formData.subtipoProyecto);
    }

    // Add image if available
    if (formData.projectImage) {
      // Skip if it's a remote URL (for editing existing projects)
      if (!formData.projectImage.startsWith('http')) {
        const uriParts = formData.projectImage.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formdata.append('uri', {
          uri: formData.projectImage,
          name: `profile_image.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
    }

    return formdata;
  };

  const handleCreateProject = async () => {
    setShowModalLoading(true);
    
    if (!validateForm()) {
      setShowModalLoading(false);
      return;
    }

    try {
      // Create project
      const reqOptions = {
        url: `${API_BASE_URL}/project/store`,
        method: "POST",
        data: createFormData(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios(reqOptions);
      
      // Attach user to project
      const attachData = {
        user_id: userData.id,
        project_id: response.data.id,
        is_admin: true,
      };

      await axios({
        url: `${API_BASE_URL}/project/attach`,
        method: "POST",
        data: attachData,
      });

      // Save to local storage
      const newProject = {
        id: response.data.id, 
        image: formData.projectImage || "",
        title: formData.projectName,
        subtitle: formData.location,
        company: formData.company,
        week: formData.durationOnWeeks,
        start_date: formData.startDate,
        nearest_monday: getNearestMonday(),
      };

      await saveProject(newProject as any);
      
      setShowModalLoading(false);
      navigate('HomeProject', 'nuevoProyecto');
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      setShowModalLoading(false);
      setMsjeModal("Error al guardar el proyecto");
      setShowModalConfirm(true);
    }
  };

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

      const reqOptions = {
        url: `${API_BASE_URL}/project/update/${projectId}`,
        method: "POST",
        data: createFormData(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      await axios(reqOptions);
      
      // Update local storage
      const updatedProject: Project = {
        id: projectId,
        image: formData.projectImage || "",
        title: formData.projectName,
        subtitle: formData.location,
        company: formData.company,
        week: formData.durationOnWeeks,
        week_current: route.params.project?.week_current || 0,
        start_date: formData.startDate,
        end_date: calculateEndDate(),
        nearest_monday: getNearestMonday(),
        project_type_id: formData.tipoProyecto || undefined,
        project_subtype_id: formData.subtipoProyecto !== "0" ? formData.subtipoProyecto : undefined
      };

      await saveProject(updatedProject);
      
      setShowModalLoading(false);
      setMsjeModal("Se ha actualizado el proyecto con éxito");
      setShowModalConfirm(true);
      
      navigate('HomeProject', 'proyectoActualizado');
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
      setShowModalLoading(false);
      setMsjeModal("Error al actualizar el proyecto");
      setShowModalConfirm(true);
    }
  };

  const handleDeleteProject = async () => {
    setShowModalLoading(true);
    
    try {
      const projectId = route.params?.project?.id;
      if (!projectId) {
        throw new Error("Project ID is required for deletion");
      }
      
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

  const handleSubmit = () => {
    isEditing ? handleUpdateProject() : handleCreateProject();
  };

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
            {isEditing ? "Editar proyecto" : "Nuevo proyecto"}
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={{ color: "white", fontSize: 18 }}>
              {isEditing ? "Guardar" : "Crear"}
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
        
        {isEditing && (
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
        )}
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