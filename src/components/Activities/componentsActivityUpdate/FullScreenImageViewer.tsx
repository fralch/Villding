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
import { API_BASE_URL } from '../../../config/api';
import { getImageSource } from '../../../utils/imageUtils';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filtrando imágenes vacías o undefined antes de usarlas
  const validImages = images.filter(img => 
    img && 
    typeof img === 'string' && 
    img.trim() !== ''
  );

  // Verificar si hay imágenes válidas para mostrar
  if (validImages.length === 0) {
    return null; // No renderizar si no hay imágenes válidas
  }

  // Asegurar que el índice actual es válido
  const safeIndex = Math.max(0, Math.min(currentIndex, validImages.length - 1));
  
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
    setShowDeleteModal(true);
  };

  const confirmDeleteImage = () => {
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
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
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

        {/* Modal de confirmación para eliminar */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <MaterialIcons 
                name="warning" 
                size={48} 
                color="#e67e22" 
                style={styles.warningIcon}
              />
              <Text style={styles.modalTitle}>¿Eliminar imagen?</Text>
              <Text style={styles.modalMessage}>
                Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={cancelDelete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={confirmDeleteImage}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  // Estilos para el modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#0A3649',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  warningIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#ff3b30',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FullScreenImageViewer;