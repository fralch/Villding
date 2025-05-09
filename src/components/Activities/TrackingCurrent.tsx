import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getProject } from '../../hooks/localStorageCurrentProject';
import ConfirmModal from '../Alerta/ConfirmationModal';
import axios from 'axios';
import { Tracking, TrackingSection, Project } from '../../types/interfaces';
import { styles } from './styles/TrackingCurrentStyles';
import WeekSelector from './trackingAsset/WeekSelector';
import DayColumn from './trackingAsset/DayColumn';
import TrackingSectionComponent from './trackingAsset/TrackingSection';
import AddTrackingModal from './trackingAsset/AddTrackingModal';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'https://centroesteticoedith.com/endpoint';

const TrackingCurrent = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // Estados principales para manejar el proyecto, seguimientos y fechas
  const [project, setProject] = useState<Project | null>(null); // Almacena el proyecto actual
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]); // Lista de secciones de seguimiento, la secciones de seguimiento son las semanas del proyecto
  const [filteredTrackings, setFilteredTrackings] = useState<TrackingSection[]>([]); // Seguimientos filtrados para la semana actual, son los seguimientos de la semana actual
  const [weekDates, setWeekDates] = useState<string[]>([]); // Fechas de la semana actual son los 7 días de la semana actual
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // Índice de la semana actual 0 es la primera semana
  const [titleTracking, setTitleTracking] = useState(""); // Título del nuevo seguimiento 

  // Estados para controlar la visibilidad de los modales
  const [addTrackingModalVisible, setAddTrackingModalVisible] = useState(false); // Modal para añadir seguimiento 
  const [accessDeniedModalVisible, setAccessDeniedModalVisible] = useState(false); // Modal de acceso denegado
  const [confirmModalVisible, setConfirmModalVisible] = useState(false); // Modal de confirmación 
  const [confirmModalMessage, setConfirmModalMessage] = useState(""); // Mensaje del modal de confirmación

  // Cargar el proyecto al iniciar el componente
  useEffect(() => {
    loadProject(); // Carga el proyecto al iniciar el componente
  }, []); // Se ejecuta una vez al montar el componente

  // Cargar los seguimientos cuando el proyecto cambia
  // Replace or add this effect
  useFocusEffect(
    React.useCallback(() => {
      if (project?.id) {
        fetchTrackings();
      }
    }, [project])
  );

  // Keep your existing useEffect for initial project loading
  useEffect(() => {
    loadProject();
  }, []);

  // You can remove or keep the existing useEffect for project changes
  // since useFocusEffect will handle the tracking updates
  
  // Filtrar los seguimientos cuando cambian las fechas o los seguimientos
  useEffect(() => {
    filterTrackingsByWeek();
  }, [trackingSections, weekDates]); // Se ejecuta cuando cambian las secciones de seguimiento o las fechas de la semana

  // Verificar periódicamente si el día actual está en la semana mostrada
  useEffect(() => {
    if (!project?.start_date) return;
    
    // Verificar cada hora si el día actual está en la semana mostrada
    const intervalId = setInterval(() => {
      checkAndAdjustCurrentWeek(project.start_date, currentWeekIndex, true);
    }, 60 * 60 * 1000); // Cada hora
    
    return () => clearInterval(intervalId);
  }, [project, currentWeekIndex]);

  // Función para cargar el proyecto desde el almacenamiento local
  
const loadProject = async () => {
  try {
    const storedProject = await getProject();
    if (!storedProject) return;

    const parsedProject = typeof storedProject === 'string'
      ? JSON.parse(storedProject)
      : storedProject;

    setProject(parsedProject);

    // Convertir el formato YYYY/MM/DD a un objeto Date
    const [year, month, day] = parsedProject.start_date.split('/').map(Number);
    const startDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    // Calcular la diferencia en días
    const differenceInMs = currentDate.getTime() - startDate.getTime();
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    
    // Calcular el número de semana inicial
    const initialWeekIndex = Math.floor(differenceInDays / 7);
    
    setCurrentWeekIndex(initialWeekIndex);
    
    // Calcular las fechas de la semana inicial
    calculateWeekDates(parsedProject.start_date, initialWeekIndex + 1);
    
    // Verificar si el día actual está en la semana mostrada
    checkAndAdjustCurrentWeek(parsedProject.start_date, initialWeekIndex, true);
  } catch (error) {
    console.error("Error loading project:", error);
  }
};

