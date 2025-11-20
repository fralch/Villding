// components/TitleSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { getActivity } from '../../../hooks/localStorageCurrentActvity';
import { styles } from '../styles/ActivityItemCreateStyles';
import StatusIndicator from './StatusIndicator';
import FullScreenImageViewer from './FullScreenImageViewer';
import { API_BASE_URL } from '../../../config/api';
import { getImageSource } from '../../../utils/imageUtils';

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
  const [esEditable, setEsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const maxImages = 6;
  
  // Estado para el visor de imágenes a pantalla completa
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  // Actualizar las imágenes locales cuando cambien las props
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  useEffect(() => {
    const obteniendoActividad = async () => {
      const actividad = await getActivity();
      if (actividad) {
        const puedeEditar = actividad.editMode;
        setEsEditable(puedeEditar || false);
      }
    };
    obteniendoActividad();
  }, []); // Ejecutar solo al montar el componente

  useEffect(() => {
    const refreshEditableStatus = async () => {
      const actividad = await getActivity();
      if (actividad) {
        const puedeEditar = actividad.editMode;
        setEsEditable(puedeEditar || false);
      }
    };

    // Crear un intervalo para verificar periódicamente
    const intervalId = setInterval(refreshEditableStatus, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);


  const compressImageIfNeeded = async (uri: string): Promise<string> => {
    const MAX_SIZE_MB = 0.5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists || !fileInfo.size) {
        return uri;
      }
      if (fileInfo.size <= MAX_SIZE_BYTES) {
        return uri;
      }
      const { width: originalWidth, height: originalHeight } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(uri, (width, height) => resolve({ width, height }), (error) => reject(error));
      });
      let compressedUri = uri;
      let quality = 0.8;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;
      while (attempts < MAX_ATTEMPTS) {
        attempts++;
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          compressedUri,
          [],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        compressedUri = manipulatedImage.uri;
        const compressedFileInfo = await FileSystem.getInfoAsync(compressedUri);
        if (!compressedFileInfo.exists || !compressedFileInfo.size) {
          break;
        }
        if (compressedFileInfo.size <= MAX_SIZE_BYTES) {
          break;
        }
        quality -= 0.1;
        if (quality < 0.3) {
          const maxDimension = 1920;
          let newWidth = originalWidth;
          let newHeight = originalHeight;
          if (originalWidth > originalHeight) {
            if (originalWidth > maxDimension) {
              newWidth = maxDimension;
              newHeight = Math.round((originalHeight * maxDimension) / originalWidth);
            }
          } else {
            if (originalHeight > maxDimension) {
              newHeight = maxDimension;
              newWidth = Math.round((originalWidth * maxDimension) / originalHeight);
            }
          }
          const resizedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: newWidth, height: newHeight } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          compressedUri = resizedImage.uri;
          break;
        }
      }
      return compressedUri;
    } catch (error) {
      return uri;
    }
  };

  // Función para manejar la selección de imágenes de la galería
  const handlePickImages = async () => {
    const remaining = maxImages - localImages.length;
    if (remaining <= 0) {
      Alert.alert("Límite alcanzado", "Ha alcanzado el límite de 6 imágenes. Elimine algunas para poder agregar más.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se necesitan permisos para acceder a la galería");
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    };

    setIsLoading(true);
    setLoadingMessage('Procesando imágenes...');
    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets) {
      const remainingSlots = maxImages - localImages.length;
      const assetsToProcess = result.assets.slice(0, remainingSlots);
      const processedImages = await Promise.all(
        assetsToProcess.map(async (asset) => {
          const compressedUri = await compressImageIfNeeded(asset.uri);
          return compressedUri;
        })
      );
      const updatedImages = [...localImages, ...processedImages].slice(0, maxImages);
      setLocalImages(updatedImages);
      onImagesUpdate(updatedImages);
      setIsLoading(false);
      setLoadingMessage('');
      if (result.assets.length > remainingSlots) {
        Alert.alert("Límite de selección", `Solo puede agregar ${remainingSlots} imagen${remainingSlots === 1 ? '' : 'es'} más (máximo ${maxImages}).`);
      }
    }
    else {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Función para manejar la toma de fotos con la cámara
  const handleTakePhoto = async () => {
    const remaining = maxImages - localImages.length;
    if (remaining <= 0) {
      Alert.alert("Límite alcanzado", "Ha alcanzado el límite de 6 imágenes. Elimine algunas para poder agregar más.");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se necesitan permisos para acceder a la cámara");
      return;
    }

    const cameraOptions: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    };

    setIsLoading(true);
    setLoadingMessage('Procesando imágenes...');
    const result = await ImagePicker.launchCameraAsync(cameraOptions);

    if (!result.canceled && result.assets) {
      const remainingSlots = maxImages - localImages.length;
      const assetsToProcess = result.assets.slice(0, remainingSlots);
      const processedImages = await Promise.all(
        assetsToProcess.map(async (asset) => {
          const compressedUri = await compressImageIfNeeded(asset.uri);
          return compressedUri;
        })
      );
      const updatedImages = [...localImages, ...processedImages].slice(0, maxImages);
      setLocalImages(updatedImages);
      onImagesUpdate(updatedImages);
      setIsLoading(false);
      setLoadingMessage('');
    }
    else {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Función para eliminar una imagen
  const handleRemoveImage = (index: number) => {
    const updatedImages = localImages.filter((_, i) => i !== index);
    setLocalImages(updatedImages);
    onImagesUpdate(updatedImages);
  };

  // Función para abrir el visor de pantalla completa
  const handleOpenFullScreen = () => {
    // Solo abrir el visor si hay imágenes válidas
    const validImages = localImages.filter(img => !!img);
    if (validImages.length > 0) {
      setFullScreenVisible(true);
    }
  };
  
  // Función para eliminar una imagen desde el visor de pantalla completa
  const handleDeleteImageFromFullScreen = (index: number) => {
    handleRemoveImage(index);
  };
  

  return (
    <View style={{ backgroundColor: "#0a3649" }}>
      {/* Slider de imágenes - solo se muestra cuando hay imágenes para mostrar */}
      {localImages.length > 0 && (
        <View style={{ marginBottom: -10, position: 'relative' }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleOpenFullScreen}
            style={{ height: 200, width: '100%', marginBottom: 10, position: 'relative' }}
          >
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
              onPress={(e) => {
                e.stopPropagation(); // Prevenir que el tap llegue al slider
                setActiveImageIndex((prev) =>
                  prev === 0 ? localImages.length - 1 : prev - 1
                );
              }}
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
              onPress={(e) => {
                e.stopPropagation(); // Prevenir que el tap llegue al slider
                setActiveImageIndex((prev) =>
                  prev === localImages.length - 1 ? 0 : prev + 1
                );
              }}
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
          </TouchableOpacity>
        </View>
      )}

      {/* Visor de imágenes a pantalla completa */}
      <FullScreenImageViewer 
        images={localImages.filter(img => !!img)}
        initialIndex={activeImageIndex}
        visible={fullScreenVisible}
        onClose={() => setFullScreenVisible(false)}
        onDeleteImage={handleDeleteImageFromFullScreen}
        canDelete={esEditable}
      />
      
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
        editable={esEditable} // Disable editing if status is "completado"
      />

      {/* Mostrar galería de imágenes cuando hay imágenes y no hay itemData */}
      {localImages.length > 0 && !itemData && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ color: '#dedede', marginBottom: 8, fontSize: 16 }}>
            Imágenes ({localImages.length}/{maxImages})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {localImages.map((imageUri, index) => (
              <TouchableOpacity 
                key={index} 
                style={{ marginRight: 10, position: 'relative' }}
                onPress={() => {
                  setActiveImageIndex(index);
                  setFullScreenVisible(true);
                }}
              >
                <Image
                  source={getImageSource(imageUri)}
                  style={{ width: 100, height: 100, borderRadius: 5 }}
                  resizeMode="contain"
                />
                {esEditable && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: 3,
                      borderRadius: 12
                    }}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <MaterialIcons name="close" size={18} color="white" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.hr} />

      {esEditable && (
        <>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {status !== "completado"  && ( 
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
              >
                <Text style={{ fontSize: 14, color: !isAdmin ? "#fff" : "#0a455e", padding: 15 }}>
                  Finalizar
                </Text>
              </TouchableOpacity>
            )}

            {/* Menú de opciones para subir imágenes */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 10,
                  backgroundColor: localImages.length >= maxImages ? "#999" : "#dedede",
                  borderRadius: 5,
                  opacity: localImages.length >= maxImages ? 0.7 : 1,
                }}
                onPress={() => {
                  const remaining = maxImages - localImages.length;
                  if (remaining <= 0) {
                    Alert.alert(
                      "Límite alcanzado",
                      "Ha alcanzado el límite de 6 imágenes. Elimine algunas para poder agregar más.",
                      [{ text: "Entendido", style: "cancel" }]
                    );
                    return;
                  }
                  Alert.alert(
                    "Subir Imágenes",
                    `Seleccione una opción (${remaining} imágenes restantes)`,
                    [
                      { text: "Tomar Foto", onPress: handleTakePhoto },
                      { text: "Elegir de Galería", onPress: handlePickImages },
                      { text: "Cancelar", style: "cancel" }
                    ]
                  );
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            
                  <Text style={{ fontSize: 14, color: "#0a455e", padding: 15 }}>
                    {localImages.length >= maxImages ? "Límite de imágenes alcanzado (6/6)" : `Subir Imágenes (${localImages.length}/6)`}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {isLoading && (
        <Modal transparent={true} visible={true} onRequestClose={() => {}}>
          <View style={loadingStyles.overlay}>
            <View style={loadingStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#33baba" />
              <Text style={loadingStyles.loadingText}>{loadingMessage || 'Procesando...'}</Text>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );
};

export default TitleSection;

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