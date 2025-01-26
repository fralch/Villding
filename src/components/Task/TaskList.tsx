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
import axios from 'axios';

interface Task {
  id: string;
  title: string;
  checked: number[];
}

interface Section {
  id: string;
  tasks: Task[];
}

const TaskList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [modalSeguimientoVisible, setModalSeguimientoVisible] = useState(false);
  const [modalSinAccesoVisible, setModalSinAccesoVisible] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [arrayWeeks, setArrayWeeks] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [daysProject, setDaysProject] = useState<any[]>([]);

  useEffect(() => {
    getProject().then((project) => {
      if (project && typeof project === 'string') {
        const projectObject = JSON.parse(project);

        // Hace una petición GET a la API para obtener las semanas del proyecto actual
        axios.get(`https://centroesteticoedith.com/endpoint/weeks/${projectObject.id}`)
          .then((response) => {
            // Guarda la respuesta de las semanas en el estado arrayWeeks
            setArrayWeeks(response.data);

            // Crea un array con los nombres de las semanas (ej: "Semana 1", "Semana 2", etc)
            // basado en la longitud de la respuesta
            const weeksArray = Array.from({ length: response.data.length }, (_, i) =>
              `Semana ${i + 1}`
            );
            // Guarda el array de nombres de semanas en el estado
            setWeeks(weeksArray);

            // Obtiene el número de la semana actual del proyecto
            const number_week_current_project = projectObject.week_current;
            // Actualiza el índice de la semana actual (restando 2 porque los arrays empiezan en 0)
            setCurrentWeekIndex(number_week_current_project - 2);

            // Crea una estructura inicial de secciones con tareas de ejemplo
            // Esto parece ser datos de prueba/placeholder
            const newSections: Section[] = [
              {
                id: new Date().getTime().toString(),
                tasks: [
                  { id: '3', title: 'Bloquetas SAC', checked: [1, 1, 0, -1] },
                  { id: '4', title: 'Bloquetas SAC', checked: [1, 1, 0, -1, -1, -1] },
                ],
              },
            ];
            // Guarda las secciones en el estado
            setSections(newSections);

          })
          .catch((error) => {
            // Si hay un error en la petición, lo muestra en la consola
            console.error(error);
          });

        axios.get(`https://centroesteticoedith.com/endpoint/days_project/${projectObject.id}`)
          .then((response) => {
            console.log(response.data);
            setDaysProject(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }, []);

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
  // Esta función obtiene el índice del día actual de la semana (0-6)
  const getCurrentDayIndex = (): number => {
    // Crea un objeto Date con la fecha actual
    const today = new Date();

    // Obtiene el día de la semana (0=domingo, 1=lunes, ..., 6=sábado)
    const jsDayIndex = today.getDay(); 

    // Ajusta el índice para que la semana empiece en lunes:
    // Si es domingo (0), devuelve 6
    // Para otros días, resta 1 para que lunes=0, martes=1, etc.
    return jsDayIndex === 0 ? 6 : jsDayIndex - 1; 
  };

  // Calcula la fecha para cada día de la semana
  const getDateForDay = (index: number): string => {
    // Obtiene los días de la semana actual llamando a getDatesForCurrentWeek()
    const currentWeekDays = getDatesForCurrentWeek();
    // Obtiene el día específico según el índice proporcionado
    const dayData = currentWeekDays[index];
    // Si existe el día, formatea la fecha al formato dd/mm, si no retorna string vacío
    if (!dayData) return '';
    const date = new Date(dayData.date);
    date.setDate(date.getDate() + 1); // Suma un día
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
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
          const currentDate = getDateForDay(index); // Usa la función para obtener la fecha
          const todayIndex = getCurrentDayIndex(); // Obtiene el índice del día actual
          const isToday = index === todayIndex; // Comprueba si es hoy

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
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScrollView style={styles.section}>
            {item.tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskRow}
                onLongPress={() => setModalSinAccesoVisible(true)}
                onPress={() => navigation.navigate('Task')}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.iconRow}>
                  {task.checked.map((isChecked, i) => (
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
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalSeguimientoVisible(false)}
              >
                <Text
                  style={[styles.modalButtonText, { paddingHorizontal: 10 }]}
                >
                  Guardar
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
    paddingHorizontal: 0, // Elimina el padding horizontal para permitir que los elementos internos ocupen todo el ancho
  },
  weekSelector: {
    backgroundColor: '#05222F',
    flexDirection: 'row',
    justifyContent: 'space-between', // Cambié a space-between para distribuir los íconos de manera adecuada
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30, // Añadí algo de padding lateral para separar los íconos de los bordes
    alignSelf: 'stretch', // Esto asegura que ocupe todo el ancho disponible
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
    alignSelf: 'stretch', // Opción alternativa para ocupar todo el ancho
    // Sombra en iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Sombra en Android
    elevation: 15,
    zIndex: 1,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1, // Asegura que cada columna ocupe el mismo espacio
  },
  dayText: {
    color: 'white',
    fontSize: 14,
  },
  dateText: {
    color: '#7bc4c4',
    fontSize: 12,
  },
  section: {
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
    alignItems: 'center', // Centra los iconos verticalmente
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
    // Sombra en iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Sombra en Android
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
