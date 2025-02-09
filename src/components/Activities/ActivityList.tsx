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
import { getSesion } from '../../hooks/localStorageUser';
import ConfirmModal from "../Alerta/ConfirmationModal";
import axios from 'axios';

// Definición de interfaces para los tipos de datos utilizados en el componente
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
  checked?: number[];
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
  edad?: number;
  uri?: string;
}

interface DiaProyecto {
  id: number;
  project_id: number;
  week_id: number;
  date: string; // La fecha viene como string desde la API
  created_at: string;
  updated_at: string;
}

const ActivityList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // Estados para manejar la visibilidad de los modales y otros datos
  const [modalSeguimientoVisible, setModalSeguimientoVisible] = useState(false);
  const [modalSinAccesoVisible, setModalSinAccesoVisible] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [arrayWeeks, setArrayWeeks] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]);
  const [daysProject, setDaysProject] = useState<DiaProyecto[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [titleTracking, setTitleTracking] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [msjeModal, setMsjeModal] = useState("El usuario se ha registrado correctamente.");

  // useEffect para cargar datos del proyecto y semanas al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      const project = await getProject();
      if (project && typeof project === 'string') {
        const projectObject = JSON.parse(project);
        setProject(projectObject);

        try {
          // Obtener semanas del proyecto
          const weeksResponse = await axios.get(`https://centroesteticoedith.com/endpoint/weeks/${projectObject.id}`);
          setArrayWeeks(weeksResponse.data);

          // Crear un array de nombres de semanas
          const weeksArray = Array.from({ length: weeksResponse.data.length }, (_, i) => `Semana ${i + 1}`);
          setWeeks(weeksArray);

          // Determinar la semana actual
          const number_week_current_project = projectObject.week_current;
          const today = new Date();
          const isSunday = today.getDay() === 0;
          setCurrentWeekIndex(number_week_current_project - (isSunday ? 2 : 1));

          // Obtener seguimientos del proyecto
          const trackingResponse = await axios.get(`https://centroesteticoedith.com/endpoint/trackings_project/${projectObject.id}`);
          const trackingData = trackingResponse.data;

          // Mapear los datos de seguimiento a la estructura TrackingSection
          const newTrackingSections: TrackingSection[] = trackingData.map((week: any) => ({
            id: week.id.toString(),
            week_id: week.id,
            trackings: week.trackings.map((tracking: any) => ({
              ...tracking,
              checked: tracking.checked || [],
            })),
          }));

          setTrackingSections(newTrackingSections);

          // Obtener días del proyecto
          const daysResponse = await axios.get(`https://centroesteticoedith.com/endpoint/days_project/${projectObject.id}`);
          setDaysProject(daysResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  // useEffect para obtener la sesión del usuario
  useEffect(() => {
    getSesion().then((StoredSesion: any) => {
      let sesion = JSON.parse(StoredSesion);
      setUser(sesion);
    });
  }, []);

  // useEffect para verificar si el proyecto ha comenzado o ha concluido
  useEffect(() => {
    if (project?.id) {
      axios.get<DiaProyecto[]>(`https://centroesteticoedith.com/endpoint/days_project/${project.id}`)
        .then(response => {
          const diasProyecto = response.data;
          const fechaActual = new Date();
          const fechaInicio = new Date(diasProyecto[0]?.date);
          const fechaFin = new Date(diasProyecto[diasProyecto.length - 1]?.date);

          if (fechaActual < fechaInicio) {
            setShowModal(true);
            setMsjeModal("El Proyecto no ha comenzado.");
          } else if (fechaActual > fechaFin) {
            setShowModal(true);
            setMsjeModal("El Proyecto ya ha concluido.");
          }
        })
        .catch(error => {
          console.error("Error al obtener los días del proyecto:", error);
        });
    }
  }, [project]);

  // useEffect para ajustar la semana basada en la fecha actual
  useEffect(() => {
    const adjustWeekBasedOnDate = () => {
      const today = new Date();
      const currentWeekDays = getDatesForCurrentWeek();

      if (currentWeekDays.length === 0) return;

      const currentWeekStartDate = new Date(currentWeekDays[0].date);
      const currentWeekEndDate = new Date(currentWeekDays[currentWeekDays.length - 1].date);

      if (today < currentWeekStartDate) {
        setCurrentWeekIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (today > currentWeekEndDate) {
        setCurrentWeekIndex((prevIndex) => Math.min(prevIndex + 1, weeks.length - 1));
      }
    };

    adjustWeekBasedOnDate();
  }, [daysProject]);

  // Función para manejar la navegación a la siguiente semana
  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  // Función para manejar la navegación a la semana anterior
  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  // Función para obtener las fechas de la semana actual
  const getDatesForCurrentWeek = () => {
    const currentWeekId = arrayWeeks[currentWeekIndex]?.id;
    return daysProject.filter(day => day.week_id === currentWeekId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Función para obtener el índice del día actual
  const getCurrentDayIndex = (): number => {
    const today = new Date();
    const jsDayIndex = today.getDay();
    return jsDayIndex === 0 ? 6 : jsDayIndex - 1;
  };

  // Función para obtener la fecha para un día específico
  const getDateForDay = (index: number): string => {
    const currentWeekDays = getDatesForCurrentWeek();
    const dayData = currentWeekDays[index];
    if (!dayData) return '';
    const date = new Date(dayData.date);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
  };

  // Función para manejar la creación de un nuevo seguimiento
  const handleNewTracking = () => {
    const data = {
      project_id: project?.id,
      user_id: user?.id,
      title: titleTracking,
      description: "Descripcion"
    };

    axios.post("https://centroesteticoedith.com/endpoint/trackings/create", data, {
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => {
        const newTrackings: Tracking[] = response.data.trackings;

        const updatedSections = trackingSections.map(section => {
          const weekTrackings = newTrackings.filter((tracking: Tracking) => tracking.week_id === section.week_id);
          if (weekTrackings.length > 0) {
            return {
              ...section,
              trackings: [...section.trackings, ...weekTrackings]
            };
          }
          return section;
        });

        setTrackingSections(updatedSections);
        setModalSeguimientoVisible(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Función para volver al proyecto
  const backToProject = () => {
    navigation.navigate("HomeProject");
  };

  return (
    <View style={styles.container}>
      <ConfirmModal
        visible={showModal}
        message={msjeModal}
        onClose={() => {
          setShowModal(false);
          backToProject();
        }}
      />
      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={handlePreviousWeek} disabled={currentWeekIndex === 0}>
          <Ionicons name='chevron-back' size={30} color={currentWeekIndex === 0 ? '#07374a' : 'white'} />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>{weeks[currentWeekIndex]}</Text>
        <TouchableOpacity onPress={handleNextWeek} disabled={currentWeekIndex === weeks.length - 1}>
          <Ionicons name='chevron-forward' size={30} color={currentWeekIndex === weeks.length - 1 ? '#07374a' : 'white'} />
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, index) => {
          const currentDate = getDateForDay(index);
          const todayIndex = getCurrentDayIndex();
          const isToday = index === todayIndex;

          return (
            <View key={index} style={[styles.dayColumn, isToday && { backgroundColor: '#0A3649', borderRadius: 8 }]}>
              <Text style={[styles.dayText, isToday && { color: '#4ABA8D' }]}>{day}</Text>
              <Text style={[styles.dateText, isToday && { color: '#4ABA8D' }]}>{currentDate}</Text>
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
                    <View key={i} style={[styles.iconContainer, { backgroundColor: isChecked === -1 ? '#004e66' : '#0A3649' }]}>
                      <Ionicons
                        name={isChecked == 1 ? 'checkmark' : isChecked == -1 ? 'ellipse-outline' : 'ellipse-sharp'}
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

      <TouchableOpacity style={styles.addButton} onPress={() => setModalSeguimientoVisible(true)}>
        <Ionicons name='add-circle-outline' size={24} color='#7bc4c4' />
        <Text style={styles.addButtonText}>Añadir seguimiento</Text>
      </TouchableOpacity>

      <Modal visible={modalSeguimientoVisible} animationType='slide' transparent={true} onRequestClose={() => setModalSeguimientoVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>Añadir seguimiento</Text>
              <Pressable onPress={() => setModalSeguimientoVisible(false)}>
                <Ionicons name='close-outline' size={30} color='white' />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder='Nombre del seguimiento'
              placeholderTextColor='#777'
              onChangeText={(text: string) => setTitleTracking(text)}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 16 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#004e66', borderColor: 'white', borderWidth: 1 }]} onPress={() => setModalSeguimientoVisible(false)}>
                <Text style={[styles.modalButtonText, { color: 'white', paddingHorizontal: 10 }]}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => { setModalSeguimientoVisible(false); handleNewTracking(); }}>
                <Text style={[styles.modalButtonText, { paddingHorizontal: 10 }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalSinAccesoVisible} animationType='slide' transparent={true} onRequestClose={() => setModalSinAccesoVisible(false)}>
        <Pressable style={[styles.modalContainer, { justifyContent: 'flex-end' }]} onPress={() => setModalSinAccesoVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: '#CFA54A' }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: '#07374a', marginBottom: 0 }]}>No tienes acceso</Text>
            </View>
            <Text style={{ color: '#07374a', fontSize: 16 }}>Pídele al administrador que te comparta esta actividad</Text>
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

export default ActivityList;
