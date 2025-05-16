/* Este componente es el encargado de mostrar las actividades de un seguimiento */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  PanResponder,
  Image,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from "axios";
import { MaterialIcons, MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import ActivityItemCreate, { ActivityItemCreateRef } from './ActivityItemCreate';
import ActivityItemUpdate, { ActivityItemUpdateRef } from './ActivityItemUpdate';
import ActivityItemComplete, { ActivityItemCompleteRef } from './ActivityItemComplete';
import { getSesion } from '../../hooks/localStorageUser';
import {iconImports} from './icons';
import { styles } from "./styles/ActivityStyles";
import { storeActivity, removeActivity } from '../../hooks/localStorageCurrentActvity';


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
  const [activityItemCreateType, setActivityItemCreateType] = useState('Pendiente');
  const [selectedDate, setSelectedDate] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  
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

  useEffect(() => {
    const fetchActivities = async () => {
      if (!tracking?.id) return;
  
      try {
        const config = {
          method: 'get',
          url: `https://centroesteticoedith.com/endpoint/activities/tracking/${tracking.id}`,
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
        const response = await axios.post("https://centroesteticoedith.com/endpoint/project/check-attachment",{ project_id: idProject } );
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
        url: `https://centroesteticoedith.com/endpoint/activities/tracking/${tracking.id}`,
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
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = async () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      setIsVisible(false);
      // Eliminar actividad del localStorage al cerrar el modal
      await removeActivity();
      await refreshActivities();
    });
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
      alert('Failed to save activity. Please try again.');
    }
  } catch (error) {
    console.error('Error in handleSaveActivity:', error);
    alert('An error occurred while saving the activity.');
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          hideModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <ExpoStatusBar style='light' />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name='arrow-back' size={24} color='white' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleTracking}</Text>
        <TouchableOpacity onPress={() => setModalOptionsVisible(true)}>
          <MaterialIcons name='more-vert' size={24} color='white' />
        </TouchableOpacity>
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
            <Text style={[styles.dayTitle, { width: '100%', textAlign: 'right' }]}>
              {getDayName(day.dayLabel)} - {day.dayLabel}
            </Text>
            {day.activities.length > 0 ? (
              day.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  showModal={() => showModal(activity, day.dayLabel)}
                  setActivityItemCreateType={setActivityItemCreateType}
                  isToday={day.dayLabel === todayFormatted}
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
            <TouchableOpacity 
              style={[
                styles.addNewTaskButton,
                { backgroundColor: day.dayLabel === todayFormatted ? '#0D5A73' : 'transparent' }
              ]} 
              onPress={() => showCreateModal(day.dayLabel)}
            >
              <Text style={styles.addNewTaskText}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOptionsVisible} animationType='fade' transparent={true} onRequestClose={() => setModalOptionsVisible(false)}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalContainerOptions} onPressOut={() => setModalOptionsVisible(false)}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'white' }}>Seguimiento</Text>
            <View style={{ marginLeft: 0 }}>
              <TouchableOpacity style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>
                <Ionicons name="share-social-sharp" size={18} color="white" />
                <Text style={{ marginLeft: 10, color: 'white' }}>Compartir enlace</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>
                <MaterialCommunityIcons name="pencil" size={18} color="white" />
                <Text style={{ marginLeft: 10, color: 'white' }}>Renombrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>
                <Ionicons name="settings" size={18} color="white" />
                <Text style={{ marginLeft: 10, color: 'white' }}>Configurar seguimiento</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Modal>

      <Modal 
        transparent 
        visible={isVisible} 
        animationType="none"
      >
        <View style={styles.modalBackground}>
          <Animated.View 
            style={[
              styles.modalContainerInferior, 
              { transform: [{ translateY: slideAnim }] }
            ]} 
            {...panResponder.panHandlers}
          >
            <View style={{ backgroundColor: '#05222f', flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                onPress={hideModal} 
                style={{ width: '50%', paddingVertical: 10, paddingLeft: 10 }}
              >
                <Text style={{ color: 'white' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveActivity}
                style={{ width: '50%', paddingVertical: 10, paddingRight: 10, alignItems: 'flex-end' }}
              >
                <Text style={{ color: 'white' }}>Guardar</Text>
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
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const ActivityCard: React.FC<{
  activity: Activity;
  showModal: () => void;
  setActivityItemCreateType: (type: string) => void;
  isToday: boolean;
}> = ({ activity, showModal, setActivityItemCreateType, isToday }) => {
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      default: return 'Programado';
    }
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
        <Text style={styles.taskTime}>{activity.horas} horas</Text>
      </View>
      <Image 
          source={iconImports[activity.icon as keyof typeof iconImports] || iconImports['casco.png']}
          style={{ 
            width: 36, 
            height: 36, 
            marginRight: 10, 
            resizeMode: 'contain',
            alignSelf: 'center'
          }} 
        />
    </TouchableOpacity>
  );
};