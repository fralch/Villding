import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { getSesion, removeSesion , updateSesion } from '../../hooks/localStorageUser';
import {
  MaterialCommunityIcons,
  Entypo,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./styles/ActivityItemCreateStyles";
import { Activity } from './Activity';

// Tipos y constantes
interface ActivityItemCreateProps {
  project_id: number;
  tracking_id: number;
  tipo: string;
  date: string;
  isEditing?: boolean;
  itemData?: any;
  activity?: Activity | null;
  hideModal?: () => void;
}
interface TitleSectionProps {
  titulo: string;
  onTituloChange: (text: string) => void;
  onFinishTask: () => Promise<boolean>;
  isAdmin: boolean;
  images: string[]; // Array of image URIs
  onTakePhoto: () => void;
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  imagesNewlyAdded: boolean; // Add this new prop
}

// Componente principal
const ActivityItemCreate = forwardRef<ActivityItemCreateRef, ActivityItemCreateProps>(({ tipo, project_id, tracking_id, date, isEditing = false, itemData, activity, hideModal, }, ref) => {
  // Add this new state
  const [imagesNewlyAdded, setImagesNewlyAdded] = useState(false);
  // estado del formulario
  console.log(isEditing);
   // Other existing state...
   const [state, setState] = useState({
    tipoTask: tipo,
    titulo: isEditing ? itemData.name : "",
    description: isEditing ? itemData.description : "",
    location: isEditing ? itemData.location : "",
    horas: isEditing ? itemData.horas : "",
    comments: isEditing ? itemData.comments : "",
    selectedIcon: isEditing ? itemData.icon : "local-shipping" as keyof typeof MaterialIcons.glyphMap,
    fecha_creacion: isEditing ? itemData.fecha_creacion : "",
    images: isEditing && itemData.image ? JSON.parse(itemData.image) : [],
  });
    console.log(itemData);
    /* 
      {"comments": "Bsbd", "created_at": "2025-04-04T17:52:18.000000Z", "description": "Bsjd", "fecha_creacion": "2025-04-03", "horas": "Bsbd", "icon": "fa-local-shipping", "id": 24, "image": "[\"1743789138_67f01c522bae6.jpeg\",\"1743789138_67f01c522bbfe.jpeg\"]", "location": "Bsbd", "name": "Img 1", "project_id": 1, "status": "pendiente", "tracking_id": 2, "updated_at": "2025-04-04T17:52:18.000000Z"}
    */

  const [tipoActual, setTipoActual] = useState(tipo === "edit" ? "pendiente" : tipo);
  // estados para el modal de confirmación
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [data, setData] = useState({
    id: "1",
    nombres: "Piero",
    apellidos: "Rodriguez",
    email: "icemail@gmail.com",
    email_contact: "emailcontact@gmail.com",
    telefono: "123456789",
    uri: '',
    user_code: "12345",
  });
  // Interfaz para la referencia del componente

  React.useEffect(() => {
    getSesion().then((StoredSesion : any) => {
      let sesion = JSON.parse(StoredSesion);
      console.log(sesion);
      setData(sesion);
        
    });
  }, [ ]);


  useEffect(() => {
    // date es la fecha pasada como prop para crear la actividad
    // Convertir formato de fecha "y/m" a "yyyy-mm-dd"
    let newDate = date.split("/").reverse().join("-");
    newDate = new Date().getFullYear() + "-" + newDate;
    newDate = new Date(newDate).toISOString().split('T')[0];
    setState(prevState => ({ ...prevState, fecha_creacion: newDate })); // añadiendo fecha de creación al formulario
  }, []);
  React.useEffect(() => {
    const fetchSessionAndCheckAdmin = async () => {
      try {
        const storedSession = await getSesion();
        if (!storedSession) {
          throw new Error('No session found');
        }
        const session = JSON.parse(storedSession);
        console.log(session);
        setData(session);
        
        // Verifica si el usuario es admin global
        if (session?.is_admin === 1) {
          setIsAdmin(true);
          return; // Si ya sabemos que es admin global, no necesitamos hacer la consulta
        }
        
        // Si no es admin global, verificamos si es admin en el proyecto actual
        const response = await axios.post(
          "https://centroesteticoedith.com/endpoint/project/check-attachment",
          { project_id: project_id },
          { headers: { "Content-Type": "application/json" } }
        );
        
        const apiResponse = response.data;
        
        // Verifica si el usuario es admin en este proyecto específico
        const userIsAdmin = apiResponse.users.some((user: { id: number; is_admin: number }) =>
          user.id === session?.id && user.is_admin === 1
        );
        
        setIsAdmin(userIsAdmin);
        console.log(`isAdmin: ${userIsAdmin}`);
        
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    fetchSessionAndCheckAdmin();
  }, [project_id]); 

  useEffect(() => {
    if (activity) {
      setState({
        tipoTask: activity.status,
        titulo: activity.name,
        description: activity.description,
        location: activity.location,
        horas: activity.horas,
        comments: activity.comments,
        selectedIcon: activity.icon.replace('fa-', '') as keyof typeof MaterialIcons.glyphMap,
        fecha_creacion: activity.fecha_creacion,
        images: activity.image ? 
          (typeof activity.image === 'string' ? JSON.parse(activity.image) : activity.image) 
          : [],
      });
    }
  }, [activity]);

  // Función para actualizar el estado (Pendiente,  Programado, Completado) del formulario
  const updateState = (updates: Partial<typeof state>) => { // recibo un objeto con los campos a actualizar en el parametro updates
    setState(prevState => ({ ...prevState, ...updates })); // fijo los valores del estado con los valores del objeto updates
  };

  // Función para actualizar el valor de un campo del formulario
  const handleFieldChange = (field: string, value: string) => { // recibo el nombre del campo y el valor a actualizar
    updateState({ [field]: value } as Partial<typeof state>); // fijo los valores del estado con los valores del objeto updates
  };

  // 2. Updated picker functions for multiple images
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showConfirmationModal("Error", "Se necesita permiso para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Get the URIs from the selected assets
      const newImageUris = result.assets.map(asset => asset.uri);
      
      // Update state by adding new images to existing ones
      updateState({ 
        images: [...state.images, ...newImageUris] 
      });
      
      // Set flag to true when images are added
      setImagesNewlyAdded(true);
      
      // Add this console.log to debug
      console.log('Updated images array:', [...state.images, ...newImageUris]);
    }
  };
  // Function to take a photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showConfirmationModal("Error", "Se necesita permiso para acceder a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Add the new photo to the existing images array
      updateState({ 
        images: [...state.images, result.assets[0].uri] 
      });
      
      // Set flag to true when image is added
      setImagesNewlyAdded(true);
    }
  };

  // Function to remove a specific image by its index
  const removeImage = (indexToRemove: number) => {
    updateState({
      images: state.images.filter((_: string, index: number) => index !== indexToRemove)
    });
  };


  // Función para preparar los datos de la actividad
  const prepareActivityData = () => {
    // Convertir ambas fechas a objetos Date para comparación adecuada
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación justa
    const todayString = today.toISOString().split('T')[0];
    // Suponiendo que state.fecha_creacion es un string en formato 'YYYY-MM-DD'
    const fechaCreacion = new Date(state.fecha_creacion);
    fechaCreacion.setHours(0, 0, 0, 0);
    const status = state.fecha_creacion > todayString ? "programado" : tipoActual.toLowerCase();

    // Definimos la interfaz para el objeto data
    interface ActivityData {
      project_id: number;
      tracking_id: number;
      name: string;
      description: string;
      location: string;
      horas: string;
      status: string;
      icon: string;
      comments: string;
      fecha_creacion: string;
      images?: string[]; // Add this line for images array
      id?: number;
    }

    let data: ActivityData = {
      project_id,
      tracking_id,
      name: state.titulo,
      description: state.description,
      location: state.location,
      horas: state.horas,
      status: status,
      icon: `fa-${state.selectedIcon}`,
      comments: state.comments,
      fecha_creacion: state.fecha_creacion,
      images: state.images, // Include the images array
    };

    if (isEditing) {
      data.id = itemData.id;
    }

    console.log(data);
    return data;
};



const handleCreateActivity = async (): Promise<boolean> => {
  // Validación
  if (!state.titulo.trim()) {
    showConfirmationModal("Error", "El título es obligatorio");
    return false;
  }

  const activityData = prepareActivityData();

  try {
    // If there are images, we need to create a FormData object
    if (state.images.length > 0) {
      const formData = new FormData();
      
      // Add all the activity data (except images)
      Object.entries(activityData).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, String(value));
        }
      });
      
      // Add each image to the FormData
      state.images.forEach((imageUri: string, index: number) => {
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append(`images[${index}]`, {
          uri: imageUri,
          name: `photo_${index}.${fileType}`,
          type: `image/${fileType}`
        } as any);
      });
      
      // Send the formData to the server
      const response = await axios.post(
        'https://centroesteticoedith.com/endpoint/activities/create',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            'Cookie': 'XSRF-TOKEN=...'
          }
        }
      );
    } else {
      // If there are no images, send the JSON data as before
      const response = await axios.post(
        'https://centroesteticoedith.com/endpoint/activities/create',
        activityData,
        {
          headers: {
            "Content-Type": "application/json",
            'Cookie': 'XSRF-TOKEN=...'
          }
        }
      );
    }

    showConfirmationModal("Éxito", "Actividad creada correctamente");
    setTimeout(() => {
      resetForm();
    }, 3000);
    return true;
  } catch (error) {
    console.error('Error al crear la actividad:', error);
    showConfirmationModal("Error", "No se pudo crear la actividad. Intente nuevamente.");
    return false;
  }
};

  const handleUpdateActivity = async (): Promise<boolean> => {
    // Validación
    if (!state.titulo.trim()) {
      showConfirmationModal("Error", "El título es obligatorio");
      return false;
    }

    const activityData = prepareActivityData(); // Preparo los datos de la actividad

    try {
      console.log(activityData);
      const response = await axios.put(
        `https://centroesteticoedith.com/endpoint/activities/${itemData.id}`,
        activityData,
        {
          headers: {
            "Content-Type": "application/json",
            'Cookie': 'XSRF-TOKEN=...' // Usar el mismo token que en el componente padre
          }
        }
      );

      showConfirmationModal("Éxito", "Actividad actualizada correctamente");
      setTimeout(() => {
        resetForm();
      }, 3000);
      return true;
    } catch (error) {
      console.error('Error al actualizar la actividad:', error);
      showConfirmationModal("Error", "No se pudo actualizar la actividad. Intente nuevamente.");
      return false;
    }
  };

  // Función crear actividad pero con el estado "completado"
  const finishTask = async (): Promise<boolean> => {
    // Crear una copia de los datos actuales
    const activityData = {
      ...prepareActivityData(),
      status: "completado" // Forzar el estado a "completado" explícitamente
    };

    try {
      console.log(activityData);
      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url: isEditing
          ? `https://centroesteticoedith.com/endpoint/activities/${itemData.id}`
          : 'https://centroesteticoedith.com/endpoint/activities/create',
        data: activityData,
        headers: {
          "Content-Type": "application/json",
          'Cookie': 'XSRF-TOKEN=...'
        }
      });

      showConfirmationModal("Éxito", `Actividad ${isEditing ? 'actualizada' : 'completada'} correctamente`);
      setTimeout(() => {
        resetForm();
        if (hideModal) {
          hideModal(); // Cerrar el modal después de completar la actividad
        }
      }, 2000);
      return true;
    } catch (error) {
      console.error('Error al finalizar la actividad:', error);
      showConfirmationModal("Error", `No se pudo ${isEditing ? 'actualizar' : 'finalizar'} la actividad. Intente nuevamente.`);
      return false;
    }
  };

  // Enviar métodos al componente padre a través de la referencia
  useImperativeHandle(ref, () => ({
    handleCreateActivity, // Método para crear una actividad
    finishTask, // Método para finalizar una actividad
    handleUpdateActivity, // Método para actualizar una actividad
  }));

  const resetForm = () => {
    setState({
      tipoTask: tipoActual,
      titulo: "",
      description: "",
      location: "",
      horas: "",
      comments: "",
      selectedIcon: "local-shipping",
      fecha_creacion: state.fecha_creacion,
      images: [], // Reset the images array
    });
  };

  const handleSubmit = async () => {
    if (isEditing) {
      await handleUpdateActivity();
    } else {
      await handleCreateActivity();
    }
  };

  const showConfirmationModal = (title: string, message: string) => {
    setModalMessage(message);
    setConfirmationModalVisible(true);
  };

  const hideConfirmationModal = () => {
    setConfirmationModalVisible(false);
  };

  console.log('Parsed images:', state.images);

  return (
    <View style={{ backgroundColor: "#0a3649" }}>
      <ExpoStatusBar style="light" />
      <ScrollView>
        <View>
          {/* Componente Indicador de Estado e Imagen */}
          <StatusIndicator tipoTask={state.tipoTask} />

          {/* Componente Sección de Título */}
          <TitleSection
            titulo={state.titulo}
            onTituloChange={(text) => updateState({ titulo: text })}
            onFinishTask={finishTask}
            isAdmin={isAdmin}
            images={state.images}
            onTakePhoto={takePhoto}
            onPickImages={pickImages}
            onRemoveImage={removeImage}
            imagesNewlyAdded={imagesNewlyAdded} // Pass the new flag
          />

          {/* Componente Campos del Formulario */}
          <FormFields
            description={state.description}
            location={state.location}
            horas={state.horas}
            comments={state.comments}
            onValueChange={handleFieldChange}
          />

          {/* Componente Selector de Íconos */}
          <IconSelector
            selectedIcon={state.selectedIcon}
            onIconSelect={(icon) => updateState({ selectedIcon: icon })}
          />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
          backgroundColor: "#dedede",
          borderRadius: 5,
        }}
        onPress={handleSubmit}
      >
        <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
          {isEditing ? 'Actualizar Actividad' : 'Crear Actividad'}
        </Text>
      </TouchableOpacity>

      {/* Modal de Confirmación */}
      <Modal transparent={true} animationType="slide" visible={confirmationModalVisible}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={modalStyles.button} onPress={hideConfirmationModal}>
              <Text style={modalStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

// Referencia al componente
export interface ActivityItemCreateRef {
  handleCreateActivity: () => Promise<boolean>; // Método para crear una actividad
  finishTask: () => Promise<boolean>; // Método para finalizar una tarea
  handleUpdateActivity: () => Promise<boolean>; // Método para actualizar una actividad
}

// Opciones de íconos
const ICON_OPTIONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  "local-shipping",
  "directions-car",
  "ac-unit",
  "adb",
  "agriculture",
];

