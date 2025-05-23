// components/FullScreenImageViewer.tsx
import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
  StatusBar,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FullScreenImageViewerProps {
  images: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onDeleteImage?: (index: number) => void;
  canDelete?: boolean;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  images,
  initialIndex,
  visible,
  onClose,
  onDeleteImage,
  canDelete = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Función para obtener la fuente de la imagen - agregando verificación para undefined
  const getImageSource = (imageUri: string | undefined) => {
    // Si imageUri es undefined o vacío, devolver una imagen placeholder o un objeto vacío
    if (!imageUri) {
      return { uri: 'https://via.placeholder.com/400' };
    }
    
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      return { uri: imageUri };
    }
    if (imageUri.startsWith('http')) {
      return { uri: imageUri };
    }
    return { uri: `https://centroesteticoedith.com/endpoint/images/activities/${imageUri}` };
  };

  // Filtrando imágenes vacías o undefined antes de usarlas
  const validImages = images.filter(img => !!img);

  // Verificar si hay imágenes válidas para mostrar
  if (validImages.length === 0) {
    return null; // No renderizar si no hay imágenes válidas
  }

  // Asegurar que el índice actual es válido
  const safeIndex = Math.min(currentIndex, validImages.length - 1);
  
  const navigateToNext = () => {
    if (currentIndex < validImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDeleteImage = () => {
    if (onDeleteImage) {
      onDeleteImage(safeIndex);
      // Si es la última imagen, cerrar el visor
      if (validImages.length <= 1) {
        onClose();
      } else if (safeIndex === validImages.length - 1) {
        // Si es la última imagen en el array, ir a la anterior
        setCurrentIndex(safeIndex - 1);
      }
      // Si no es la última, el índice se mantiene y mostrará la siguiente imagen
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(validImages[safeIndex])}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>

        {/* Indicador de posición */}
        <View style={styles.pagination}>
          {validImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === safeIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        {/* Botones de navegación */}
        {safeIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.leftNav]}
            onPress={navigateToPrevious}
          >
            <MaterialIcons name="chevron-left" size={40} color="white" />
          </TouchableOpacity>
        )}

        {safeIndex < validImages.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.rightNav]}
            onPress={navigateToNext}
          >
            <MaterialIcons name="chevron-right" size={40} color="white" />
          </TouchableOpacity>
        )}

        {/* Contador de imágenes */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {safeIndex + 1} / {validImages.length}
          </Text>
        </View>

        {/* Botón de cierre */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={30} color="white" />
        </TouchableOpacity>

        {/* Botón de eliminación mejorado - centrado en la parte inferior */}
        {canDelete && onDeleteImage && (
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDeleteImage}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete" size={24} color="white" />
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 80, // Espaciado desde abajo, por encima de la paginación
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftNav: {
    left: 10,
  },
  rightNav: {
    right: 10,
  },
  pagination: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  paginationDotActive: {
    backgroundColor: '#33baba',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  counter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 15,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
  },
});

export default FullScreenImageViewer;