// Verificar si el día actual está en la semana mostrada y ajustar si es necesario
const checkAndAdjustCurrentWeek = (startDateStr: string, weekIndex: number, isInitialLoad: boolean = false) => {
  if (!startDateStr) return;
  
  const [year, month, day] = startDateStr.split('/').map(Number);
  const projectStartDate = new Date(year, month - 1, day);
  const firstMonday = getMonday(projectStartDate);
  
  // Calcular el lunes de la semana actual
  const targetMonday = new Date(firstMonday);
  targetMonday.setDate(firstMonday.getDate() + (weekIndex * 7));
  
  // Calcular el domingo de la semana actual
  const targetSunday = new Date(targetMonday);
  targetSunday.setDate(targetMonday.getDate() + 6);
  
  // Obtener la fecha actual
  const currentDate = new Date();
  
  // Solo ajustar automáticamente si es la carga inicial
  if (isInitialLoad && (currentDate < targetMonday || currentDate > targetSunday)) {
    // Calcular la semana correcta basada en la fecha actual
    const currentMonday = getMonday(currentDate);
    const weeksDiff = Math.floor((currentMonday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Actualizar el índice de semana y recalcular las fechas
    setCurrentWeekIndex(weeksDiff);
    calculateWeekDates(startDateStr, weeksDiff + 1);
  }
};

  // Calcular las fechas de una semana inicial o de las semanas siguientes
  const calculateWeekDates = (startDateStr: string, weekOffset: number) => {
    if (!startDateStr) return;
    
    // Asegurar que weekOffset sea al menos 1
    if (weekOffset < 1) {
      weekOffset = 1;
    }
  
    console.log(`Calculating dates for week: ${weekOffset}`);
  
    const [year, month, day] = startDateStr.split('/').map(Number);
    const projectStartDate = new Date(year, month - 1, day);
    const firstMonday = getMonday(projectStartDate);
  
    // Calcular el lunes de la semana solicitada sumando las semanas de offset
    const targetMonday = new Date(firstMonday);
    targetMonday.setDate(firstMonday.getDate() + ((weekOffset - 1) * 7));
  
    // Generar un array de fechas para los 7 días de la semana
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(targetMonday);
      date.setDate(targetMonday.getDate() + index);
      return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });
  
    // console.log('Calculated Dates:', dates);
    setWeekDates(dates);
  };

  // Obtener el lunes de una semana dada una fecha
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    return new Date(date.setDate(diff));
  };

  // Obtener los seguimientos del servidor
  const fetchTrackings = async () => {
    if (!project?.id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/trackings_project/${project.id}`);
      const trackings = response.data;
      // console.log(trackings);
      // Organizar los seguimientos por secciones
      const sections = organizeTrackingsBySections(trackings);
      setTrackingSections(sections); // Establecer las secciones de seguimiento en el estado
    } catch (error) {
      console.error("Error fetching trackings:", error);
    }
  };

  // Organizar los seguimientos por secciones semanales
  const organizeTrackingsBySections = (trackings: Tracking[]) => {
    const sections: TrackingSection[] = [];

    trackings.forEach(tracking => {
      if (!tracking.date_start) return;

      // Obtener el lunes de la semana del seguimiento
      const trackingDate = new Date(tracking.date_start);
      const weekStart = getMonday(trackingDate);
      const sectionId = weekStart.toISOString().split('T')[0];

      // Buscar o crear la sección correspondiente
      const existingSection = sections.find(section => section.id === sectionId);

      if (existingSection) {
        existingSection.trackings.push(tracking);
      } else {
        sections.push({
          id: sectionId,
          trackings: [tracking]
        });
      }
    });

    // Ordenar secciones por fecha
    return sections.sort((a, b) => {
      return new Date(a.id).getTime() - new Date(b.id).getTime();
    });
  };

  // Filtrar los seguimientos para mostrar solo los de la semana actual
  const filterTrackingsByWeek = () => {
    if (trackingSections.length === 0 || weekDates.length === 0) return;  // Verifica si hay datos disponibles para filtrar

    const currentYear = new Date().getFullYear();                             // Obtiene el año actual para crear fechas completas

    const [startDay, startMonth] = weekDates[0].split("/").map(Number);      // Extrae día y mes del primer día (Lunes) del formato "DD/MM"
    const [endDay, endMonth] = weekDates[6].split("/").map(Number);          // Extrae día y mes del último día (Domingo) del formato "DD/MM"

    const weekStart = new Date(currentYear, startMonth - 1, startDay);        // Crea fecha de inicio de semana (Lunes)
    const weekEnd = new Date(currentYear, endMonth - 1, endDay, 23, 59, 59); // Crea fecha de fin de semana (Domingo) incluyendo todo el día

    const filtered = trackingSections
      .map(section => ({                                                      // Mapea cada sección de seguimiento
        ...section,                                                           // Mantiene los datos originales de la sección
        trackings: section.trackings.filter(tracking => {                     // Filtra los seguimientos dentro de la sección
          if (!tracking.date_start) return false;                            // Excluye seguimientos sin fecha de inicio
          const trackingDate = new Date(tracking.date_start);                // Convierte la fecha del seguimiento a objeto Date
          return trackingDate <= weekEnd;                                    // Incluye solo seguimientos hasta el fin de semana
        })
      }))
      .filter(section => section.trackings.length > 0);                      // Elimina secciones que quedaron sin seguimientos
    setFilteredTrackings(filtered);                                          // Actualiza el estado con las secciones filtradas
  };

  // Cambiar a la semana anterior o siguiente
  const handleWeekChange = (direction: string) => {
    if (!project?.start_date || !project?.end_date) return;
  
    const startDate = new Date(project.start_date.replace(/\//g, "-"));
    const endDate = new Date(project.end_date.replace(/\//g, "-"));
  
    // Calcular nuevo índice de semana
    const newWeekIndex = direction === "right"
      ? currentWeekIndex + 1
      : currentWeekIndex - 1;
  
    // Calcular la fecha del lunes de la semana a la que queremos navegar
    const mondayOfStartWeek = getMonday(startDate);
    const targetMonday = new Date(mondayOfStartWeek);
    targetMonday.setDate(mondayOfStartWeek.getDate() + (newWeekIndex * 7));
  
    // Validar límites de navegación
    if (direction === "left" && newWeekIndex < 0) {
      return;
    }
  
    if (direction === "right") {
      // Verificar que el lunes de la nueva semana no exceda la fecha de fin del proyecto
      if (targetMonday > endDate) {
        return;
      }
    }
  
    setCurrentWeekIndex(newWeekIndex);
    
    // Pasar newWeekIndex + 1 para mantener la consistencia con la numeración de semanas
    calculateWeekDates(project.start_date, newWeekIndex + 1);
  };

  // Crear un nuevo seguimiento
  const createNewTracking = async () => {
    if (!project?.id || !titleTracking.trim()) return;

    try {
      // Usar el día central de la semana como fecha de inicio
      const year = new Date().getFullYear();
      const centralDay = weekDates[3]; // Jueves
      const [day, month] = centralDay.split("/").map(Number);

      const startDate = new Date(year, month - 1, day);

      const trackingData = {
        project_id: project.id,
        title: titleTracking.trim(),
        description: "Descripción",
        date_start: startDate.toISOString().split('T')[0],
        duration_days: '7',
      };

      await axios.post(`${API_BASE_URL}/trackings/create`, trackingData);

      // Actualizar la lista de seguimientos
      fetchTrackings();

      // Mostrar confirmación
      setConfirmModalMessage("Seguimiento creado correctamente");
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("Error creating tracking:", error);
      setConfirmModalMessage("Error al crear el seguimiento");
      setConfirmModalVisible(true);
    }
  };

  // Navegar a la vista de detalles de un seguimiento
  const navigateToTracking = (tracking: Tracking) => {
    const trackingWithContext = {
      ...tracking,
      currentWeekIndex: currentWeekIndex + 1,
      days: weekDates
    };

    navigation.navigate('Activity', { tracking: trackingWithContext });
  };

  // Verificar si la fecha es hoy
  const isToday = (date: string) => {
    return new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit'
    }) === date;
  };

  return (
    <View style={styles.container}>
      {/* Selector de semana */}
      <WeekSelector
        currentWeekIndex={currentWeekIndex}
        onWeekChange={handleWeekChange}
      />

      {/* Cabecera de días */}
      <View style={styles.daysRow}>
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, index) => (
          <DayColumn
            key={index}
            day={day}
            date={weekDates[index] || ''}
            isToday={isToday(weekDates[index] || '')}
          />
        ))}
      </View>

      {/* Lista de seguimientos */}
      <FlatList
        style={styles.flatList}
        data={filteredTrackings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackingSectionComponent
            section={item}
            onPress={navigateToTracking}
            weekDates={weekDates}
            onLongPress={() => setAccessDeniedModalVisible(false)} // TODO: cambiar a true para que funcione
          />
        )}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#777' }}>No hay seguimientos para esta semana</Text>
          </View>
        )}
      />

      {/* Botón para añadir seguimiento */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddTrackingModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#7bc4c4" />
        <Text style={styles.addButtonText}>Añadir seguimiento</Text>
      </TouchableOpacity>

      {/* Modal para añadir seguimiento */}
      <AddTrackingModal
        visible={addTrackingModalVisible}
        onClose={() => setAddTrackingModalVisible(false)}
        onSave={() => {
          setAddTrackingModalVisible(false);
          createNewTracking();
        }}
        onChangeText={setTitleTracking}
      />

      {/* Modal de acceso denegado */}
      <Modal
        visible={accessDeniedModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAccessDeniedModalVisible(false)}
      >
        <Pressable
          style={[styles.modalContainer, { justifyContent: "flex-end" }]}
          onPress={() => setAccessDeniedModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: "#CFA54A" }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: "#07374a", marginBottom: 0 }]}>
                No tienes acceso
              </Text>
            </View>
            <Text style={{ color: "#07374a", fontSize: 16 }}>
              Pídele al administrador que te comparta esta actividad
            </Text>
          </View>
        </Pressable>
      </Modal>

      {/* Modal de confirmación */}
      <ConfirmModal
        visible={confirmModalVisible}
        message={confirmModalMessage}
        onClose={() => {
          setConfirmModalVisible(false);
          navigation.navigate("HomeProject");
        }}
      />
    </View>
  );
};

export default TrackingCurrent;