// Íconos recientes
const RECENT_ICONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  "local-shipping",
  "directions-car",
];

// Componente indicador de estado e imagen
const StatusIndicator = ({ tipoTask }: { tipoTask: string }) => {
  const getStatusColor = () => { // Obtiene el color del estado
    switch (tipoTask.toLowerCase()) {
      case "programado": return "#0a3649";
      case "pendiente": return "#d1a44c";
      case "completado": return "#4ec291";
      default: return "#0a3649";
    }
  };

  const renderStatusIcon = () => {  // Renderiza el ícono del estado
    switch (tipoTask.toLowerCase()) {
      case "programado":
        return <MaterialCommunityIcons name="progress-clock" size={20} color="#d1a44c" />;
      case "pendiente":
        return (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <MaterialIcons name="agriculture" size={24} color="#eee" />
            <AntDesign name="clockcircle" size={24} color="#d1a44c" />
          </View>
        );
      case "completado":
        return (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <MaterialIcons name="agriculture" size={24} color="#eee" />
            <MaterialCommunityIcons name="clock-check" size={24} color="#4ec291" />
          </View>
        );
    }
  };

  return (
    <>     
      <View
        style={[
          styles.statusProgramado,
          {
            backgroundColor: getStatusColor(),
            borderTopColor: tipoTask.toLowerCase() === "completado" ? "#0a3649" : "#d1a44c",
            borderBottomColor: tipoTask.toLowerCase() === "completado" ? "#0a3649" : "#d1a44c",
          },
        ]}
      >
        <Text
          style={{
            fontSize: 14,
            color: tipoTask.toLowerCase() === "programado" ? "#d1a44c" : "#0a3649",
          }}
        >
          {tipoTask}
        </Text>
      </View>
    </>
  );
};

