import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  PanResponder,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from "axios";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import ActivityItemCreate from './ActivityItemCreate';
import { styles } from "./styles/ActivityStyles";

interface Task {
  title: string;
  time: string;
  status: 'Pendiente' | 'Completado' | 'Programado';
}

interface TaskCardProps extends Task {
  setActivityItemCreateType: (type: string) => void;
  showModal: () => void;
}

interface DayTasksProps {
  day: string;
  tasks: Task[];
  showModal: () => void;
  setActivityItemCreateType: (type: string) => void;
}

const { height } = Dimensions.get('window');

export default function Activity( prop : any) {
  const navigation = useNavigation<NavigationProp<any>>();
  console.log(prop.route.params.tracking);
  const screenWidth = Dimensions.get('window').width;
  const headerWidth = React.useRef(new Animated.Value(screenWidth)).current;
  const [currentWeekIndex, setCurrentWeekIndex] = useState(2);
  const [modalOptionsVisible, setModalOptionsVisible] = useState(false);
  const [ActivityItemCreateType, setActivityItemCreateType] = useState('Programado');
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [tasksData, setTasksData] = useState<{ [key: string]: Task[] }>({});
  const [titleTracking, setTitleTracking] = useState(prop.route.params.tracking.title);
  const [tracking, setTracking] = useState(prop.route.params.tracking);


  useEffect(() => {
    const obtenerSeguimientos = async () => {
      if (!tracking?.id) return;


      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://centroesteticoedith.com/endpoint/activities/tracking/'+tracking.id,
        headers: { 
          'Cookie': 'XSRF-TOKEN=eyJpdiI6Ii9hRFhLR2xFRjBTU3NxaEQ3SU8rWUE9PSIsInZhbHVlIjoiMUxnVldxYTUvYXNyMXkvdGRVaUxZYVJsSkhMY2s1NUROR3Y1dmdsMlBtRTNnZTh3VGtLM2NpdWx3aC92V3BEUWlBSHdlVWozbTRQVk9qRkJiUjE0ejNVTHhZU0h0L1hHZ2R2UWhQamsxSTFUMFZndUEvakZDQ3hGVmZDaldrSTAiLCJtYWMiOiIwZGUzM2U3YWQ5MGEwNjkyY2IyZjk5ZjcwYzBkOWE2MjJlNDVkYmZkMGVmZWZhNjBjODJjNmYwYjUwODY3OTcyIiwidGFnIjoiIn0%3D; laravel_session=eyJpdiI6IlVxVXlWUEUydllIdUN0WmE5YzgweVE9PSIsInZhbHVlIjoiNVVSN2pGcW9GYnFCOEk4cnpNS3VsbzRLb2dlL1o4WEN2YUJ1UzM3WkdMM3R1akR0c3IxeDdVanMvT0hrTkcrWXlrU3FNT3RtaDZXNTBNOHl0T1pHWDhCOE5KV2pONjFDNDdIdkJaNnJEeUJsUitHY3JyUjNEaVRPc3Y1R09peC8iLCJtYWMiOiI2M2VhZWYyNTA0Mzk5YTM3OTk0OGQ0MDZmOTk2ZTZmZmQ5YWUzOThkMTY3NjY2ZjRkMGNjMmM2ZTZmMDc5YTJiIiwidGFnIjoiIn0%3D'
        }
      };
      
      axios.request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
      
      
    };

    obtenerSeguimientos();
    
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  const showModal = () => {
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
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

  useEffect(() => {
    // Simulamos la llamada a la API
    let days = tracking.days;
    /*  
      "days": ["24/2", "25/2", "26/2", "27/2", "28/2", "1/3", "2/3"]
    */
    const apiData = [
  
      {
        "id": 50,
        "day_id": 8,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 92,
        "day_id": 8,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      },
      {
        "id": 9,
        "day_id": 9,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de equipo",
        "description": "Reuni\u00f3n semanal para discutir el progreso del proyecto.",
        "location": "Sala de conferencias",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "pendiente",
        "icon": "calendar",
        "image": null,
        "comments": "Traer el informe de avance.",
        "created_at": "2025-02-09T18:22:20.000000Z",
        "updated_at": "2025-02-09T18:22:20.000000Z"
      },
      {
        "id": 51,
        "day_id": 9,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 93,
        "day_id": 9,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      },
      {
        "id": 10,
        "day_id": 10,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de equipo",
        "description": "Reuni\u00f3n semanal para discutir el progreso del proyecto.",
        "location": "Sala de conferencias",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "pendiente",
        "icon": "calendar",
        "image": null,
        "comments": "Traer el informe de avance.",
        "created_at": "2025-02-09T18:22:20.000000Z",
        "updated_at": "2025-02-09T18:22:20.000000Z"
      },
      {
        "id": 52,
        "day_id": 10,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 94,
        "day_id": 10,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      },
      {
        "id": 11,
        "day_id": 11,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de equipo",
        "description": "Reuni\u00f3n semanal para discutir el progreso del proyecto.",
        "location": "Sala de conferencias",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "pendiente",
        "icon": "calendar",
        "image": null,
        "comments": "Traer el informe de avance.",
        "created_at": "2025-02-09T18:22:20.000000Z",
        "updated_at": "2025-02-09T18:22:20.000000Z"
      },
      {
        "id": 53,
        "day_id": 11,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 95,
        "day_id": 11,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      },
      {
        "id": 12,
        "day_id": 12,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de equipo",
        "description": "Reuni\u00f3n semanal para discutir el progreso del proyecto.",
        "location": "Sala de conferencias",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "pendiente",
        "icon": "calendar",
        "image": null,
        "comments": "Traer el informe de avance.",
        "created_at": "2025-02-09T18:22:20.000000Z",
        "updated_at": "2025-02-09T18:22:20.000000Z"
      },
      {
        "id": 54,
        "day_id": 12,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 96,
        "day_id": 12,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      },
      {
        "id": 13,
        "day_id": 13,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de equipo",
        "description": "Reuni\u00f3n semanal para discutir el progreso del proyecto.",
        "location": "Sala de conferencias",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "pendiente",
        "icon": "calendar",
        "image": null,
        "comments": "Traer el informe de avance.",
        "created_at": "2025-02-09T18:22:20.000000Z",
        "updated_at": "2025-02-09T18:22:20.000000Z"
      },
      {
        "id": 55,
        "day_id": 13,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 97,
        "day_id": 13,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      },
      {
        "id": 14,
        "day_id": 14,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de equipo",
        "description": "Reuni\u00f3n semanal para discutir el progreso del proyecto.",
        "location": "Sala de conferencias",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "pendiente",
        "icon": "calendar",
        "image": null,
        "comments": "Traer el informe de avance.",
        "created_at": "2025-02-09T18:22:20.000000Z",
        "updated_at": "2025-02-09T18:22:20.000000Z"
      },
      {
        "id": 56,
        "day_id": 14,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de Planificaci\u00f3n",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T02:02:41.000000Z",
        "updated_at": "2025-02-11T02:02:41.000000Z"
      },
      {
        "id": 98,
        "day_id": 14,
        "project_id": 1,
        "user_id": 1,
        "name": "Reuni\u00f3n de TERCERA",
        "description": "Reuni\u00f3n para planificar las actividades del pr\u00f3ximo mes.",
        "location": "Sala de Conferencias A",
        "hour_start": "09:00:00",
        "hour_end": "10:00:00",
        "status": "programada",
        "icon": "calendar-icon.png",
        "image": null,
        "comments": "Traer informes del mes pasado.",
        "created_at": "2025-02-11T03:21:49.000000Z",
        "updated_at": "2025-02-11T03:21:49.000000Z"
      }
    ]

    // Transformar los datos de la API
    const transformedData: { [key: string]: Task[] } = {};
    apiData.forEach((item) => {
      const day = `Día ${item.day_id}`;
      if (!transformedData[day]) {
        transformedData[day] = [];
      }
      transformedData[day].push({
        title: item.name,
        time: `${item.hour_start.slice(0, 5)} - ${item.hour_end.slice(0, 5)}`,
        status: item.status === 'pendiente' ? 'Pendiente' : item.status === 'programada' ? 'Programado' : 'Completado',
      });
    });

    setTasksData(transformedData);
  }, []);

  return (
    <View style={styles.container}>
      <ExpoStatusBar style='light' />
      <View style={[styles.header, { width: headerWidth }]}>
        <TouchableOpacity onPress={goBack}>
          <MaterialIcons name='arrow-back' size={24} color='white' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> {titleTracking}</Text>
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
            <Text style={styles.pendingText}>3 pendientes</Text>
          </View>
        </View>
        {Object.keys(tasksData).map((day) => (
          <DayTasks
            key={day}
            day={day}
            tasks={tasksData[day]}
            showModal={showModal}
            setActivityItemCreateType={setActivityItemCreateType}
          />
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
      <Modal transparent visible={isVisible} animationType="none">
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainerInferior, { transform: [{ translateY: slideAnim }] }]} {...panResponder.panHandlers}>
            <View style={{ backgroundColor: '#05222f', flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={hideModal} style={{ width: '50%', paddingVertical: 10, paddingLeft: 10 }}>
                <Text style={{ color: 'white' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '50%', paddingVertical: 10, paddingRight: 10, alignItems: 'flex-end' }}>
                <Text style={{ color: 'white' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
            <ActivityItemCreate tipo={ActivityItemCreateType} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const DayTasks: React.FC<DayTasksProps> = ({ day, tasks, showModal, setActivityItemCreateType }) => (
  <View style={styles.dayContainer}>
    <Text style={[styles.dayTitle, { width: '100%', textAlign: 'right' }]}>{day}</Text>
    {tasks.map((task, index) => (
      <TaskCard key={index} {...task} setActivityItemCreateType={setActivityItemCreateType} showModal={showModal} />
    ))}
    <TouchableOpacity style={styles.addNewTaskButton} onPress={showModal}>
      <Text style={styles.addNewTaskText}>+ Nuevo</Text>
    </TouchableOpacity>
  </View>
);

const TaskCard: React.FC<TaskCardProps> = ({ title, time, status, setActivityItemCreateType, showModal }) => (
  <TouchableOpacity style={styles.taskCard} onPress={() => {
    setActivityItemCreateType(status === 'Completado' ? 'Completado' : status === 'Pendiente' ? 'Pendiente' : 'Programado');
    showModal();
  }}>
    <View style={styles.taskHeader}>
      <Text style={[styles.taskStatus, {
        backgroundColor: status === 'Pendiente' ? '#F4C724' : status === 'Completado' ? '#4ec291' : '#056375',
        color: status === 'Programado' ? '#F4C724' : '#0D465E',
        borderColor: status === 'Programado' ? '#F4C724' : 'white',
        borderWidth: status === 'Programado' ? 1 : 0,
      }]}>
        {status}
      </Text>
      <Feather name="truck" size={24} color="white" />
    </View>
    <Text style={styles.taskTitle}>{title}</Text>
    <Text style={styles.taskTime}>{time}</Text>
  </TouchableOpacity>
);


