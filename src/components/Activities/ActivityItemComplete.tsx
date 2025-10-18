/**
 * ActivityItemComplete.tsx
 * Componente para actualizar actividades en un proyecto.
 * Permite visualizar y editar actividades completadas.
 */
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import axios from 'axios';
import { getSesion } from '../../hooks/localStorageUser';
import { getActivity, storeActivity, removeActivity } from '../../hooks/localStorageCurrentActvity';
import { iconImports, iconsFiles } from './icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { API_BASE_URL } from '../../config/api';
import { normalizeImages } from '../../utils/imageUtils';

// Importación de componentes
import TitleSection from './componentsActivityUpdate/TitleSection';
import FormFields from './componentsActivityUpdate/FormFields';
import IconSelector from './componentsActivityUpdate/IconSelector';
import MessageModal from './componentsActivityUpdate/MessageModal';
import LoadingOverlay from './componentsActivityUpdate/LoadingOverlay';

// Definición de tipos e interfaces
export interface ActivityItemCompleteRef {
  handleUpdateActivity: () => Promise<boolean>;
}

interface ActivityItemCompleteProps {
  hideModal: () => void;
}

type ActivityStatus = 'programado' | 'pendiente' | 'completado';

const ActivityItemComplete = forwardRef<ActivityItemCompleteRef, ActivityItemCompleteProps>(({ hideModal }, ref) => {
  // Estado para almacenar los datos del localStorage
  const [storedData, setStoredData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    titulo: '',
    description: '',
    location: '',
    horas: '',
    status: 'completado',
    comments: '',
    selectedIcon: '',
    images: [] as string[],
    fecha_creacion: ''
  });

  // Estados para UI
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  // Cargar datos al inicio
  useEffect(() => {
    loadStoredActivity();
  }, []);

  // Verificar permisos de administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Obtiene sesión del almacenamiento local
      const session = JSON.parse(await getSesion() || "{}");
      
      // Si el usuario es admin global, mantiene el estado
      if (session?.is_admin === 1) {
        setIsAdmin(true);
        return;
      }

      try {
        // Verifica si el usuario es admin del proyecto específico
        if (storedData?.project_id) {
          const response = await axios.post(
            `${API_BASE_URL}/project/check-attachment`,
            { project_id: storedData.project_id }
          );
          
          setIsAdmin(response.data.users.some((user: any) => 
            user.id === session?.id && user.is_admin === 1 
          ));
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    if (storedData) {
      checkAdminStatus();
    }
  }, [storedData]);

  // Función para cargar la actividad almacenada
  const loadStoredActivity = async () => {
    try {
      const activityData: any = await getActivity();
      if (activityData) {
        setStoredData(activityData);
        setFormData({
          titulo: activityData.activity?.name || '',
          description: activityData.activity?.description || '',
          location: activityData.activity?.location || '',
          horas: activityData.activity?.horas || '',
          status: activityData.activity?.status || 'pendiente',
          comments: activityData.activity?.comments || '',
          selectedIcon: activityData.activity?.icon || '',
          images: normalizeImages(activityData.activity?.image),
          fecha_creacion: activityData.activity?.fecha_creacion || activityData.date
        });
        setIsAdmin(activityData.isAdmin || false);
        
        // Si hay datos almacenados y estamos en modo edición, actualizamos el estado
        if (activityData.editMode) {
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error('Error al cargar la actividad:', error);
    }
  };


  /**
   * Muestra un mensaje modal
   */
  const showMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  /**
   * Manejadores de actualización para el formulario
   */
  const handleImagesUpdate = (newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Actualiza la actividad en el servidor
   */
  const updateActivity = async (newStatus?: ActivityStatus): Promise<boolean> => {
    // Validación básica
    if (!storedData?.activity?.id) return false;

    if (!formData.titulo.trim()) {
      showMessage('Por favor ingrese un título para la actividad.');
      return false;
    }

    setIsLoading(true);

    try {
      // Separar imágenes
      const newImages = formData.images.filter(img =>
        img.startsWith('file://') || img.startsWith('content://')
      );

      const existingImages = formData.images.filter(img =>
        !img.startsWith('file://') && !img.startsWith('content://')
      );

      // Preparar datos
      const activityData = {
        project_id: storedData.project_id,
        tracking_id: storedData.tracking_id,
        name: formData.titulo,
        description: formData.description,
        location: formData.location,
        horas: formData.horas,
        status: newStatus || formData.status,
        comments: formData.comments,
        icon: formData.selectedIcon,
        fecha_creacion: formData.fecha_creacion,
        id: storedData.activity?.id,
        images: newImages,
        existing_images: existingImages
      };

      console.log("Actualizando actividad completada:", activityData);

      // Enviar solicitud según el tipo
      const response = newImages.length > 0 || existingImages.length > 0
        ? await uploadWithImages(activityData)
        : await axios.post(
            `${API_BASE_URL}/activities/${storedData.activity?.id}`,
            activityData
          );
        
      setIsLoading(false);

      if (response.status === 200) {
        showMessage('Actividad actualizada correctamente');
        
        // Si estamos en modo edición, actualizamos el localStorage
        if (isEditing) {
          await removeActivity();
          await storeActivity({
            ...storedData,
            activity: {
              ...storedData.activity,
              name: formData.titulo,
              description: formData.description,
              location: formData.location,
              horas: formData.horas,
              status: newStatus || formData.status,
              comments: formData.comments,
              icon: formData.selectedIcon,
              image: [...newImages, ...existingImages]
            },
            editMode: true
          });
        }
        
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

  /**
   * Sube los datos con imágenes usando FormData
   */
  const uploadWithImages = async (activityData: any) => {
    const formDataObj = new FormData();

    // Añadir campos al FormData
    Object.entries(activityData).forEach(([key, value]: [string, any]) => {
      if (key !== 'images') {
        formDataObj.append(key, String(value));
      }
    });

    // Procesar imágenes nuevas
    if (activityData.images?.length > 0) {
      activityData.images.forEach((imageUri: string, index: number) => {
        if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
          const fileType = imageUri.split('.').pop();
          formDataObj.append(`images[${index}]`, {
            uri: imageUri,
            name: `photo_${index}.${fileType}`,
            type: `image/${fileType}`
          } as any);
        }
      });
    }

    // Añadir imágenes existentes
    if (activityData.existing_images?.length) {
      formDataObj.append('existing_images', JSON.stringify(activityData.existing_images));
    }

    // Enviar solicitud
    return await axios({
      method: 'post',
      url: `${API_BASE_URL}/activities_imgs/${activityData.id}`,
      data: formDataObj,
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  /**
   * Marca la actividad como completada
   */
  const handleSubmitFinish = async () => {
    try {
      // Validaciones
      if (!formData.selectedIcon) {
        Alert.alert('Error', 'Por favor, seleccione un icono para la actividad.');
        return false;
      }

      if (!formData.images?.length) {
        Alert.alert('Error', 'Por favor, agregue al menos una imagen antes de completar la actividad.');
        return false;
      }

      setIsLoading(true);

      await axios({
        method: 'post',
        url: `${API_BASE_URL}/activities_complete`,
        data: { id: storedData.activity?.id },
        headers: { "Content-Type": "application/json" }
      });

      setFormData(prev => ({ ...prev, status: 'completado' }));

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

  /**
   * Cambia al modo de edición
   * Guarda la actividad en localStorage con la bandera editMode
   */
  const handleEditableChange = async() => {
    setIsEditLoading(true);
    
    try {
      await removeActivity();
      await storeActivity({
        project_id: storedData.project_id,
        tracking_id: storedData.tracking_id,
        activity: storedData.activity,
        date: formData.fecha_creacion,
        isAdmin: isAdmin,
        editMode: true
      });
      await loadStoredActivity();
      setIsEditing(true);
    } catch (error) {
      console.error('Error al cambiar a modo edición:', error);
      showMessage('Error al cambiar a modo edición. Por favor intente de nuevo.');
    } finally {
      setIsEditLoading(false);
    }
  };

  /**
   * Función que realiza la eliminación después de confirmar
   */
  const handleDeleteActivity = async () => {
    try {
      setIsLoading(true);
      await removeActivity();
      const activityId = storedData?.activity?.id;
      await axios.post(`${API_BASE_URL}/activities_delete/${activityId}`);
      setIsLoading(false);
      setShowDeleteConfirmation(false);
      showMessage('Actividad eliminada correctamente');
      setTimeout(hideModal, 2000);
    } catch (error) {
      setIsLoading(false);
      console.error('Error al eliminar la actividad:', error);
      showMessage('Error al eliminar la actividad. Por favor intente de nuevo.');
    }
  };

  // Exponer método de actualización al componente
  useImperativeHandle(ref, () => ({
    handleUpdateActivity: () => updateActivity(),
  }));

  return (
    <View style={{ backgroundColor: "#0a3649", flex: 1 }}>
      <ExpoStatusBar style="light" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Sección del título, imágenes y botón de completar */}
          <TitleSection
            titulo={formData.titulo}
            onTituloChange={(text: string) => handleFormChange('titulo', text)}
            onFinishTask={handleSubmitFinish}
            isAdmin={isAdmin}
            images={formData.images}
            onImagesUpdate={handleImagesUpdate}
            itemData={storedData?.activity}
            status={formData.status}
          />

          {/* Campos de formulario */}
          <FormFields
            description={formData.description}
            location={formData.location}
            horas={formData.horas}
            onValueChange={handleFormChange}
            status={formData.status}
            isAdmin={isAdmin}
          />

          {/* Selector de ícono */}
          <IconSelector
              selectedIcon={formData.selectedIcon}
              onIconSelect={(icon: string) => handleFormChange('selectedIcon', icon)}
              iconImports={iconImports}
              iconsFiles={iconsFiles}
            />

          {  !isEditing && isAdmin && (
            <>
              <View style={{borderBottomColor: "#ccc", borderBottomWidth: 1, marginVertical: 10 }} />
              <View style={{
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'center',
                minHeight: 120
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                    borderRadius: 5,
                    gap: 10,
                    paddingVertical: 10
                  }}
                  onPress={() => handleEditableChange()}
                  disabled={isEditLoading}
                >
                  {isEditLoading ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={{ fontSize: 18, color: "white"}}>
                        Cambiando a modo edición...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <FontAwesome name="pencil" size={18} color="white" />
                      <Text style={{ fontSize: 18, color: "white"}}>
                        Editar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                    borderRadius: 5,
                    gap: 10,
                    paddingVertical: 10
                  }}
                  onPress={() => setShowDeleteConfirmation(true)}
                >
                  <FontAwesome name="trash" size={18} color="#ff6b6b" />
                  <Text style={{ fontSize: 18, color: "#ff6b6b"}}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal para mensajes */}
      <MessageModal
        visible={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />

      {/* Modal de confirmación para eliminar */}
      <MessageModal
        visible={showDeleteConfirmation}
        message="¿Está seguro que desea eliminar esta actividad?"
        onClose={() => setShowDeleteConfirmation(false)}
        showConfirmButton={true}
        onConfirm={handleDeleteActivity}
      />

      {/* Overlay de carga */}
      {isLoading && (
        <LoadingOverlay
          visible={isLoading}
          message={formData.images.length > 0
            ? `Subiendo ${formData.images.length} ${formData.images.length === 1 ? 'imagen' : 'imágenes'}...`
            : 'Procesando...'
          }
        />
      )}
    </View>
  );
});

export default ActivityItemComplete;