// Componente de sección de título
const TitleSection = ({
  titulo,
  onTituloChange,
  onFinishTask,
  isAdmin,
  images,
  onTakePhoto,
  onPickImages,
  onRemoveImage,
  imagesNewlyAdded, // Use this prop
}: TitleSectionProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <View style={{ backgroundColor: "#0a3649", padding: 20 }}>
      {/* Image Slider - only show when there are images to display */}
      {images.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ height: 200, width: '100%', marginBottom: 10 }}>
            <Image 
              source={{ 
                uri: images[activeImageIndex].startsWith('file://') || images[activeImageIndex].startsWith('content://')
                  ? images[activeImageIndex]
                  : images[activeImageIndex].startsWith('http')
                    ? images[activeImageIndex]
                    : `https://centroesteticoedith.com/endpoint/images/activities/${images[activeImageIndex]}`
              }} 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: 10 
              }}
              resizeMode="cover"
            />
          </View>
          
          {/* Thumbnail scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ height: 60 }}
          >
            {images.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveImageIndex(index)}
                style={{
                  marginRight: 10,
                  borderWidth: 2,
                  borderColor: activeImageIndex === index ? '#33baba' : 'transparent',
                  borderRadius: 5,
                }}
              >
                <Image
                  source={{ 
                    uri: image.startsWith('file://') || image.startsWith('content://')
                      ? image
                      : image.startsWith('http')
                        ? image
                        : `https://centroesteticoedith.com/endpoint/images/activities/${image}`
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 5,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Existing title input */}
      <TextInput
        style={{
          fontSize: 35,
          width: "70%",
          color: "white",
          marginBottom: 10,
          textAlignVertical: "top",
        }}
        value={titulo}
        onChangeText={onTituloChange}
        placeholder="Ingrese el título"
        placeholderTextColor="#888"
        multiline={true}
        numberOfLines={4}
      />
      
      {/* Display image gallery when there are images */}
      {images.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ color: '#dedede', marginBottom: 8, fontSize: 16 }}>
            Imágenes ({images.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((imageUri, index) => (
              <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                <Image 
                  source={{ 
                    uri: imageUri.startsWith('file://') || imageUri.startsWith('content://')
                      ? imageUri
                      : imageUri.startsWith('http')
                        ? imageUri 
                        : `https://centroesteticoedith.com/endpoint/images/activities/${imageUri}`
                  }} 
                  style={{ width: 100, height: 100, borderRadius: 5 }} 
                  resizeMode="cover" 
                />
                <TouchableOpacity 
                  style={{ 
                    position: 'absolute', 
                    top: 5, 
                    right: 5, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    padding: 3, 
                    borderRadius: 12 
                  }}
                  onPress={() => onRemoveImage(index)}
                >
                  <MaterialIcons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.hr} />
      <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            backgroundColor: !isAdmin ? "#0a455e" : "#dedede",
            borderRadius: 5,
          }}
          onPress={onFinishTask}
          disabled={!isAdmin}
        >
          <Text style={{ fontSize: 14, color: !isAdmin ? "#fff" : "#0a455e", padding: 15 }}>
            Finalizar
          </Text>
        </TouchableOpacity>

        {/* Image options menu */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              backgroundColor: "#dedede",
              borderRadius: 5,
            }}
            onPress={() => {
              // Show image options - can be implemented as a modal or action sheet
              Alert.alert(
                "Subir Imágenes",
                "Seleccione una opción",
                [
                  { text: "Tomar Foto", onPress: onTakePhoto },
                  { text: "Elegir de Galería", onPress: onPickImages },
                  { text: "Cancelar", style: "cancel" }
                ]
              );
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <MaterialIcons name="photo-camera" size={20} color="#0a455e" />
              <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
                Subir Imágenes
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      </>
    </View>
  );
};

