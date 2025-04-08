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
  ActivityIndicator,
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
import { iconImports, iconsFiles } from './icons';


// Tipos simplificados
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
  images?: string[];
  id?: number;
}

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

// Add at the top with other interfaces
export interface ActivityItemCreateRef {
  handleCreateActivity: () => Promise<boolean>;
  finishTask: () => Promise<boolean>;
  handleUpdateActivity: () => Promise<boolean>;
}

interface ItemData {
  id: number;
  name: string;
  description: string;
  location: string;
  horas: string;
  comments: string;
  icon: string;
  image?: string;
}

interface FormDataState {
  titulo: string;
  description: string;
  location: string;
  horas: string;
  comments: string;
  selectedIcon: string; // Cambiado de keyof typeof MaterialIcons.glyphMap a string
  fecha_creacion: string;
  images: string[];
  status: ActivityStatus;
}

type ActivityStatus = 'programado' | 'pendiente' | 'completado';

// Componente principal
const ActivityItemCreate = forwardRef<ActivityItemCreateRef, ActivityItemCreateProps>(({ 
  tipo, 
  project_id, 
  tracking_id, 
  date, 
  isEditing = false, 
  itemData, 
  activity, 
  hideModal 
}, ref) => {
  // Estado unificado
  const [formData, setFormData] = useState<FormDataState>({
    titulo: isEditing ? itemData?.name : "",
    description: isEditing ? itemData?.description : "",
    location: isEditing ? itemData?.location : "",
    horas: isEditing ? itemData?.horas : "",
    comments: isEditing ? itemData?.comments : "",
    selectedIcon: isEditing ? itemData?.icon : "local-shipping.svg", // Valor por defecto actualizado
    fecha_creacion: "",
    images: isEditing && itemData?.image ? JSON.parse(itemData.image) : [],
    status: (tipo === "edit" ? "pendiente" : tipo) as ActivityStatus
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Efectos simplificados
  useEffect(() => {
    const checkAdminStatus = async () => {
      const session = JSON.parse(await getSesion() || "{}");
      if (session?.is_admin === 1) {
        setIsAdmin(true);
        return;
      }

      try {
        const response = await axios.post(
          "https://centroesteticoedith.com/endpoint/project/check-attachment",
          { project_id }
        );
        setIsAdmin(response.data.users.some((user: any) => 
          user.id === session?.id && user.is_admin === 1
        ));
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
    setInitialDate();
  }, []);

  // Funciones auxiliares
  const setInitialDate = () => {
    const newDate = new Date().getFullYear() + "-" + date.split("/").reverse().join("-");
    setFormData(prev => ({ ...prev, fecha_creacion: new Date(newDate).toISOString().split('T')[0] }));
  };

  const handleImagePicker = async (useCamera = false) => {
    const { status } = await (useCamera ? 
      ImagePicker.requestCameraPermissionsAsync() : 
      ImagePicker.requestMediaLibraryPermissionsAsync());

    if (status !== 'granted') {
      showMessage("Error", "Se necesitan permisos para acceder a " + (useCamera ? "la cámara" : "la galería"));
      return;
    }

    const result = await (useCamera ?
      ImagePicker.launchCameraAsync({ quality: 0.8 }) :
      ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8
      }));

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  // Funciones principales
  const handleSubmit = async (status = formData.status) => {
    if (!formData.titulo.trim()) {
      showMessage("Error", "El título es obligatorio");
      return false;
    }

    const activityData: ActivityData = {
      project_id,
      tracking_id,
      name: formData.titulo,
      description: formData.description,
      location: formData.location,
      horas: formData.horas,
      status,
      icon: formData.selectedIcon, // Ya no es necesario agregar 'fa-'
      comments: formData.comments || "",
      fecha_creacion: formData.fecha_creacion,
      images: formData.images,
      ...(isEditing && { id: itemData.id })
    };

    try {
      setIsLoading(true);
      
      if (formData.images.length > 0) {
        const formDataObj = new FormData();
        Object.entries(activityData).forEach(([key, value]) => {
          if (key !== 'images') {
            formDataObj.append(key, String(value));
          }
        });

        formData.images.forEach((imageUri, index) => {
          const fileType = imageUri.split('.').pop();
          formDataObj.append(`images[${index}]`, {
            uri: imageUri,
            name: `photo_${index}.${fileType}`,
            type: `image/${fileType}`
          } as any);
        });

        console.log('FormData:', formDataObj); // Debugging line

        await axios.post(
          'https://centroesteticoedith.com/endpoint/activities/create',
          formDataObj,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        const url = isEditing 
          ? `https://centroesteticoedith.com/endpoint/activities/${itemData.id}`
          : 'https://centroesteticoedith.com/endpoint/activities/create';
        
        await axios({
          method: isEditing ? 'put' : 'post',
          url,
          data: activityData,
          headers: { "Content-Type": "application/json" }
        });
      }

      setIsLoading(false);
      showMessage("Éxito", `Actividad ${isEditing ? 'actualizada' : 'creada'} correctamente`);
      if (hideModal) setTimeout(hideModal, 2000);
      return true;
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      showMessage("Error", `No se pudo ${isEditing ? 'actualizar' : 'crear'} la actividad`);
      return false;
    }
  };
  
  const handleSubmitFinish = async () => {
   try{
    await axios({
      method: 'post',
      url: `https://centroesteticoedith.com/endpoint/activities/complete`,
      data: { id: itemData.id,},
      headers: { "Content-Type": "application/json" }
    });
    setIsLoading(false);
    showMessage("Éxito", `Actividad ${isEditing ? 'actualizada' : 'creada'} correctamente`);
    if (hideModal) setTimeout(hideModal, 2000);
    return true;

   }catch (error) {
    console.error('Error:', error);
    setIsLoading(false);
    showMessage("Error", `No se pudo ${isEditing ? 'actualizar' : 'crear'} la actividad`);
    return false;
   }
  };

  const showMessage = (title: string, message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    handleCreateActivity: () => handleSubmit(),
    finishTask: () => handleSubmit('completado'),
    handleUpdateActivity: () => handleSubmit()
  }));

  return (
    <View style={{ backgroundColor: "#0a3649", flex: 1 }}>
      <ExpoStatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Componente Sección de Título */}
          <TitleSection
            titulo={formData.titulo}
            onTituloChange={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
            onFinishTask={() => handleSubmitFinish()}
            isAdmin={isAdmin}
            images={formData.images}
            onTakePhoto={() => handleImagePicker(true)}
            onPickImages={() => handleImagePicker()}
            onRemoveImage={(index) => setFormData(prev => ({
              ...prev,
              images: prev.images.filter((_: string, i: number) => i !== index)
            }))}
            itemData={itemData}
            status={formData.status} // Añadir esta prop
          />
          
          {/* Componente Campos del Formulario */}
          <FormFields
            description={formData.description}
            location={formData.location}
            horas={formData.horas}
            comments={formData.comments}
            onValueChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          />

          {/* Componente Selector de Íconos */}
          <IconSelector
            selectedIcon={formData.selectedIcon}
            onIconSelect={(icon) => setFormData(prev => ({ ...prev, selectedIcon: icon }))}
          />
        </View>
      </ScrollView>
     
      {/* Modal de Confirmación */}
      <Modal transparent={true} animationType="slide" visible={showModal}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={modalStyles.button} onPress={() => setShowModal(false)}>
              <Text style={modalStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay - Shows only when isLoading is true */}
      {isLoading && (
        <Modal transparent={true} visible={true}>
          <View style={loadingStyles.overlay}>
            <View style={loadingStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#33baba" />
              <Text style={loadingStyles.loadingText}>
                {formData.images.length > 0 
                  ? `Subiendo ${formData.images.length} ${formData.images.length === 1 ? 'imagen' : 'imágenes'}...` 
                  : 'Procesando...'
                }
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
});

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
interface TitleSectionProps {
  titulo: string;
  onTituloChange: (text: string) => void;
  onFinishTask: () => void;
  isAdmin: boolean;
  images: string[];
  onTakePhoto: () => void;
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  itemData?: any;
  status: string; // Añadir esta prop
}

const TitleSection: React.FC<TitleSectionProps> = ({
  titulo,
  onTituloChange,
  onFinishTask,
  isAdmin,
  images,
  onTakePhoto,
  onPickImages,
  onRemoveImage,
  itemData,
  status
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <View style={{ backgroundColor: "#0a3649", padding: 20 }}>
      {/* Image Slider - only show when there are images to display */}
      {images.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ height: 200, width: '100%', marginBottom: 10, position: 'relative' }}>
            {/* Navigation Buttons */}
            <TouchableOpacity 
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: [{ translateY: -20 }],
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => setActiveImageIndex((prev) => 
                prev === 0 ? images.length - 1 : prev - 1
              )}
            >
              <MaterialIcons name="chevron-left" size={30} color="white" />
            </TouchableOpacity>

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

            <TouchableOpacity 
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: [{ translateY: -20 }],
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => setActiveImageIndex((prev) => 
                prev === images.length - 1 ? 0 : prev + 1
              )}
            >
              <MaterialIcons name="chevron-right" size={30} color="white" />
            </TouchableOpacity>

            {/* Dots Indicator */}
            <View style={{
              position: 'absolute',
              bottom: 10,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === activeImageIndex ? '#33baba' : 'rgba(255, 255, 255, 0.5)'
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      )}
      <StatusIndicator tipoTask={status} /> 
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
      
      {/* Display image gallery when there are images and no itemData */}
      {images.length > 0 && !itemData && (
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
const IconSelector = ({ 
  selectedIcon, 
  onIconSelect 
}: { 
  selectedIcon: string, 
  onIconSelect: (icon: string) => void 
}) => {
  const recentIcons = iconsFiles.slice(0, 5);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={{ backgroundColor: "#0a3649", marginBottom: 20 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#05222f",
          padding: 15,
        }}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={{ fontSize: 17, color: "#dedede" }}>
          Seleccionar un ícono
        </Text>
        <MaterialIcons
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#dedede"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View>
          <View style={[styles.section, { maxHeight: 120 }]}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconRow}>
                {recentIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      console.log("Selected icon:", icon);
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    <Image
                      source={iconImports[icon as keyof typeof iconImports]}
                      style={styles.iconImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={[styles.section, { maxHeight: 600 }]}>
            <Text style={styles.sectionTitle}>Todos los íconos</Text>
            <ScrollView 
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.iconGrid}>
                {iconsFiles.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      console.log("Icon clicked:", icon);
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    <Image
                      source={iconImports[icon as keyof typeof iconImports]}
                      style={styles.iconImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

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

// New loading overlay styles
const loadingStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#0A3649',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  }
});

export default ActivityItemCreate;