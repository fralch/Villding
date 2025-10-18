import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { getSesion } from '../../hooks/localStorageUser';
import {
  MaterialCommunityIcons,
  Entypo,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./styles/ActivityItemCreateStyles";
import { iconImports, iconsFiles } from './icons';
import { API_BASE_URL } from '../../config/api';

// Definición de tipos simplificados para los datos de la actividad
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
}

// Definición de tipos para las props del componente
interface ActivityItemCreateProps {
  project_id: number;
  tracking_id: number;
  tipo: string;
  date: string;
  hideModal?: () => void;
}

// Definición de tipos para las referencias del componente
export interface ActivityItemCreateRef {
  handleCreateActivity: () => Promise<boolean>;
}

// Definición de tipos para el estado del formulario
interface FormDataState {
  titulo: string;
  description: string;
  location: string;
  horaInicio: string;
  horaFin: string;
  comments: string;
  selectedIcon: string;
  fecha_creacion: string;
  images: string[];
  status: ActivityStatus;
}

// Tipos de estado de la actividad
type ActivityStatus = 'programado' | 'pendiente' | 'completado';

// Componente principal
const ActivityItemCreate = forwardRef<ActivityItemCreateRef, ActivityItemCreateProps>(({
  tipo,
  project_id,
  tracking_id,
  date,
  hideModal
}, ref) => {
  // Estado unificado para manejar los datos del formulario
  const [formData, setFormData] = useState<FormDataState>({
    titulo: "",
    description: "",
    location: "",
    horaInicio: "07:00",
    horaFin: "",
    comments: "",
    selectedIcon: "local-shipping.svg",
    fecha_creacion: "",
    images: [],
    status: (tipo === "edit" ? "pendiente" : tipo) as ActivityStatus
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Efecto para verificar el estado de administrador al montar el componente
  useEffect(() => {
    const checkAdminStatus = async () => {
      const session = JSON.parse(await getSesion() || "{}");
      if (session?.is_admin === 1) {
        setIsAdmin(true);
        return;
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/project/check-attachment`,
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

  // Función para establecer la fecha inicial
  const setInitialDate = () => {
    const newDate = new Date().getFullYear() + "-" + date.split("/").reverse().join("-");
    setFormData(prev => ({ ...prev, fecha_creacion: new Date(newDate).toISOString().split('T')[0] }));
  };

  // Modificación en la función handleImagePicker para limitar a 5 imágenes
  const handleImagePicker = async (useCamera = false) => {
    // Verificar primero si ya se alcanzó el límite de imágenes
    if (formData.images.length >= 5) {
      showMessage("Límite alcanzado", "Solo se permite un máximo de 5 imágenes");
      return;
    }

    const { status } = await (useCamera ?
      ImagePicker.requestCameraPermissionsAsync() :
      ImagePicker.requestMediaLibraryPermissionsAsync());

    if (status !== 'granted') {
      showMessage("Error", "Se necesitan permisos para acceder a " + (useCamera ? "la cámara" : "la galería"));
      return;
    }

    // In your handleImagePicker function:
    const result = await (useCamera
      ? ImagePicker.launchCameraAsync({ quality: 0.8 })
      : ImagePicker.launchImageLibraryAsync({
          // Instead of using MediaTypeOptions enum
          // Try using the string value directly
          mediaTypes: ["images"],  // or ["image"] depending on the expected format
          allowsMultipleSelection: true,
          quality: 0.5
        })
      );

    if (!result.canceled && result.assets) {
      // Calcular cuántas imágenes podemos agregar sin exceder el límite
      const remainingSlots = 5 - formData.images.length;
      const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      
      // Si se seleccionaron más imágenes de las permitidas, mostrar un mensaje
      if (result.assets.length > remainingSlots) {
        showMessage(
          "Límite alcanzado", 
          `Se han agregado ${newImages.length} de ${result.assets.length} imágenes seleccionadas. Máximo permitido: 5`
        );
      }
    }
  };

  // Función principal para manejar el envío del formulario
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
      horas: formData.horaInicio && formData.horaFin ? `${formData.horaInicio} - ${formData.horaFin}` : "",
      status,
      icon: formData.selectedIcon,
      comments: formData.comments || "",
      fecha_creacion: formData.fecha_creacion,
      images: formData.images
    };

    try {
      setIsLoading(true);

      const url = `${API_BASE_URL}/activities/create`;

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

        const response = await axios({
          method: 'post',
          url,
          data: formDataObj,
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log('Respuesta del servidor:'); 
        console.log(response.data);

      } else {
        await axios({
          method: 'post',
          url,
          data: activityData,
          headers: { "Content-Type": "application/json" }
        });
      }

      setIsLoading(false);
      showMessage("Éxito", "Actividad creada correctamente");
      if (hideModal) setTimeout(hideModal, 2000);
      return true;
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      showMessage("Error", "No se pudo crear la actividad");
      return false;
    }
  };

  // Función para mostrar mensajes en el modal
  const showMessage = (title: string, message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Exponer método al componente padre
  useImperativeHandle(ref, () => ({
    handleCreateActivity: () => handleSubmit()
  }));

  return (
    <View style={{ backgroundColor: "#0a3649", flex: 1 }}>
      <ExpoStatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          <TitleSection
            titulo={formData.titulo}
            onTituloChange={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
            isAdmin={isAdmin}
            images={formData.images}
            onTakePhoto={() => handleImagePicker(true)}
            onPickImages={() => handleImagePicker()}
            onRemoveImage={(index) => setFormData(prev => ({
              ...prev,
              images: prev.images.filter((_: string, i: number) => i !== index)
            }))}
            handleSubmit={(status: string) => handleSubmit(status as ActivityStatus)}
            status={formData.status}
          />

          <FormFields
            description={formData.description}
            location={formData.location}
            horaInicio={formData.horaInicio}
            horaFin={formData.horaFin}
            comments={formData.comments}
            onValueChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          />

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

      {/* Loading Overlay - Muestra solo cuando isLoading es true */}
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
            <AntDesign name="clock-circle" size={24} color="#d1a44c" />
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

// Componente de sección de título (simplificado)
interface TitleSectionProps {
  titulo: string;
  onTituloChange: (text: string) => void;
  isAdmin: boolean;
  images: string[];
  onTakePhoto: () => void;
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  handleSubmit: (status: string) => void;
  status: string;
}

const TitleSection: React.FC<TitleSectionProps> = ({
  titulo,
  onTituloChange,
  isAdmin,
  images,
  onTakePhoto,
  onPickImages,
  onRemoveImage,
  handleSubmit,
  status
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Calcular imágenes restantes
  const remainingImages = 5 - images.length;
  const buttonDisabled = images.length >= 5;
  return (
    <View style={{ backgroundColor: "#0a3649", padding: 20 }}>
      {/* Image Slider - solo se muestra cuando hay imágenes para mostrar */}
      {images.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ height: 200, width: '100%', marginBottom: 10, position: 'relative' }}>
            {/* Botones de navegación */}
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
                    : `${API_BASE_URL}/images/activities/${images[activeImageIndex]}`
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

            {/* Indicador de puntos */}
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


      {/* Mostrar galería de imágenes cuando hay imágenes */}
      {images.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ color: '#dedede', marginBottom: 8, fontSize: 16 }}>
            Imágenes ({images.length}/5)
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
                        : `${API_BASE_URL}/images/activities/${imageUri}`
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
      <View style={{ flexDirection: 'row', gap: 10 }}>

        {/* Menú de opciones de imagen - Ahora ocupa todo el ancho */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity 
           onPress={() => handleSubmit('completado')}
           style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            backgroundColor: "#0a455e",
            borderRadius: 5,
            opacity: 1,
          }}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <MaterialIcons name="check" size={20} color="#dedede" />
              <Text style={{ fontSize: 14, color: "#dedede", padding: 15 }}>
                Crear  y finalizar
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              backgroundColor: buttonDisabled ? "#999" : "#dedede",
              borderRadius: 5,
              opacity: buttonDisabled ? 0.7 : 1,
            }}
            onPress={() => {
              if (!buttonDisabled) {
                Alert.alert(
                  "Subir Imágenes",
                  `Seleccione una opción (${remainingImages} imágenes restantes)`,
                  [
                    { text: "Tomar Foto", onPress: onTakePhoto },
                    { text: "Elegir de Galería", onPress: onPickImages },
                    { text: "Cancelar", style: "cancel" }
                  ]
                );
              } else {
                Alert.alert(
                  "Límite alcanzado",
                  "Ha alcanzado el límite de 5 imágenes. Elimine algunas para poder agregar más.",
                  [{ text: "Entendido", style: "cancel" }]
                );
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <MaterialIcons name="photo-camera" size={20} color="#0a455e" />
              <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
                {buttonDisabled ? "Límite de imágenes alcanzado (5/5)" : `Subir Imágenes (${images.length}/5)`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Componente de campos del formulario
const FormFields = ({
  description,
  location,
  horaInicio,
  horaFin,
  comments,
  onValueChange
}: {
  description: string,
  location: string,
  horaInicio: string,
  horaFin: string,
  comments: string,
  onValueChange: (field: string, value: string) => void
}) => {
  const [showTimePickerInicio, setShowTimePickerInicio] = useState(false);
  const [showTimePickerFin, setShowTimePickerFin] = useState(false);
  const [selectedTimeInicio, setSelectedTimeInicio] = useState(() => {
    const date = new Date();
    date.setHours(7, 0, 0, 0); // 7am por defecto
    return date;
  });
  const [selectedTimeFin, setSelectedTimeFin] = useState(new Date());

  // Función para manejar el cambio de hora de inicio en el DateTimePicker
  const onChangeTimeInicio = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePickerInicio(false); // Ocultar el selector independientemente de la acción
    if (event.type === 'set' && selectedDate) { // 'set' significa que el usuario seleccionó una hora
      setSelectedTimeInicio(selectedDate);
      // Formatear la hora seleccionada (HH:MM)
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      onValueChange("horaInicio", formattedTime);
    }
  };

  // Función para manejar el cambio de hora de fin en el DateTimePicker
  const onChangeTimeFin = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePickerFin(false); // Ocultar el selector independientemente de la acción
    if (event.type === 'set' && selectedDate) { // 'set' significa que el usuario seleccionó una hora
      setSelectedTimeFin(selectedDate);
      // Formatear la hora seleccionada (HH:MM)
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      onValueChange("horaFin", formattedTime);
    }
  };

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
            multiline={true}
            numberOfLines={4} 
          />
        </View>
      ))}

      {/* Campos de hora combinados en un solo contenedor */}
      <View style={styles.inputContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="clock" size={24} color="white" style={{ marginRight: 10 }} />
        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={[styles.input, { flex: 0.48, justifyContent: 'center' }]} 
            onPress={() => setShowTimePickerInicio(true)}
          >
            <Text style={{ color: horaInicio ? 'white' : '#888' }}>
              {horaInicio || "Hora de inicio"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.input, { flex: 0.48, justifyContent: 'center' }]} 
            onPress={() => setShowTimePickerFin(true)}
          >
            <Text style={{ color: horaFin ? 'white' : '#888' }}>
              {horaFin || "Hora de fin"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* DateTimePicker para seleccionar la hora de inicio */}
      {showTimePickerInicio && (
        <DateTimePicker
          value={selectedTimeInicio}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeTimeInicio}
        />
      )}

      {/* DateTimePicker para seleccionar la hora de fin */}
      {showTimePickerFin && (
        <DateTimePicker
          value={selectedTimeFin}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeTimeFin}
        />
      )}
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

// Estilos para el overlay de carga
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
