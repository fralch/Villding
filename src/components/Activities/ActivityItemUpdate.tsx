/**
 * ActivityItemUpdate.tsx
 * Componente para actualizar actividades en un proyecto.
 * Permite a usuarios administradores y autorizados modificar detalles
 * de actividades existentes, incluyendo título, descripción, ubicación,
 * horas, estado,  ícono e imágenes.
 */
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import axios from 'axios';
import { getSesion } from '../../hooks/localStorageUser';
import { Activity } from './types/Activity_interface';
import { iconImports, iconsFiles } from './icons';

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
    const [formData, setFormData] = useState({
      titulo: activity?.name || '',
      description: activity?.description || '',
      location: activity?.location || '',
      horas: activity?.horas || '',
      status: activity?.status || 'Pendiente',
      comments: activity?.comments || '',
      selectedIcon: activity?.icon || '',
      // Normaliza el formato de imágenes desde diferentes fuentes
      images: normalizeImages(activity?.image),
      fecha_creacion: activity?.fecha_creacion || date
    });
    
    // Estados adicionales para UI y lógica
    const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Normaliza el formato de las imágenes según su tipo
     * esto significa que si el usuario ingresó una imagen como string
     * o un array de strings, lo normalizamos para que sea compatible
     * con el formato requerido por el API
     */
    function normalizeImages(image: any): string[] {
      if (!image) return []; // Si no hay imagen, devuelve una lista vacía
       
      if (typeof image === 'string') { // Si es una cadena, verifica si comienza con '['
        return image.startsWith('[') ? JSON.parse(image) : [image]; // Si es así, convierte a un array
      }
      
      return Array.isArray(image) ? image : [image]; // Si no es un array, lo convierte en uno
    }

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
          const response = await axios.post("https://centroesteticoedith.com/endpoint/project/check-attachment",{ project_id } );
          
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

    /**
     * Sube los datos de la actividad con imágenes usando FormData
     */
    const uploadWithImages = async (activityData: any) => {
      console.log("PROCESANDO IMÁGENES...");
      const formDataObj = new FormData();
      
      // Añade todos los campos al FormData excepto imágenes
      Object.entries(activityData).forEach(([key, value]) => {
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
        url: `https://centroesteticoedith.com/endpoint/activities_imgs/${activityData.id}`,
        data: formDataObj,
        headers: { "Content-Type": "multipart/form-data" }
      });
    };
    /**
     * Función específica para marcar una actividad como completada
     */
    const handleSubmitFinish = async () => {
      try {
        setIsLoading(true);
        
        console.log("COMPLETANDO ACTIVIDAD...");
        console.log(activity?.id);
        await axios({
          method: 'post',
          url: `https://centroesteticoedith.com/endpoint/activities_complete`,
          data: { id: activity?.id },
          headers: { "Content-Type": "application/json" }
        });
        
        // Actualiza el estado localmente
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

    // Expone el método de actualización al componente padre
    useImperativeHandle(ref, () => ({
      handleUpdateActivity: () => updateActivity(),
    }));

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
            />

            {/* Selector de ícono */}
            <IconSelector
              selectedIcon={formData.selectedIcon}
              onIconSelect={(icon) => handleFormChange('selectedIcon', icon)}
              iconImports={iconImports}
              iconsFiles={iconsFiles}
            />
          </View>
        </ScrollView>
        
        {/* Modal para mensajes de confirmación/error */}
        <MessageModal 
          visible={showModal} 
          message={modalMessage} 
          onClose={() => setShowModal(false)} 
        />

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