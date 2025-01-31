import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getProject } from '../../hooks/localStorageCurrentProject';
import { getSesion} from '../../hooks/localStorageUser';
import axios from 'axios';

interface Tracking {
  id: number;
  week_id: number;
  project_id: number;
  user_id: number;
  title: string;
  description: string;
  date_start: string | null;
  date_end: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  checked?: number[]; // Propiedad opcional
}

interface TrackingSection {
  id: string;
  week_id: number;
  trackings: Tracking[];
}

interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  start_date: string;
  end_date: string;
  week: number;
  week_current: number;
}

interface User {
  id: any;
  nombres: string;
  apellidos: string;
  email: string;
  email_contact?: string;
  password: string;
  rol: string;
  user_code: string;
  telefono?: string;
  edad? : number;
  uri?: string;
}

const TaskList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [modalSeguimientoVisible, setModalSeguimientoVisible] = useState(false);
  const [modalSinAccesoVisible, setModalSinAccesoVisible] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [arrayWeeks, setArrayWeeks] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]);
  const [daysProject, setDaysProject] = useState<any[]>([]);
  // estados para crear nuevo seguimiento
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [titleTracking, setTitleTracking] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      const project = await getProject();
      if (project && typeof project === 'string') {
        const projectObject = JSON.parse(project);
        setProject(projectObject);

        try {
          // Hace una petición GET a la API para obtener las semanas del proyecto actual
          const weeksResponse = await axios.get(`https://centroesteticoedith.com/endpoint/weeks/${projectObject.id}`);
          setArrayWeeks(weeksResponse.data);

          // Crea un array con los nombres de las semanas (ej: "Semana 1", "Semana 2", etc)
          const weeksArray = Array.from({ length: weeksResponse.data.length }, (_, i) => `Semana ${i + 1}`);
          setWeeks(weeksArray);

          // Obtiene el número de la semana actual del proyecto
          const number_week_current_project = projectObject.week_current;
          // Actualiza el índice de la semana actual (restando 2 porque los arrays empiezan en 0)
          const today = new Date();
          const isSunday = today.getDay() === 0;
          setCurrentWeekIndex(number_week_current_project - (isSunday ? 2 : 1));

          // Obtiene los datos de la API de trackings
          const trackingResponse = await axios.get(`https://centroesteticoedith.com/endpoint/trackings_project/${projectObject.id}`);
          const trackingData = trackingResponse.data;

          // Transforma los datos de la API en el formato deseado
          const newTrackingSections: TrackingSection[] = trackingData.map((week: any) => ({
            id: week.id.toString(),
            week_id: week.id,
            trackings: week.trackings.map((tracking: any) => ({
              ...tracking, // Copia todas las propiedades existentes del tracking
              checked: tracking.checked || [], // Si `checked` no existe, usa un array vacío
            })),
          }));

          // Guarda las secciones en el estado
          setTrackingSections(newTrackingSections);

          // Obtiene los días del proyecto
          const daysResponse = await axios.get(`https://centroesteticoedith.com/endpoint/days_project/${projectObject.id}`);
          setDaysProject(daysResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  React.useEffect(() => {
      getSesion().then((StoredSesion : any) => {
        let sesion = JSON.parse(StoredSesion);
        console.log(sesion);
        setUser(sesion);
      });
  }, [ ]);

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  // Función que obtiene las fechas de la semana actual
  const getDatesForCurrentWeek = () => {
    // Obtiene el ID de la semana actual usando el índice actual del array de semanas
    const currentWeekId = arrayWeeks[currentWeekIndex]?.id;

    // Filtra los días del proyecto para obtener solo los de la semana actual
    // y los ordena cronológicamente por fecha
    return daysProject.filter(day => day.week_id === currentWeekId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calcula el índice del día actual
  const getCurrentDayIndex = (): number => {
    const today = new Date();
    const jsDayIndex = today.getDay();
    return jsDayIndex === 0 ? 6 : jsDayIndex - 1;
  };

  // Calcula la fecha para cada día de la semana
  const getDateForDay = (index: number): string => {
    const currentWeekDays = getDatesForCurrentWeek();
    const dayData = currentWeekDays[index];
    if (!dayData) return '';
    const date = new Date(dayData.date);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
  };


  const handleNewTracking = () => {
    const data = {
      project_id: project?.id, 
      user_id:  user?.id,
      title: titleTracking,
      description: "Descripcion"
    };
    
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    console.log(data);
    
    // axios.post("https://centroesteticoedith.com/endpoint/trackings/create", data, config)
    //   .then((response) => {
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekSelector}>
        <TouchableOpacity
          onPress={handlePreviousWeek}
          disabled={currentWeekIndex === 0}
        >
          <Ionicons
            name='chevron-back'
            size={30}
            color={currentWeekIndex === 0 ? '#07374a' : 'white'}
          />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>{weeks[currentWeekIndex]}</Text>
        <TouchableOpacity
          onPress={handleNextWeek}
          disabled={currentWeekIndex === weeks.length - 1}
        >
          <Ionicons
            name='chevron-forward'
            size={30}
            color={currentWeekIndex === weeks.length - 1 ? '#07374a' : 'white'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, index) => {
          const currentDate = getDateForDay(index);
          const todayIndex = getCurrentDayIndex();
          const isToday = index === todayIndex;

          return (
            <View
              key={index}
              style={[
                styles.dayColumn,
                isToday && { backgroundColor: '#0A3649', borderRadius: 8 },
              ]}
            >
              <Text style={[styles.dayText, isToday && { color: '#4ABA8D' }]}>
                {day}
              </Text>
              <Text style={[styles.dateText, isToday && { color: '#4ABA8D' }]}>
                {currentDate}
              </Text>
            </View>
          );
        })}
      </View>

      <FlatList
        style={styles.flatList}
        data={trackingSections.filter(section => section.week_id === arrayWeeks[currentWeekIndex]?.id)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScrollView style={styles.trackingSection}>
            {item.trackings.map((tracking: Tracking) => (
              <TouchableOpacity
                key={tracking.id}
                style={styles.taskRow}
                onLongPress={() => setModalSinAccesoVisible(true)}
                onPress={() => navigation.navigate('Task')}
              >
                <Text style={styles.taskTitle}>{tracking.title}</Text>
                <View style={styles.iconRow}>
                  {tracking.checked && tracking.checked.map((isChecked, i) => (
                    <View
                      key={i}
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor:
                            isChecked === -1 ? '#004e66' : '#0A3649',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isChecked == 1
                            ? 'checkmark'
                            : isChecked == -1
                            ? 'ellipse-outline'
                            : 'ellipse-sharp'
                        }
                        size={isChecked === 1 ? 24 : 12}
                        color={isChecked === 1 ? '#4ABA8D' : '#D1A44C'}
                        style={styles.icon}
                      />
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalSeguimientoVisible(true)}
      >
        <Ionicons
          name='add-circle-outline'
          size={24}
          color='#7bc4c4'
        />
        <Text style={styles.addButtonText}>Añadir seguimiento</Text>
      </TouchableOpacity>

      <Modal
        visible={modalSeguimientoVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setModalSeguimientoVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>Añadir seguimiento</Text>
              <Pressable onPress={() => setModalSeguimientoVisible(false)}>
                <Ionicons
                  name='close-outline'
                  size={30}
                  color='white'
                />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder='Nombre del seguimiento'
              placeholderTextColor='#777'
              onChangeText={(text: string) => setTitleTracking(text)}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 8,
                marginTop: 16,
              }}
            >
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setModalSeguimientoVisible(false);
                      handleNewTracking();
                    }}
                  >
                    <Text
                      style={[styles.modalButtonText, { paddingHorizontal: 10 }]}
                    >
                      Guardar
                    </Text>
                  </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: '#004e66',
                    borderColor: 'white',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setModalSeguimientoVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: 'white', paddingHorizontal: 10 },
                  ]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={modalSinAccesoVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setModalSinAccesoVisible(false)}
      >
        <Pressable
          style={[styles.modalContainer, { justifyContent: 'flex-end' }]}
          onPress={() => setModalSinAccesoVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: '#CFA54A' }]}>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: '#07374a', marginBottom: 0 },
                ]}
              >
                No tienes acceso
              </Text>
            </View>
            <Text
              style={{
                color: '#07374a',
                fontSize: 16,
              }}
            >
              Pídele al administrador que te comparta esta actividad
            </Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07374a',
    paddingHorizontal: 0,
  },
  weekSelector: {
    backgroundColor: '#05222F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: 'stretch',
    marginVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  weekTitle: {
    color: 'white',
    fontSize: 20,
    marginHorizontal: 10,
  },
  daysRow: {
    backgroundColor: '#05222F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 1,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayText: {
    color: 'white',
    fontSize: 14,
  },
  dateText: {
    color: '#7bc4c4',
    fontSize: 12,
  },
  trackingSection: {
    marginVertical: 0,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  taskRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#004e66',
    borderRadius: 8,
    marginBottom: 5,
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  iconContainer: {
    backgroundColor: '#0A3649',
    borderRadius: 5,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '14%',
    height: 40,
  },
  icon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#07374a',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#7bc4c4',
    fontSize: 18,
    marginLeft: 10,
  },
  flatList: {
    flex: 1,
    backgroundColor: '#07374a',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#0A3649',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    width: '90%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#0A3649',
    fontSize: 16,
  },
  modalInput: {
    backgroundColor: '#05222F',
    color: 'white',
    fontSize: 16,
    width: '80%',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    borderColor: '#0A3649',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
});

export default TaskList;