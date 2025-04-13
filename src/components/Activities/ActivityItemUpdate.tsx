// ActivityItemUpdate.tsx
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, Modal, ActivityIndicator, Text, ScrollView, Alert } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import axios from 'axios';
import { getSesion } from '../../hooks/localStorageUser';
import { Activity } from './types/Activity_interface';
import { styles } from "./styles/ActivityItemCreateStyles";
import { iconImports, iconsFiles } from './icons';

// Import components directly
import TitleSection from './components/TitleSection';
import FormFields from './components/FormFields';
import IconSelector from './components/IconSelector';
import MessageModal from './components/MessageModal';
import LoadingOverlay from './components/LoadingOverlay';

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
  (props, ref) => {
    const { project_id, tracking_id, activity, date, hideModal, isAdmin: initialIsAdmin = true } = props;
    
    const [formData, setFormData] = useState({
      titulo: activity?.name || '',
      description: activity?.description || '',
      location: activity?.location || '',
      horas: activity?.horas || '',
      status: activity?.status || 'Pendiente',
      comments: activity?.comments || '',
      selectedIcon: activity?.icon || '',
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

    // Función para actualizar las imágenes en el estado del formulario
    const handleImagesUpdate = (newImages: string[]) => {
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
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

    const handleFormChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <View style={{ backgroundColor: "#0a3649", flex: 1 }}>
        <ExpoStatusBar style="light" />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1 }}>
            <TitleSection
              titulo={formData.titulo}
              onTituloChange={(text) => handleFormChange('titulo', text)}
              onFinishTask={handleSubmitFinish}
              isAdmin={isAdmin}
              images={formData.images}
              onImagesUpdate={handleImagesUpdate}
              itemData={activity}
              status={formData.status}
            />
            
            <FormFields
              description={formData.description}
              location={formData.location}
              horas={formData.horas}
              onValueChange={handleFormChange}
            />

            <IconSelector
              selectedIcon={formData.selectedIcon}
              onIconSelect={(icon) => handleFormChange('selectedIcon', icon)}
              iconImports={iconImports}
              iconsFiles={iconsFiles}
            />
          </View>
        </ScrollView>
        
        {/* Modal de Confirmación */}
        <MessageModal 
          visible={showModal} 
          message={modalMessage} 
          onClose={() => setShowModal(false)} 
        />

        {/* Loading Overlay */}
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