/* Este componente es el encargado de mostrar las actividades de un seguimiento */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  Image,
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from "axios";
import { API_BASE_URL } from '../../config/api';
import { MaterialIcons, MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import ActivityItemCreate, { ActivityItemCreateRef } from './ActivityItemCreate';
import ActivityItemUpdate, { ActivityItemUpdateRef } from './ActivityItemUpdate';
import ActivityItemComplete, { ActivityItemCompleteRef } from './ActivityItemComplete';
import { getSesion } from '../../hooks/localStorageUser';
import {iconImports} from './icons';
import { styles } from "./styles/ActivityStyles";
import { storeActivity, removeActivity } from '../../hooks/localStorageCurrentActvity';
import MessageModal from './componentsActivityUpdate/MessageModal';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';


export interface Activity {
  id: number;
  project_id: number;
  tracking_id: number;
  name: string;
  title: string;
  description: string;
  location: string;
  horas: string;
  status: string;
  icon: string;
  image: string | null;
  comments: string;
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
  date?: string;
}

interface Tracking {
  id: number;
  project_id: number;
  title: string;
  description: string;
  date_start: string;
  duration_days: number;
  currentWeekIndex: number;
  status: number;
  days: string[];
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
}

interface WeekDay {
  dayLabel: string;
  activities: Activity[];
}

export default function Activity(props: any) {
  const navigation = useNavigation<NavigationProp<any>>();
  const screenWidth = Dimensions.get('window').width;
  const { height } = Dimensions.get('window');
  
  // Add a ref for the ActivityItemCreate component
  const activityItemCreateRef = useRef<ActivityItemCreateRef>(null);
  const activityItemUpdateRef = useRef<ActivityItemUpdateRef>(null);
  const activityItemCompleteRef = useRef<ActivityItemCompleteRef>(null);

  const [modalVisible, setModalVisible] = useState(false);

  
  const [modalOptionsVisible, setModalOptionsVisible] = useState(false);
  const [trackingTitle, setTrackingTitle] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleSaveTitle = async () => {
    try {
      await axios.post(`${API_BASE_URL}/tracking/update-title/${tracking.id}`, {
        title: trackingTitle
      });
      setTitleTracking(trackingTitle);
      setModalOptionsVisible(false);
    } catch (error) {
      console.error('Error al actualizar el título:', error);
      Alert.alert('Error', 'No se pudo actualizar el título del seguimiento');
    }
  };

  const handleDeleteTracking = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/tracking/delete/${tracking.id}`);
      // Navigate back to the Project screen instead of directly to TrackingCurrent
      navigation.navigate('Project');
    } catch (error) {
      console.error('Error al eliminar el seguimiento:', error);
      Alert.alert('Error', 'No se pudo eliminar el seguimiento');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };
   const [activityItemCreateType, setActivityItemCreateType] = useState('Pendiente');
   const [selectedDate, setSelectedDate] = useState('');
   const [isVisible, setIsVisible] = useState(false);
  
  const [titleTracking, setTitleTracking] = useState(props.route.params.tracking.title);
  const [tracking, setTracking] = useState<Tracking>(props.route.params.tracking);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [pendingActivitiesCount, setPendingActivitiesCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [idProject, setProject_id] = useState(props.route.params.tracking.project_id);
  
  // New state variables for editing
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Get today's date in DD/MM format
  const today = new Date();
  const todayFormatted = `${today.getDate()}/${today.getMonth() + 1}`;

  const getDayName = (dateString: string) => {
    const days = [ 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [day, month] = dateString.split('/').map(Number);
    const date = new Date(2024, month - 1, day);
    return days[date.getDay()];
  };

  // Función para formatear fecha_creacion de formato "YYYY-MM-DD" a "DD/MM"
  const formatDateFromString = (dateString: string): string => {
    try {
      // Si el formato es YYYY-MM-DD como '2025-03-03'
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${parseInt(day, 10)}/${parseInt(month, 10)}`;
      }

      // Intenta con Date si el formato es otro
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }

      console.error('Formato de fecha no reconocido:', dateString);
      return '';
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  };

  // Descargar reporte diario para el tracking actual en una fecha específica
  const downloadDailyReport = async (dayLabel: string) => {
    console.log('=== INICIO downloadDailyReport ===');
    console.log('dayLabel recibido:', dayLabel);
    console.log('tracking.id:', tracking?.id);

    if (!tracking?.id) {
      console.error('ERROR: No hay tracking.id disponible');
      Alert.alert('Error', 'No se encontró el seguimiento');
      return;
    }

    try {
      // Convertir fecha de formato DD/MM a YYYY-MM-DD
      const [day, month] = dayLabel.split('/').map(Number);
      const year = new Date().getFullYear();
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      console.log('Fecha formateada:', formattedDate);
      console.log('URL del API:', `${API_BASE_URL}/tracking/report/daily/${tracking.id}`);
      console.log('Body de la request:', { date: formattedDate });

      Alert.alert('Descargando', 'Preparando el reporte diario...');

      // Hacer POST request usando axios para obtener el PDF
      console.log('Iniciando request POST...');
      const response = await axios.post(
        `${API_BASE_URL}/tracking/report/daily/${tracking.id}`,
        { date: formattedDate },
        {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Response recibida, status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data length:', response.data?.byteLength || 0);

      // Generar nombre de archivo
      const sanitizedTitle = titleTracking.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `reporte_${sanitizedTitle}_${formattedDate}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      console.log('Nombre de archivo:', fileName);
      console.log('URI del archivo:', fileUri);

      // Convertir arraybuffer a base64
      console.log('Convirtiendo arraybuffer a base64...');
      const uint8Array = new Uint8Array(response.data);
      let binaryString = '';
      const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binaryString);

      console.log('Base64 length:', base64.length);

      // Escribir el archivo en el sistema de archivos
      console.log('Escribiendo archivo en el sistema de archivos...');
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Archivo escrito exitosamente');

      // Compartir el archivo si está disponible
      const sharingAvailable = await Sharing.isAvailableAsync();
      console.log('Sharing disponible:', sharingAvailable);

      if (sharingAvailable) {
        console.log('Compartiendo archivo...');
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Reporte: ${titleTracking} - ${getDayName(dayLabel)}`,
        });
        console.log('Archivo compartido exitosamente');
      }

      console.log('=== FIN downloadDailyReport (ÉXITO) ===');
      Alert.alert('Éxito', 'Reporte descargado exitosamente');
    } catch (error: any) {
      console.error('=== ERROR en downloadDailyReport ===');
      console.error('Error completo:', error);
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error config:', error.config);
      console.error('=== FIN ERROR ===');
      Alert.alert('Error', 'Ocurrió un error al descargar el reporte');
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      if (!tracking?.id) return;
  
      try {
        const config = {
          method: 'get',
          url: `${API_BASE_URL}/activities/tracking/${tracking.id}`,
          headers: {
            'Cookie': 'XSRF-TOKEN=...' // Your existing token
          }
        };
  
        const response = await axios.request(config);
        const apiActivities: Activity[] = response.data;
  
        const weekDaysWithActivities: WeekDay[] = tracking.days.map(dayLabel => {
          const dayActivities = apiActivities.filter(activity => {
            // Usar la función específica para formatear YYYY-MM-DD a DD/MM
            const formattedActivityDate = formatDateFromString(activity.fecha_creacion);
            return formattedActivityDate === dayLabel;
          });
  
          return {
            dayLabel,
            activities: dayActivities
          };
        });
        // console.log(weekDaysWithActivities);
        setWeekDays(weekDaysWithActivities);
  
        // Calcular el número de actividades pendientes solo para los días mostrados
        const pendingActivities = weekDaysWithActivities.flatMap(day => 
          day.activities.filter(activity => activity.status.toLowerCase() === 'pendiente')
        );
        setPendingActivitiesCount(pendingActivities.length);
  
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };
  
    fetchActivities();
  }, [tracking.id]);

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
        const response = await axios.post(`${API_BASE_URL}/project/check-attachment`,{ project_id: idProject } );
        setIsAdmin(response.data.users.some((user: any) => 
          user.id === session?.id && user.is_admin === 1 
        ));
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus(); 
  }, [idProject]);

  // Función para refrescar actividades después de crear una nueva
  const refreshActivities = async () => {
    if (!tracking?.id) return;
  
    try {
      const config = {
        method: 'get',
        url: `${API_BASE_URL}/activities/tracking/${tracking.id}`,
        headers: {
          'Cookie': 'XSRF-TOKEN=...' // Your existing token
        }
      };
  
      const response = await axios.request(config);
      const apiActivities: Activity[] = response.data;
      
      const weekDaysWithActivities: WeekDay[] = tracking.days.map(dayLabel => {
        const dayActivities = apiActivities.filter(activity => {
          const formattedActivityDate = formatDateFromString(activity.fecha_creacion);
          return formattedActivityDate === dayLabel;
        });
  
        return {
          dayLabel,
          activities: dayActivities
        };
      });
  
      setWeekDays(weekDaysWithActivities);
  
      // Calcular el número de actividades pendientes solo para los días mostrados
      const pendingActivities = weekDaysWithActivities.flatMap(day => 
        day.activities.filter(activity => activity.status.toLowerCase() === 'pendiente')
      );
      setPendingActivitiesCount(pendingActivities.length);
  
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };
  
  // Mostrar modal para crear nueva actividad
   const showCreateModal = (date: string) => {
     setSelectedDate(date);
     setIsEditing(false);
     setSelectedActivity(null);
     setIsVisible(true);
     // Almacenar actividad vacía en localStorage
     storeActivity({
       project_id: tracking.project_id,
       tracking_id: tracking.id,
       activity: null,
       date: date,
       isAdmin: isAdmin,
       editMode: false
     });
   };

  // Mostrar modal para editar actividad existente
   const showModal = (activity: Activity, date: string) => {
     setSelectedDate(date);
     setIsEditing(true);
     setSelectedActivity(activity);
     setActivityItemCreateType('edit');
     setIsVisible(true);
     // Almacenar actividad actual en localStorage
     storeActivity({
       project_id: tracking.project_id,
       tracking_id: tracking.id,
       activity: activity as any,
       date: date,
       isAdmin: isAdmin,
       editMode: false
     });
   };

   const hideModal = async () => {
     console.log('[Activity] hideModal called');
     setIsVisible(false);
     // Eliminar actividad del localStorage al cerrar el modal
     await removeActivity();
     await refreshActivities();
   };

  // Actualizado para refrescar actividades después de guardar
  // Update the handleSaveActivity function
const handleSaveActivity = async () => {
  try {
    let success = false;
    
    if (isEditing && activityItemUpdateRef.current) {
      console.log('Attempting to update activity...');
      success = await activityItemUpdateRef.current.handleUpdateActivity();
      console.log('Update result:', success);
    }else if(isEditing && activityItemCompleteRef.current) {
      console.log('Attempting to complete activity...');
      success = await activityItemCompleteRef.current.handleUpdateActivity();
      console.log('Complete result:', success);

    }else if (activityItemCreateRef.current) {
      console.log('Attempting to create activity...');
      success = await activityItemCreateRef.current.handleCreateActivity();
      console.log('Create result:', success);
    }
    

    if (success) {
      console.log('Operation successful, refreshing activities...');
      await refreshActivities();
      hideModal();
    } else {
      console.log('Operation failed');
      // Optionally show error message to user
      // alert('Failed to save activity. Please try again.');
    }
  } catch (error) {
    console.error('Error in handleSaveActivity:', error);
    // alert('An error occurred while saving the activity.');
  }
};

  // Obtener la etiqueta del estado
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      default: return 'Programado';
    }
  };



  return (
    <View style={styles.container}>
      <ExpoStatusBar style='light' />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name='arrow-back' size={24} color='white' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleTracking}</Text>
        {isAdmin && (
        <TouchableOpacity onPress={() => setModalOptionsVisible(true)}>
          <Ionicons name='settings' size={24} color='white' />
        </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={{ backgroundColor: '#0D5A73' }}>
          <View style={styles.weekContainer}>
            <Text style={{ fontSize: 40, color: 'white', width: '80%', fontWeight: 'bold', alignSelf: 'flex-start' }}>
              {titleTracking}
            </Text>
            <Text style={styles.weekText}>Semana {tracking.currentWeekIndex}</Text>
            <Text style={styles.pendingText}>{pendingActivitiesCount} pendientes</Text>
          </View>
        </View>
        
        {weekDays.map((day) => (
          <View key={day.dayLabel} style={styles.dayContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#05222f' }}>
               <TouchableOpacity
                onPress={() => downloadDailyReport(day.dayLabel)}
                style={{ padding: 8, flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="download-outline" size={20} color="#7bc4c4" />
                <Text style={{ color: '#7bc4c4', marginLeft: 8, fontSize: 14 }}>Descargar Reporte</Text>
              </TouchableOpacity> 
              <Text style={[styles.dayTitle, { textAlign: 'right', flex: 1 }]}>
                {getDayName(day.dayLabel)} - {day.dayLabel}
              </Text>
            </View>
            {day.activities.length > 0 ? (
              day.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  showModal={() => showModal(activity, day.dayLabel)}
                  setActivityItemCreateType={setActivityItemCreateType}
                  isToday={day.dayLabel === todayFormatted}
                  isAdmin={isAdmin}
                />
              ))
            ) : (
              <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: day.dayLabel === todayFormatted ? '#0D5A73' : 'transparent' 
              }}>
              <Text style={{ color: '#aaa', textAlign: 'center', marginVertical: 10 }}>No hay actividades para este día</Text> 
              </View>
            )}
            {isAdmin && (
            <TouchableOpacity 
              style={[
                styles.addNewTaskButton,
                { backgroundColor: day.dayLabel === todayFormatted ? '#0D5A73' : 'transparent' }
              ]} 
              onPress={() => showCreateModal(day.dayLabel)}
            >
              <Text style={styles.addNewTaskText}>+ Nuevo</Text>
            </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOptionsVisible} animationType='fade' transparent={true} onRequestClose={() => setModalOptionsVisible(false)}>
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={() => setModalOptionsVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainerOptions} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalOptionsVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Seguimiento</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Renombrar seguimiento"
              placeholderTextColor="#666"
              value={trackingTitle}
              onChangeText={setTrackingTitle}
            />
            <View style={styles.modalButtonContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  style={[styles.modalSaveButton, !trackingTitle.trim() && styles.modalButtonDisabled]}
                  disabled={!trackingTitle.trim()}
                  onPress={() => {
                    handleSaveTitle();
                  }}
                >
                  <Text style={[styles.modalButtonText, !trackingTitle.trim() && styles.modalButtonTextDisabled]}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalDeleteButton}
                  onPress={() => {
                    handleDeleteTracking();
                  }}
                >
                  <Text style={styles.modalButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setModalOptionsVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

       <Modal
         transparent
         visible={isVisible}
         animationType="fade"
         onRequestClose={() => {
           console.log('[Activity] isVisible Modal onRequestClose (Android back)');
           hideModal();
         }}
       >
         <View style={styles.modalBackground} pointerEvents="box-none">
         <View
            style={styles.modalContainerInferior}
            pointerEvents="auto"
          >
            <View style={{ backgroundColor: '#05222f', flexDirection: 'row', justifyContent: 'space-between', marginTop: (StatusBar.currentHeight ?? 24) }}>
              <TouchableOpacity
                onPress={hideModal}
                style={{ width: '50%', paddingVertical: 15, paddingLeft: 10 }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveActivity}
                style={{ width: '50%', paddingVertical: 15, paddingRight: 10, alignItems: 'flex-end' }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>Guardar</Text>
              </TouchableOpacity>
            </View>
             {isEditing ? (
               selectedActivity?.status === 'completado' ? (
                 console.log('Activity status dentro:', selectedActivity?.status),
                 <ActivityItemComplete
                   ref={activityItemCompleteRef}
                   hideModal={hideModal}
                 />
               ) : (
                 <ActivityItemUpdate
                   ref={activityItemUpdateRef}
                   project_id={tracking.project_id}
                   tracking_id={tracking.id}
                   activity={selectedActivity as any}
                   date={selectedDate}
                   hideModal={hideModal}
                 />
               )

             ) : (
               <ActivityItemCreate
                 ref={activityItemCreateRef}
                 project_id={tracking.project_id}
                 tracking_id={tracking.id}
                 tipo={activityItemCreateType}
                 date={selectedDate}
                 hideModal={hideModal}
               />
             )}
           </View>
         </View>
       </Modal>

      <MessageModal
        visible={showDeleteConfirmation}
        message="¿Estás seguro que deseas eliminar este seguimiento? Esta acción no se puede deshacer."
        onClose={() => setShowDeleteConfirmation(false)}
        showConfirmButton={true}
        onConfirm={handleDeleteTracking}
      />
    </View>
  );
}

const ActivityCard: React.FC<{
  activity: Activity;
  showModal: () => void;
  setActivityItemCreateType: (type: string) => void;
  isToday: boolean;
  isAdmin: boolean;
}> = ({ activity, showModal, setActivityItemCreateType, isToday, isAdmin }) => {
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      default: return 'Programado';
    }
  };

  // Función para convertir hora de 24h a 12h con am/pm
  const convertTo12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Función para formatear la hora según si tiene inicio y fin
  const formatTimeDisplay = (horas: string) => {
    if (!horas || horas === "0") {
      return "7:30 am";
    }

    // Si tiene formato "HH:MM - HH:MM" convierte ambas horas
    if (horas.includes(" - ")) {
      const [horaInicio, horaFin] = horas.split(" - ");
      return `${convertTo12Hour(horaInicio)} - ${convertTo12Hour(horaFin)}`;
    }

    // Si solo tiene hora de inicio, convertirla a formato 12 horas
    return convertTo12Hour(horas);
  };

  const statusLabel = getStatusLabel(activity.status);

  // Definimos los colores de fondo según si es hoy o no
  const backgroundColor = isToday ? '#0D5A73' : '#053648';

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        { backgroundColor: backgroundColor,
          flexDirection: 'row',
          justifyContent: 'space-between',
         } 
      ]}
      onPress={() => {
        setActivityItemCreateType(statusLabel);
        showModal();
      }}
    >
      <View>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskStatus, {
            backgroundColor: statusLabel === 'Pendiente' ? '#F4C724'
                            : statusLabel === 'Completado' ? '#4ec291'
                            : '#0D5A73',
            color: statusLabel === 'Programado' ? '#F4C724' : '#0D465E',
            borderColor: statusLabel === 'Programado' ? '#F4C724' : 'white',
            borderWidth: statusLabel === 'Programado' ? 1 : 0,
          }]}>
            {statusLabel}
          </Text>
        
        </View>
        <Text style={styles.taskTitle}>{activity.name}</Text>
        <Text style={styles.taskTime}>{formatTimeDisplay(activity.horas)}</Text>
      </View>
      {/* Icono de la actividad 👇 */}
      <Image 
          source={iconImports[activity.icon as keyof typeof iconImports] || iconImports['casco.png']}
          style={{ 
            width: 44, 
            height: 44, 
            marginRight: 10, 
            resizeMode: 'contain',
            alignSelf: 'center'
          }} 
        />
    </TouchableOpacity>
  );
};