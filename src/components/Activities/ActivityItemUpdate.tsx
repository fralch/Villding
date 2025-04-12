import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { MaterialIcons, Entypo, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { getSesion } from '../../hooks/localStorageUser';
import { Activity } from './Activity';
import { styles } from "./styles/ActivityItemCreateStyles";
import { iconImports, iconsFiles } from './icons';

export interface ActivityItemUpdateRef {
  handleUpdateActivity: () => Promise<boolean>;
}

interface ActivityItemUpdateProps {
  project_id: number;
  tracking_id: number;
  activity: Activity | null;
  date: string;
  hideModal: () => void;
  isAdmin?: boolean;
}

type ActivityStatus = 'Programado' | 'Pendiente' | 'Completado';

const ActivityItemUpdate = forwardRef<ActivityItemUpdateRef, ActivityItemUpdateProps>(
  ({ project_id, tracking_id, activity, date, hideModal, isAdmin: initialIsAdmin = true }, ref) => {
    const [formData, setFormData] = useState({
      titulo: activity?.name || '',
      description: activity?.description || '',
      location: activity?.location || '',
      horas: activity?.horas || '',
      status: activity?.status || 'Pendiente',
      comments: activity?.comments || '',
      selectedIcon: activity?.icon || '',
      // Cambiar esta línea para manejar correctamente las imágenes
      images: activity?.image 
        ? (typeof activity.image === 'string' 
           ? (activity.image.startsWith('[') ? JSON.parse(activity.image) : [activity.image]) 
           : Array.isArray(activity.image) ? activity.image : [activity.image]) 
        : [],
      fecha_creacion: activity?.fecha_creacion || date
    });
    
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Verificar estado de administrador
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
    }, [project_id]);

    // Function to handle showing a message modal
    const showMessage = (message: string) => {
      setModalMessage(message);
      setShowModal(true);
    };

    // Función para manejar imágenes
    const handleImagePicker = async (useCamera = false) => {
      const { status } = await (useCamera ? 
        ImagePicker.requestCameraPermissionsAsync() : 
        ImagePicker.requestMediaLibraryPermissionsAsync());

      if (status !== 'granted') {
        showMessage("Se necesitan permisos para acceder a " + (useCamera ? "la cámara" : "la galería"));
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

    // Función para actualizar la actividad
    const updateActivity = async (newStatus?: ActivityStatus): Promise<boolean> => {
      if (!activity?.id) return false;
      
      if (!formData.titulo.trim()) {
        showMessage('Por favor ingrese un título para la actividad.');
        return false;
      }

      setIsLoading(true);

      try {
        const activityData = {
          project_id,
          tracking_id,
          name: formData.titulo,
          description: formData.description,
          location: formData.location,
          horas: formData.horas,
          status: newStatus || formData.status,
          comments: formData.comments,
          icon: formData.selectedIcon,
          fecha_creacion: formData.fecha_creacion,
          id: activity.id
        };

        let response;

        if (formData.images.length > 0) {
          const formDataObj = new FormData();
          Object.entries(activityData).forEach(([key, value]) => {
            if (key !== 'images') {
              formDataObj.append(key, String(value));
            }
          });

          formData.images.forEach((imageUri: string, index: number) => {
            // Solo procesar nuevas imágenes (las que empiezan con file:// o content://)
            if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
              const fileType = imageUri.split('.').pop();
              formDataObj.append(`images[${index}]`, {
                uri: imageUri,
                name: `photo_${index}.${fileType}`,
                type: `image/${fileType}`
              } as any);
            } else {
              // Para imágenes existentes, solo pasamos el nombre
              formDataObj.append(`existing_images[${index}]`, imageUri);
            }
          });

          response = await axios({
            method: 'put',
            url: `https://centroesteticoedith.com/endpoint/activities/${activity.id}`,
            data: formDataObj,
            headers: { "Content-Type": "multipart/form-data" }
          });
        } else {
          response = await axios.put(
            `https://centroesteticoedith.com/endpoint/activities/${activity.id}`,
            activityData
          );
        }

        setIsLoading(false);
        
        if (response.status === 200) {
          showMessage('Actividad actualizada correctamente');
          setTimeout(hideModal, 2000);
          return true;
        }
        return false;
      } catch (error) {
        setIsLoading(false);
        console.error('Error updating activity:', error);
        showMessage('Error al actualizar la actividad. Por favor intente de nuevo.');
        return false;
      }
    };

    // Función específica para completar una tarea
    const handleSubmitFinish = async () => {
      try {
        setIsLoading(true);
        await axios({
          method: 'post',
          url: `https://centroesteticoedith.com/endpoint/activities/complete`,
          data: { id: activity?.id },
          headers: { "Content-Type": "application/json" }
        });
        
        setFormData(prev => ({ ...prev, status: 'Completado' }));
        setIsLoading(false);
        showMessage('Actividad marcada como completada.');
        setTimeout(hideModal, 2000);
        return true;
      } catch (error) {
        console.error('Error completing activity:', error);
        setIsLoading(false);
        showMessage('Error al completar la actividad. Por favor intente de nuevo.');
        return false;
      }
    };

    useImperativeHandle(ref, () => ({
      handleUpdateActivity: () => updateActivity(),
    }));

    return (
      <View style={{ backgroundColor: "#0a3649", flex: 1 }}>
        <ExpoStatusBar style="light" />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1 }}>
            <TitleSection
              titulo={formData.titulo}
              onTituloChange={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
              onFinishTask={() => handleSubmitFinish()}
              isAdmin={isAdmin}
              images={formData.images}
              onTakePhoto={() => handleImagePicker(true)}
              onPickImages={() => handleImagePicker(false)}
              onRemoveImage={(index) => setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_: string, i: number) => i !== index)
              }))}
              itemData={activity}
              status={formData.status}
            />
            
            <FormFields
              description={formData.description}
              location={formData.location}
              horas={formData.horas}
              comments={formData.comments}
              onValueChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />

            <IconSelector
              selectedIcon={formData.selectedIcon}
              onIconSelect={(icon) => setFormData(prev => ({ ...prev, selectedIcon: icon }))}
              iconImports={iconImports}
              iconsFiles={iconsFiles}
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
  }
);

