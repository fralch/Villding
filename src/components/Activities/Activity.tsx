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
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from "axios";
import { MaterialIcons, MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import ActivityItemCreate, { ActivityItemCreateRef } from './ActivityItemCreate';
import { styles } from "./styles/ActivityStyles";

interface Activity {
  id: number;
  project_id: number;
  tracking_id: number;
  name: string;
  description: string;
  location: string;
  horas: string;
  status: string;
  icon: string;
  image: string | null;
  comments: string;
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
  
  const [modalOptionsVisible, setModalOptionsVisible] = useState(false);
  const [activityItemCreateType, setActivityItemCreateType] = useState('Pendiente');
  const [selectedDate, setSelectedDate] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  const [titleTracking, setTitleTracking] = useState(props.route.params.tracking.title);
  const [tracking, setTracking] = useState<Tracking>(props.route.params.tracking);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [pendingActivitiesCount, setPendingActivitiesCount] = useState(0);

  const getDayName = (dateString: string) => {
    const days = [ 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [day, month] = dateString.split('/').map(Number);
    const date = new Date(2024, month - 1, day);
    return days[date.getDay()];
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
            const activityDate = new Date(activity.created_at);
            const formattedActivityDate = `${activityDate.getDate()}/${activityDate.getMonth() + 1}`;
            return formattedActivityDate === dayLabel;
          });

          return {
            dayLabel,
            activities: dayActivities
          };
        });

        setWeekDays(weekDaysWithActivities);

        const pendingActivities = apiActivities.filter(activity => 
          activity.status.toLowerCase() === 'pendiente'
        );
        setPendingActivitiesCount(pendingActivities.length);

      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [tracking.id]);

  const showModal = (date: string) => {
    setSelectedDate(date);
    setIsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  // New method to handle saving the activity
  const handleSaveActivity = async () => {
    if (activityItemCreateRef.current) {
      const success = await activityItemCreateRef.current.handleCreateActivity();
      if (success) {
        // Optional: Refresh activities or perform any other actions
        hideModal();
      }
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
        <View style={{ backgroundColor: '#034757' }}>
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
            {day.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                showModal={() => showModal(day.dayLabel)}
                setActivityItemCreateType={setActivityItemCreateType}
              />
            ))}
          <TouchableOpacity 
                style={styles.addNewTaskButton} 
                onPress={() => showModal(day.dayLabel)}
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
            <ActivityItemCreate 
              ref={activityItemCreateRef}
              project_id={tracking.project_id}
              tracking_id={tracking.id}
              tipo={activityItemCreateType} 
              date={selectedDate} 
            />
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
}> = ({ activity, showModal, setActivityItemCreateType }) => {
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      default: return 'Programado';
    }
  };

  const statusLabel = getStatusLabel(activity.status);

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        setActivityItemCreateType(statusLabel);
        showModal();
      }}
    >
      <View style={styles.taskHeader}>
        <Text style={[styles.taskStatus, {
          backgroundColor: statusLabel === 'Pendiente' ? '#F4C724'
                          : statusLabel === 'Completado' ? '#4ec291'
                          : '#056375',
          color: statusLabel === 'Programado' ? '#F4C724' : '#0D465E',
          borderColor: statusLabel === 'Programado' ? '#F4C724' : 'white',
          borderWidth: statusLabel === 'Programado' ? 1 : 0,
        }]}>
          {statusLabel}
        </Text>
        <Feather name="truck" size={24} color="white" />
      </View>
      <Text style={styles.taskTitle}>{activity.name}</Text>
      <Text style={styles.taskTime}>{activity.horas} horas</Text>
    </TouchableOpacity>
  );
};