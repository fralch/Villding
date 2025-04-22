// components/TitleSection.tsx
/*  Este componente es responsable de mostrar la sección de título de la actividad */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/ActivityItemCreateStyles';
import StatusIndicator from './StatusIndicator';

// Definición de las propiedades que recibe el componente
interface TitleSectionProps {
  titulo: string; // Título de la actividad
  onTituloChange: (text: string) => void; // Función para manejar cambios en el título
  onFinishTask: () => void; // Función para finalizar la tarea
  isAdmin: boolean; // Indica si el usuario es administrador
  images: string[]; // Lista de imágenes
  onImagesUpdate: (images: string[]) => void; // Función para actualizar imágenes en el padre
  itemData?: any; // Datos adicionales del ítem (opcional)
  status: string; // Estado de la tarea
}

// Componente funcional TitleSection
const TitleSection: React.FC<TitleSectionProps> = ({
  titulo,
  onTituloChange,
  onFinishTask,
  isAdmin,
  images,
  onImagesUpdate,
  itemData,
  status
}) => {
  // Estado para manejar la imagen activa en el slider
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [localImages, setLocalImages] = useState<string[]>(images);
  const [isEditable, setIsEditable] = useState(false);

  // Actualizar las imágenes locales cuando cambien las props
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  // Función para obtener la fuente de la imagen
  const getImageSource = (imageUri: string) => {
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      return { uri: imageUri };
    }
    if (imageUri.startsWith('http')) {
      return { uri: imageUri };
    }
    return { uri: `https://centroesteticoedith.com/endpoint/images/activities/${imageUri}` };
  };

  // Función para manejar la selección de imágenes de la galería
  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se necesitan permisos para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      const updatedImages = [...localImages, ...newImages];
      setLocalImages(updatedImages);
      onImagesUpdate(updatedImages);
    }
  };

  // Función para manejar la toma de fotos con la cámara
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se necesitan permisos para acceder a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      const updatedImages = [...localImages, ...newImages];
      setLocalImages(updatedImages);
      onImagesUpdate(updatedImages);
    }
  };

  // Función para eliminar una imagen
  const handleRemoveImage = (index: number) => {
    const updatedImages = localImages.filter((_, i) => i !== index);
    setLocalImages(updatedImages);
    onImagesUpdate(updatedImages);
  };

  // Add this helper function to check if task is completed
  const isTaskCompleted = () => status === "completado";

  return (
    <View style={{ backgroundColor: "#0a3649" }}>
      {/* Slider de imágenes - solo se muestra cuando hay imágenes para mostrar */}
      {localImages.length > 0 && (
        <View style={{ marginBottom: -10, position: 'relative' }}>
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
                prev === 0 ? localImages.length - 1 : prev - 1
              )}
            >
              <MaterialIcons name="chevron-left" size={30} color="white" />
            </TouchableOpacity>

            <Image
              source={getImageSource(localImages[activeImageIndex])}
              style={{
                width: '100%',
                height: '100%',
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
                prev === localImages.length - 1 ? 0 : prev + 1
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
              {localImages.map((_, index) => (
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

      {/* Entrada de texto para el título */}
      <TextInput
        style={{
          fontSize: 35,
          width: "70%",
          color: "white",
          marginBottom: 10,
          marginLeft: 20,
          textAlignVertical: "top",
        }}
        value={titulo}
        onChangeText={onTituloChange}
        placeholder="Ingrese el título"
        placeholderTextColor="#888"
        multiline={true}
        numberOfLines={4}
        editable={status !== "completado"} // Disable editing if status is "completado"
      />

      {/* Mostrar galería de imágenes cuando hay imágenes y no hay itemData */}
      {localImages.length > 0 && !itemData && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ color: '#dedede', marginBottom: 8, fontSize: 16 }}>
            Imágenes ({localImages.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {localImages.map((imageUri, index) => (
              <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                <Image
                  source={getImageSource(imageUri)}
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
                  onPress={() => handleRemoveImage(index)}
                >
                  <MaterialIcons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.hr} />
      
      {isEditable && (
        <><View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            backgroundColor: !isAdmin || isTaskCompleted() ? "#0a455e" : "#dedede",
            borderRadius: 5,
          }}
          onPress={onFinishTask}
          disabled={!isAdmin || isTaskCompleted()}
        >
          <Text style={{ fontSize: 14, color: !isAdmin || isTaskCompleted() ? "#fff" : "#0a455e", padding: 15 }}>
            Finalizar
          </Text>
        </TouchableOpacity>

        {/* Menú de opciones para subir imágenes */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              backgroundColor: isTaskCompleted() ? "#0a455e" : "#dedede",
              borderRadius: 5,
            }}
            disabled={isTaskCompleted()}
            onPress={() => {
              Alert.alert(
                "Subir Imágenes",
                "Seleccione una opción",
                [
                  { text: "Tomar Foto", onPress: handleTakePhoto },
                  { text: "Elegir de Galería", onPress: handlePickImages },
                  { text: "Cancelar", style: "cancel" }
                ]
              );
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <MaterialIcons name="photo-camera" size={20} color={isTaskCompleted() ? "#fff" : "#0a455e"} />
              <Text style={{ fontSize: 14, color: isTaskCompleted() ? "#fff" : "#0a455e", padding: 15 }}>
                Subir Imágenes
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View></>
      )}

      
    </View>
  );
};


export default TitleSection;