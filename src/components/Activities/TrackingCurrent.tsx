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

const API_BASE_URL = 'https://centroesteticoedith.com/endpoint';

const TrackingCurrent = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  
  // Estados principales
  const [project, setProject] = useState<Project | null>(null);
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]);
  const [filteredTrackings, setFilteredTrackings] = useState<TrackingSection[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [titleTracking, setTitleTracking] = useState("");
  
  // Estados de modales
  const [addTrackingModalVisible, setAddTrackingModalVisible] = useState(false);
  const [accessDeniedModalVisible, setAccessDeniedModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");

  // Cargar proyecto al iniciar
  useEffect(() => {
    loadProject();
  }, []);

  // Cargar seguimientos cuando el proyecto cambia
  useEffect(() => {
    if (project?.id) {
      fetchTrackings();
    }
  }, [project]);
  
  // Filtrar seguimientos cuando cambian las fechas o los seguimientos
  useEffect(() => {
    filterTrackingsByWeek();
  }, [trackingSections, weekDates]);

  // Función para cargar el proyecto desde almacenamiento local
  const loadProject = async () => {
    try {
      const storedProject = await getProject();
      if (!storedProject) return;
      
      const parsedProject = typeof storedProject === 'string' 
        ? JSON.parse(storedProject) 
        : storedProject;
      
      console.log(parsedProject);
      setProject(parsedProject);
      
      // Configurar la semana actual
      const weekNum = parseInt(parsedProject.week_current?.toString() || "1", 10);
      setCurrentWeekIndex(weekNum - 1);
      
      // Calcular fechas de la semana
      calculateWeekDates(parsedProject.start_date, weekNum - 1);
    } catch (error) {
      console.error("Error loading project:", error);
    }
  };

  // Calcular las fechas de una semana específica
  const calculateWeekDates = (startDateStr: string, weekOffset: number) => {
    if (!startDateStr) return;
    
    // Convertir fecha de inicio a objeto Date
    const startDate = new Date(startDateStr.replace(/\//g, "-"));
    
    // Obtener el lunes de la semana de inicio
    const mondayOfStartWeek = getMonday(startDate);
    
    // Calcular el lunes de la semana solicitada
    const targetMonday = new Date(mondayOfStartWeek);
    targetMonday.setDate(mondayOfStartWeek.getDate() + (weekOffset * 7));
    
    // Generar array de fechas para los 7 días de la semana
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(targetMonday);
      date.setDate(targetMonday.getDate() + index);
      return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });
    
    setWeekDates(dates);
  };

  // Obtener el lunes de una semana dada una fecha
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    return new Date(date.setDate(diff));
  };

  // Obtener seguimientos del servidor
  const fetchTrackings = async () => {
    if (!project?.id) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/trackings_project/${project.id}`);
      const trackings = response.data;
      
      // Organizar los seguimientos por secciones
      const sections = organizeTrackingsBySections(trackings);
      setTrackingSections(sections);
    } catch (error) {
      console.error("Error fetching trackings:", error);
    }
  };

  // Organizar seguimientos por secciones semanales
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

  // Filtrar seguimientos para mostrar solo los de la semana actual
  const filterTrackingsByWeek = () => {
    if (trackingSections.length === 0 || weekDates.length === 0) return;
    
    const currentYear = new Date().getFullYear();
    
    // Extraer día y mes del primer y último día de la semana
    const [startDay, startMonth] = weekDates[0].split("/").map(Number);
    const [endDay, endMonth] = weekDates[6].split("/").map(Number);
    
    // Crear fechas de inicio y fin de la semana
    const weekStart = new Date(currentYear, startMonth - 1, startDay);
    const weekEnd = new Date(currentYear, endMonth - 1, endDay, 23, 59, 59);
    
    // Filtrar las secciones y sus seguimientos
    const filtered = trackingSections
      .map(section => ({
        ...section,
        trackings: section.trackings.filter(tracking => {
          if (!tracking.date_start) return false;
          const trackingDate = new Date(tracking.date_start);
          return trackingDate <= weekEnd;
        })
      }))
      .filter(section => section.trackings.length > 0);
    
    setFilteredTrackings(filtered);
  };

  // Cambiar a la semana anterior o siguiente
  const handleWeekChange = (direction: string) => {
    if (!project?.week) return;
    
    const totalWeeks = parseInt(project.week.toString(), 10);
    
    // Validar límites de navegación
    if ((direction === "left" && currentWeekIndex === 0) ||
        (direction === "right" && currentWeekIndex === totalWeeks - 1)) {
      return;
    }
    
    // Calcular nuevo índice de semana
    const newWeekIndex = direction === "right" 
      ? currentWeekIndex + 1 
      : currentWeekIndex - 1;
    
    setCurrentWeekIndex(newWeekIndex);
    calculateWeekDates(project.start_date, newWeekIndex);
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
        totalWeeks={project ? parseInt(project.week.toString(), 10) : 0}
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
            onLongPress={() => setAccessDeniedModalVisible(true)}
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