// Componente de campos del formulario
const FormFields = ({
  description,
  location,
  horas,
  comments,
  onValueChange
}: {
  description: string,
  location: string,
  horas: string,
  comments: string,
  onValueChange: (field: string, value: string) => void
}) => {
  const fields = [
    {
      icon: <Entypo name="text" size={24} color="white" />,
      placeholder: "Descripción",
      value: description,
      field: "description"
    },
    {
      icon: <MaterialIcons name="location-on" size={24} color="white" />,
      placeholder: "Ubicación",
      value: location,
      field: "location"
    },
    {
      icon: <MaterialCommunityIcons name="clock-outline" size={24} color="white" />,
      placeholder: "Horario",
      value: horas,
      field: "horas"
    },
    {
      icon: <MaterialCommunityIcons name="comment-processing" size={24} color="white" />,
      placeholder: "Comentarios (opcional)",
      value: comments,
      field: "comments"
    }
  ];

  return (
    <View>
      {fields.map((inputConfig, index) => (
        <View key={index} style={styles.inputContainer}>
          {inputConfig.icon}
          <TextInput
            style={styles.input}
            placeholder={inputConfig.placeholder}
            placeholderTextColor="#888"
            value={inputConfig.value}
            onChangeText={(text) => onValueChange(inputConfig.field, text)}
          />
        </View>
      ))}
    </View>
  );
};

// Componente selector de íconos
const IconSelector = ({ selectedIcon, onIconSelect }: { selectedIcon: keyof typeof MaterialIcons.glyphMap, onIconSelect: (icon: keyof typeof MaterialIcons.glyphMap) => void }) => {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#05222f",
        }}
      >
        <Text style={{ fontSize: 17, color: "#dedede", padding: 15 }}>
          Seleccionar un ícono
        </Text>
        <MaterialIcons
          name="arrow-forward-ios"
          size={15}
          color="#dedede"
          style={{ marginTop: 5 }}
        />
      </View>

      <View style={{ backgroundColor: "#0a3649" }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          <View style={styles.iconRow}>
            {RECENT_ICONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onIconSelect(icon)}
              >
                <MaterialIcons
                  name={icon}
                  size={40}
                  color={selectedIcon === icon ? "white" : "grey"}
                  style={styles.icon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos los íconos</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onIconSelect(icon)}
              >
                <MaterialIcons
                  name={icon}
                  size={40}
                  color={selectedIcon === icon ? "white" : "grey"}
                  style={styles.icon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

export default ActivityItemCreate;

const modalStyles = StyleSheet.create({
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
});