// Componente indicador de estado e imagen
const StatusIndicator = ({ tipoTask }: { tipoTask: string }) => {
  const getStatusColor = () => {
    switch (tipoTask.toLowerCase()) {
      case "programado": return "#0a3649";
      case "pendiente": return "#d1a44c";
      case "completado": return "#4ec291";
      default: return "#0a3649";
    }
  };

  const renderStatusIcon = () => {
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
  status: string;
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
                uri: images[activeImageIndex]?.startsWith('file://') || images[activeImageIndex]?.startsWith('content://')
                  ? images[activeImageIndex]
                  : images[activeImageIndex]?.startsWith('http')
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
      icon: <MaterialCommunityIcons name="comment-outline" size={24} color="white" />,
      placeholder: "Comentarios",
      value: comments,
      field: "comments",
      multiline: true
    }
  ];

  return (
    <View>
      {fields.map((inputConfig, index) => (
        <View key={index} style={styles.inputContainer}>
          {inputConfig.icon}
          <TextInput
            style={[styles.input, inputConfig.multiline && { height: 100, textAlignVertical: 'top' }]}
            placeholder={inputConfig.placeholder}
            placeholderTextColor="#888"
            value={inputConfig.value}
            onChangeText={(text) => onValueChange(inputConfig.field, text)}
            multiline={inputConfig.multiline}
            numberOfLines={inputConfig.multiline ? 4 : 1}
          />
        </View>
      ))}
    </View>
  );
};

// Componente selector de íconos
const IconSelector = ({ 
  selectedIcon, 
  onIconSelect,
  iconImports,
  iconsFiles
}: { 
  selectedIcon: string, 
  onIconSelect: (icon: string) => void,
  iconImports: any,
  iconsFiles: string[]
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
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    {iconImports[icon] ? (
                      <Image
                        source={iconImports[icon]}
                        style={styles.iconImage}
                      />
                    ) : (
                      <MaterialIcons name="error" size={24} color="white" />
                    )}
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
                      onIconSelect(icon);
                    }}
                    style={[
                      styles.iconContainer,
                      selectedIcon === icon && styles.selectedIconContainer
                    ]}
                  >
                    {iconImports[icon] ? (
                      <Image
                        source={iconImports[icon]}
                        style={styles.iconImage}
                      />
                    ) : (
                      <MaterialIcons name="error" size={24} color="white" />
                    )}
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

// Loading overlay styles
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

export default ActivityItemUpdate;