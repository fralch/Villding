import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Text, ActivityIndicator, Modal, StyleSheet, BackHandler } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getSesion } from '../../hooks/localStorageUser';
import { getActivity, storeActivity, removeActivity } from '../../hooks/localStorageCurrentActvity';
import { Activity } from './types/Activity_interface';
import { iconImports, iconsFiles } from './icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { normalizeImages } from '../../utils/imageUtils';

// Componentes
import TitleSection from './componentsActivityUpdate/TitleSection';
import FormFields from './componentsActivityUpdate/FormFields';
import IconSelector from './componentsActivityUpdate/IconSelector';
import MessageModal from './componentsActivityUpdate/MessageModal';
import LoadingOverlay from './componentsActivityUpdate/LoadingOverlay';

// Tipos y interfaces
export interface ActivityItemUpdateRef {handleUpdateActivity: () => Promise<boolean>;}

interface ActivityItemUpdateProps {
  project_id: number;
  tracking_id: number;
  activity: Activity | null;
  date: string;
  hideModal: () => void;
  isAdmin?: boolean;
}

type ActivityStatus = 'Programado' | 'Pendiente' | 'Completado';

/**
 * Componente principal para actualizar actividades
 * Utiliza forwardRef para exponer métodos a componentes padres
 */
const ActivityItemUpdate = forwardRef<ActivityItemUpdateRef, ActivityItemUpdateProps>((props, ref) => {

    const { project_id, tracking_id, activity, date, hideModal, isAdmin: initialIsAdmin = true } = props;
    
    // Estado para el formulario
    const [formData, setFormData] = useState(() => {
      console.log('========================================');
      console.log('INICIALIZANDO ESTADO - ActivityItemUpdate');
      console.log('activity?.image:', activity?.image);

      const normalizedImages = normalizeImages(activity?.image);

      console.log('Imágenes normalizadas en estado inicial:', normalizedImages);
      console.log('========================================');

      return {
        titulo: activity?.name || '',
        description: activity?.description || '',
        location: activity?.location || '',
        horas: activity?.horas || '',
        status: activity?.status || 'Pendiente',
        comments: activity?.comments || '',
        selectedIcon: activity?.icon || '',
        // Normaliza el formato de imágenes desde diferentes fuentes
        images: normalizedImages,
        fecha_creacion: activity?.fecha_creacion || date
      };
    });
    
    // Estados adicionales para UI y lógica
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Nuevos estados para modo edición
    const [isEditing, setIsEditing] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [storedData, setStoredData] = useState<any>(null);
    // Nuevo estado para el modal de confirmación de eliminación
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


    /**
     * Actualiza el formulario cuando cambia la actividad (prop externa)
     */
    useEffect(() => {
      if (activity) {
        const normalizedImages = normalizeImages(activity.image);

        setFormData({
          titulo: activity.name || '',
          description: activity.description || '',
          location: activity.location || '',
          horas: activity.horas || '',
          status: activity.status || 'Pendiente',
          comments: activity.comments || '',
          selectedIcon: activity.icon || '',
          images: normalizedImages,
          fecha_creacion: activity.fecha_creacion || date
        });
      }
    }, [activity]);

    /**
     * Verifica el estado de administrador del usuario actual
     * para determinar los permisos de edición
     */
    useEffect(() => {
      const checkAdminStatus = async () => {
        // Obtiene sesión del almacenamiento local
        const session = JSON.parse(await getSesion() || "{}"); // Obtiene el objeto JSON de la sesión
        
        // Si el usuario es admin global, mantiene el estado
        if (session?.is_admin === 1) {
          setIsAdmin(true); // Actualiza el estado local
          return;
        }

        try {
          // Verifica si el usuario es admin del proyecto específico
          const response = await axios.post(`${API_BASE_URL}/project/check-attachment`,{ project_id } );
          
          setIsAdmin(response.data.users.some((user: any) => 
            user.id === session?.id && user.is_admin === 1 
          ));
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      };

      checkAdminStatus(); 
    }, [project_id]);

    /**
     * Cargar datos de actividad almacenada en localStorage
     */
    useEffect(() => {
      loadStoredActivity();
    }, []);

    // Interceptar botón de retroceso de Android en el modal de edición
    useEffect(() => {
      console.log('[Update] BackHandler useEffect mount. showDeleteConfirmation:', showDeleteConfirmation, 'showModal:', showModal, 'isLoading:', isLoading, 'isEditLoading:', isEditLoading);
      const onBackPress = () => {
        console.log('[Update] hardwareBackPress fired. showDeleteConfirmation:', showDeleteConfirmation, 'showModal:', showModal, 'isLoading:', isLoading, 'isEditLoading:', isEditLoading);
        if (showDeleteConfirmation) {
          console.log('[Update] Closing delete confirmation modal via back');
          setShowDeleteConfirmation(false);
          return true;
        }
        if (isLoading || isEditLoading) {
          console.log('[Update] Block back during loading');
          // Evita cerrar mientras está procesando/guardando
          return true;
        }
        if (showModal) {
          console.log('[Update] Closing message modal via back');
          setShowModal(false);
          return true;
        }
        console.log('[Update] Calling hideModal to return to tracking current');
        hideModal();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        console.log('[Update] BackHandler subscription removed');
        subscription.remove();
      };
    }, [hideModal, showModal, showDeleteConfirmation, isLoading, isEditLoading]);
    /**
     * Función para cargar la actividad almacenada en localStorage
     */
    const loadStoredActivity = async () => {
      try {
        const activityData: any = await getActivity();
        if (activityData) {
          setStoredData(activityData);
          // Si hay datos almacenados y estamos en modo edición, 
          // actualizamos el formulario con esos datos
          if (activityData.editMode) {
            setFormData({
              titulo: activityData.activity?.name || '',
              description: activityData.activity?.description || '',
              location: activityData.activity?.location || '',
              horas: activityData.activity?.horas || '',
              status: activityData.activity?.status || 'Pendiente',
              comments: activityData.activity?.comments || '',
              selectedIcon: activityData.activity?.icon || '',
              images: normalizeImages(activityData.activity?.image),
              fecha_creacion: activityData.activity?.fecha_creacion || activityData.date
            });
            setIsAdmin(activityData.isAdmin || false);
            setIsEditing(true);
          }
        }
      } catch (error) {
        console.error('Error al cargar la actividad:', error);
      }
    };

    /**
     * Muestra un mensaje modal con el texto proporcionado
     */
    const showMessage = (message: string) => {
      setModalMessage(message);
      setShowModal(true);
    };

    /**
     * Actualiza el array de imágenes en el estado del formulario
     * Esto se utiliza para actualizar la lista de imágenes cuando se agregan o eliminan
     */
    const handleImagesUpdate = (newImages: string[]) => {
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    };

    /**
     * Actualiza los campos del formulario
     * Esto se utiliza para actualizar los valores de los inputs del formulario
     */
    const handleFormChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    /**
     /**
      * FUNCION PRINCIPAL PARA ACTUALIZAR UNA ACTIVIDAD
      * Opcionalmente puede actualizar el estado de la actividad
      * ===================================
      * @param newStatus - Estado opcional para actualizar la actividad
      * @returns - Promise<boolean> - Indica si la actualización fue exitosa
      */
     
     const updateActivity = async (newStatus?: ActivityStatus): Promise<boolean> => {
      console.log("Actualizando actividad con IMAGEN... FUNCIONANDO!!!");
      // Validación básica
      if (!activity?.id) return false; // verifica si hay un id
    
      if (!formData.titulo.trim()) {
        showMessage('Por favor ingrese un título para la actividad.');
        return false;
      }
    
      setIsLoading(true);
    
      try {
        // Separar imágenes nuevas de las existentes
        /* 
        - Filtramos las imágenes nuevas (aquellas que empiezan con 'file://' o 'content://')
        - Filtramos las imágenes existentes (aquellas que no empiezan con 'file://' o 'content://')
        */
        const newImages = formData.images.filter(img =>  
          img.startsWith('file://') || img.startsWith('content://')
        );
        
        const existingImages = formData.images.filter(img => 
          !img.startsWith('file://') && !img.startsWith('content://')
        );
    
        // Prepara los datos de la actividad
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
          id: activity.id,
          images: newImages,
          existing_images: existingImages
        };
    
        console.log("Datos de la actividad:");
        console.log(activityData);
        let response;
    
        // Verificación mejorada para imágenes
        const hasNewImages = newImages.length > 0;
        if (hasNewImages || existingImages.length > 0) { 
          // Si hay imágenes nuevas o existentes, usa FormData
          response = await uploadWithImages(activityData);
        } else {
          // Sin imágenes, usa una solicitud JSON normal
          response = await axios.post(
            `${API_BASE_URL}/activities/${activity.id}`,
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

    /**
     * Sube los datos de la actividad con imágenes usando FormData
     */
    const uploadWithImages = async (activityData: any) => {
      console.log("PROCESANDO IMÁGENES...");
      const formDataObj = new FormData();
      
      // Añade todos los campos al FormData excepto imágenes
      Object.entries(activityData).forEach(([key, value]: [string, any]) => {
        if (key !== 'images') {
          formDataObj.append(key, String(value));
        }
      });
    
      // Procesa y añade imágenes al FormData
      if (activityData.images && activityData.images.length > 0) {
        activityData.images.forEach((imageUri: string, index: number) => {
          // Solo procesa nuevas imágenes (las que empiezan con file:// o content://)
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
    
      // Añade también las imágenes existentes como un campo separado para que el backend pueda combinarlas
      if (activityData.existing_images) {
        formDataObj.append('existing_images', JSON.stringify(activityData.existing_images));
      }
    
      // Envía solicitud con el FormData
      return await axios({
        method: 'post',
        url: `${API_BASE_URL}/activities_imgs/${activityData.id}`,
        data: formDataObj,
        headers: { "Content-Type": "multipart/form-data" }
      });
    };

    /**
     * Función específica para marcar una actividad como completada
     * También sube las imágenes asociadas a la actividad
     */
    const handleSubmitFinish = async () => {
      try {
        // Validate icon and image presence
        if (!formData.selectedIcon) {
          Alert.alert('Error', 'Por favor, seleccione un icono para la actividad.');
          return false;
        }

        if (!formData.images || formData.images.length === 0) {
          Alert.alert('Error', 'Por favor, agregue al menos una imagen antes de completar la actividad.');
          return false;
        }

        setIsLoading(true);
        
        console.log("COMPLETANDO ACTIVIDAD CON IMÁGENES...");
        console.log(activity?.id);
        
        // Primero actualizamos la actividad con las imágenes
        // Separar imágenes nuevas de las existentes
        const newImages = formData.images.filter(img =>  
          img.startsWith('file://') || img.startsWith('content://')
        );
        
        const existingImages = formData.images.filter(img => 
          !img.startsWith('file://') && !img.startsWith('content://')
        );
        
        // Si hay imágenes nuevas, primero las subimos
        if (newImages.length > 0 || existingImages.length > 0) {
          // Preparar datos para la actualización con imágenes
          const activityData = {
            project_id,
            tracking_id,
            name: formData.titulo,
            description: formData.description,
            location: formData.location,
            horas: formData.horas,
            status: 'Completado',
            comments: formData.comments,
            icon: formData.selectedIcon,
            fecha_creacion: formData.fecha_creacion,
            id: activity?.id,
            images: newImages,
            existing_images: existingImages
          };
          
          // Subir actividad con imágenes
          await uploadWithImages(activityData);
        }
        
        // Luego marcamos la actividad como completada
        await axios({
          method: 'post',
          url: `${API_BASE_URL}/activities_complete`,
          data: { id: activity?.id },
          headers: { "Content-Type": "application/json" }
        });
        
        // Actualiza el estado localmente
        setFormData(prev => ({ ...prev, status: 'Completado' }));
        
        setIsLoading(false);
        showMessage('Actividad marcada como completada con imágenes.');
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
    const handleEditableChange = async () => {
      setIsEditLoading(true);
      
      try {
        await removeActivity();
        await storeActivity({
          project_id,
          tracking_id,
          activity,
          date: formData.fecha_creacion,
          isAdmin,
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

    // Expone el método de actualización al componente padre
    useImperativeHandle(ref, () => ({
      handleUpdateActivity: () => updateActivity(),
    }));

    // Función que muestra el modal de confirmación
    const confirmDeleteActivity = () => {
      setShowDeleteConfirmation(true);
    };

    // Función que realiza la eliminación después de confirmar
    const handleDeleteActivity = async () => {
      try {
        setIsLoading(true);
        await removeActivity();
        const activityId = storedData?.activity?.id || activity?.id;
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

    // Estilos para el modal de confirmación
    const styles = StyleSheet.create({
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
      },
      modalText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
      },
      button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
      },
      cancelButton: {
        backgroundColor: '#878787',
      },
      deleteButton: {
        backgroundColor: '#ff3b30',
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
    });

    // Renderizado del componente
    return (
      <View style={{ backgroundColor: "#0a3649", flex: 1 }}>
        <ExpoStatusBar style="light" />
        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1 }}>
            {/* Sección del título, imágenes y botón de completar */}
            <TitleSection
              titulo={formData.titulo}
              onTituloChange={(text) => handleFormChange('titulo', text)}
              onFinishTask={handleSubmitFinish} // Función para marcar la actividad como completada
              isAdmin={isAdmin}
              images={formData.images}
              onImagesUpdate={handleImagesUpdate}
              itemData={activity}
              status={formData.status}
            />
            
            {/* Campos de formulario para detalles de la actividad */}
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
              onIconSelect={(icon) => handleFormChange('selectedIcon', icon)}
              iconImports={iconImports}
              iconsFiles={iconsFiles}
            />

            {/* Sección para el botón "Volver a editar" */}
            {!isEditing && (
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
                    onPress={confirmDeleteActivity}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 5,
                      gap: 10,
                      paddingVertical: 10,
                    }}
                  >
                    <FontAwesome name="trash" size={18} color="red" />
                    <Text style={{ fontSize: 18, color: "red"}}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
        
        {/* Modal para mensajes de confirmación/error */}
        <MessageModal 
          visible={showModal} 
          message={modalMessage} 
          onClose={() => { console.log('[Update] MessageModal onClose'); setShowModal(false); }} 
        />

        {/* Modal de confirmación para eliminar actividad */}
        <Modal
          visible={showDeleteConfirmation}
          transparent={true}
          animationType="fade"
          onRequestClose={() => { console.log('[Update] Delete confirmation onRequestClose'); setShowDeleteConfirmation(false); }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: '#05334b' }]}>
              <Text style={[styles.modalText, { color: '#fff' }]}>¿Estás seguro que deseas eliminar esta actividad?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setShowDeleteConfirmation(false)}
                >
                  <Text style={[styles.buttonText,]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.deleteButton]} 
                  onPress={handleDeleteActivity}
                >
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Overlay de carga durante operaciones asíncronas */}
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
  }
);

export default ActivityItemUpdate;