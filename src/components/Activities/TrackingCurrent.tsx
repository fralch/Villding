import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Text, Modal, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { getProject } from '../../hooks/localStorageCurrentProject';
import { getSesion } from '../../hooks/localStorageUser';
import ConfirmModal from '../Alerta/ConfirmationModal';
import axios from 'axios';
import { Tracking, TrackingSection, Project } from '../../types/interfaces';
import { styles } from './styles/TrackingCurrentStyles';
import WeekSelector from './trackingAsset/WeekSelector';
import DayColumn from './trackingAsset/DayColumn';
import TrackingSectionComponent from './trackingAsset/TrackingSection';
import AddTrackingModal from './trackingAsset/AddTrackingModal';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { API_BASE_URL } from '../../config/api';

const TrackingCurrent = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();

  // Estados principales para manejar el proyecto, seguimientos y fechas
  const [project, setProject] = useState<Project | null>(null); // Almacena el proyecto actual
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]); // Lista de secciones de seguimiento, la secciones de seguimiento son las semanas del proyecto
  const [filteredTrackings, setFilteredTrackings] = useState<TrackingSection[]>([]); // Seguimientos filtrados para la semana actual, son los seguimientos de la semana actual
  const [weekDates, setWeekDates] = useState<string[]>([]); // Fechas de la semana actual son los 7 días de la semana actual
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0); // Índice de la semana actual 0 es la primera semana
  const [totalWeeks, setTotalWeeks] = useState(0); // Número total de semanas del proyecto (desde start_date hasta end_date)
  const [titleTracking, setTitleTracking] = useState(""); // Título del nuevo seguimiento 
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es administrador

  // Estados para controlar la visibilidad de los modales
  const [addTrackingModalVisible, setAddTrackingModalVisible] = useState(false); // Modal para añadir seguimiento 
  const [finishTrackingModalVisible, setFinishTrackingModalVisible] = useState(false); // Modal para finalizar seguimiento
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null); // Tracking seleccionado para finalizar
  const [confirmModalVisible, setConfirmModalVisible] = useState(false); // Modal de confirmación 
  const [confirmModalMessage, setConfirmModalMessage] = useState(""); // Mensaje del modal de confirmación

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedReportItems, setSelectedReportItems] = useState<Set<string>>(new Set());

  // Toggle selection of a tracking item (trackingId + date)
  const toggleReportItem = (trackingId: string, date: string) => {
    const key = `${trackingId}|${date}`;
    setSelectedReportItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Generate report for selected items
  const generateMultipleReport = async () => {
    if (selectedReportItems.size === 0) {
      Alert.alert("Error", "Seleccione al menos un seguimiento para generar el reporte.");
      return;
    }

    try {
      const reportData = Array.from(selectedReportItems).map(key => {
        const [trackingId, date] = key.split('|');
        return { tracking_id: parseInt(trackingId), date };
      });

      Alert.alert('Descargando', `Generando reporte para ${reportData.length} elemento(s)...`);

      const response = await axios.post(
        `${API_BASE_URL}/tracking/report/multi`,
        { report_data: reportData },
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Generate filename
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
      const fileName = `reporte_multiple_${timestamp}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Reporte Múltiple`,
        });
      }

      // Clear selection after success
      setIsSelectionMode(false);
      setSelectedReportItems(new Set());

    } catch (error) {
      console.error("Error generating multiple report:", error);
      Alert.alert("Error", "No se pudo generar el reporte múltiple.");
    }
  };

  // Evitar doble carga inicial: refresco cuando se abre la app en esta pantalla
  const initialFetchDoneRef = useRef(false);

  // Cargar el proyecto al iniciar el componente
  useEffect(() => {
    loadProject(); // Carga el proyecto al iniciar el componente
  }, []); // Se ejecuta una vez al montar el componente

  // Cargar los seguimientos cuando el proyecto cambia o cuando se navega de vuelta con refresh=true
  useFocusEffect(
    React.useCallback(() => {
      if (project?.id) {
        // Cargar los seguimientos cada vez que la pantalla gana foco
        fetchTrackings();
      }
    }, [project])
  );

  // Refresco inicial al montar cuando el proyecto está disponible
  useEffect(() => {
    if (project?.id && !initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchTrackings();
    }
  }, [project?.id]);

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

  // Verificar si el usuario es administrador
  const checkAdminStatus = async () => {
    if (!project?.id) return;

    try {
      const sessionStr = await getSesion();
      if (!sessionStr) return;

      const session = JSON.parse(sessionStr);

      // Check if user is super admin (global admin)
      if (session.is_admin === 1) {
        setIsAdmin(true);
        return;
      }

      // Check project specific admin status
      const response = await axios.post(
        `${API_BASE_URL}/project/check-attachment`,
        { project_id: project.id }
      );

      const isProjectAdmin = response.data.users.some((user: any) =>
        user.id === session.id && user.is_admin === 1
      );

      setIsAdmin(isProjectAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  // Ejecutar checkAdminStatus cuando cambia el proyecto
  useEffect(() => {
    if (project?.id) {
      checkAdminStatus();
    }
  }, [project?.id]);

  // Función para cargar el proyecto desde el almacenamiento local
  
const loadProject = async () => {
  try {
    const storedProject = await getProject();
    if (!storedProject) return;

    const parsedProject = typeof storedProject === 'string'
      ? JSON.parse(storedProject)
      : storedProject;

    setProject(parsedProject);

    // Convertir el formato DD/MM/YYYY a un objeto Date para start_date
    const [startDay, startMonth, startYear] = parsedProject.start_date.split('/').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);

    // Convertir el formato DD/MM/YYYY a un objeto Date para end_date
    const [endDay, endMonth, endYear] = parsedProject.end_date.split('/').map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    // Calcular el número total de semanas del proyecto
    const totalProjectWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    setTotalWeeks(totalProjectWeeks);

    // Calcular la semana actual del proyecto
    const currentDate = new Date();
    const differenceInMs = currentDate.getTime() - startDate.getTime();
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

    // Calcular el número de semana inicial (0-indexed)
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

  const [day, month, year] = startDateStr.split('/').map(Number);
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

    const [day, month, year] = startDateStr.split('/').map(Number);
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
      const response = await axios.get(`${API_BASE_URL}/trackings_project_with_finish/${project.id}`);
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
          
          const trackingStartDate = new Date(tracking.date_start);           // Convierte la fecha de inicio del seguimiento a objeto Date
          
          // Si el tracking tiene deleted_at (soft delete), calcular su fecha de finalización
          if (tracking.deleted_at) {
            const deletedDate = new Date(tracking.deleted_at);               // Fecha cuando fue eliminado (soft delete)
            // El tracking se muestra desde su fecha de inicio hasta la semana donde fue eliminado
            return trackingStartDate <= weekEnd && deletedDate >= weekStart;
          }
          
          // Si el tracking está activo (sin deleted_at), se muestra hasta el fin de semana actual
          return trackingStartDate <= weekEnd;                              // Incluye solo seguimientos hasta el fin de semana
        })
      }))
      .filter(section => section.trackings.length > 0);                      // Elimina secciones que quedaron sin seguimientos
    setFilteredTrackings(filtered);                                          // Actualiza el estado con las secciones filtradas
  };

  // Cambiar a la semana anterior o siguiente
  const handleWeekChange = (direction: string) => {
    if (!project?.start_date || !project?.end_date) return;

    // Parsear correctamente las fechas en formato DD/MM/YYYY
    const [startDay, startMonth, startYear] = project.start_date.split('/').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);

    const [endDay, endMonth, endYear] = project.end_date.split('/').map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    // Calcular nuevo índice de semana
    const newWeekIndex = direction === "right"
      ? currentWeekIndex + 1
      : currentWeekIndex - 1;

    // Validar límites de navegación
    if (direction === "left" && newWeekIndex < 0) {
      console.log("No se puede navegar antes de la semana 1");
      return;
    }

    if (direction === "right" && newWeekIndex >= totalWeeks) {
      console.log(`No se puede navegar más allá de la semana ${totalWeeks} (total de semanas del proyecto)`);
      return;
    }

    // Calcular la fecha del lunes de la semana a la que queremos navegar
    const mondayOfStartWeek = getMonday(startDate);
    const targetMonday = new Date(mondayOfStartWeek);
    targetMonday.setDate(mondayOfStartWeek.getDate() + (newWeekIndex * 7));

    // Verificación adicional: el lunes de la nueva semana no debe exceder la fecha de fin
    if (targetMonday > endDate) {
      console.log("El lunes de esta semana excede la fecha de fin del proyecto");
      return;
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

  // Finalizar un seguimiento
  const finishTracking = async () => {
    if (!selectedTracking?.id) return;

    try {
      // Calcular la fecha media de la semana actual (día central - jueves)
      const year = new Date().getFullYear();
      const centralDay = weekDates[3]; // Jueves (día central de la semana)
      const [day, month] = centralDay.split("/").map(Number);
      
      // Crear la fecha completa con el año actual
      const deletedAtDate = new Date(year, month - 1, day);
      const deletedAt = deletedAtDate.toISOString().split('T')[0];
      
      // Preparar los datos para enviar
      const finishData = {
        deleted_at: deletedAt, // Fecha media de la semana actual en formato ISO
      };

      // Llamada al API para finalizar el seguimiento enviando la fecha de deleted_at
      await axios.post(`${API_BASE_URL}/tracking/delete/${selectedTracking.id}`, finishData);
      
      // Actualizar la lista de seguimientos
      fetchTrackings();
      
      // Mostrar confirmación
      setConfirmModalMessage("Seguimiento finalizado correctamente");
      setConfirmModalVisible(true);
      
      // Cerrar el modal
      setFinishTrackingModalVisible(false);
      setSelectedTracking(null);
    } catch (error) {
      console.error("Error finishing tracking:", error);
      setConfirmModalMessage("Error al finalizar el seguimiento");
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

    navigation.navigate('Activity', { 
      tracking: trackingWithContext,
      project: project 
    });
  };

  // Verificar si la fecha es hoy
  const isToday = (date: string) => {
    return new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit'
    }) === date;
  };

  // Descargar reportes diarios para un día específico
  const downloadDailyReports = async (dayIndex: number) => {
    console.log('=== INICIO downloadDailyReports ===');
    console.log('dayIndex:', dayIndex);
    console.log('weekDates[dayIndex]:', weekDates[dayIndex]);
    console.log('filteredTrackings.length:', filteredTrackings.length);

    if (!weekDates[dayIndex] || filteredTrackings.length === 0) {
      console.log('ERROR: No hay datos para descargar');
      Alert.alert('Sin datos', 'No hay seguimientos para este día');
      return;
    }

    try {
      // Obtener la fecha en formato YYYY-MM-DD
      const [day, month] = weekDates[dayIndex].split('/').map(Number);
      const year = new Date().getFullYear();
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      console.log('Fecha formateada:', formattedDate);

      // Obtener todos los trackings activos
      const activeTrackings = filteredTrackings.flatMap(section => section.trackings);

      console.log('Número de trackings activos:', activeTrackings.length);
      console.log('Trackings IDs:', activeTrackings.map(t => t.id));

      if (activeTrackings.length === 0) {
        console.log('ERROR: No hay trackings activos');
        Alert.alert('Sin datos', 'No hay seguimientos activos para este día');
        return;
      }

      Alert.alert(
        'Descargando',
        `Iniciando descarga de ${activeTrackings.length} reporte(s)...`
      );

      // Descargar reportes para cada tracking
      let successCount = 0;
      let failCount = 0;

      for (const tracking of activeTrackings) {
        console.log(`--- Descargando reporte para tracking ID: ${tracking.id}, Título: "${tracking.title}" ---`);

        try {
          const url = `${API_BASE_URL}/tracking/report/daily/${tracking.id}`;
          const body = { date: formattedDate };

          console.log('URL:', url);
          console.log('Body:', body);
          console.log('Iniciando request POST...');

          // Hacer POST request usando axios para obtener el PDF
          const response = await axios.post(
            url,
            body,
            {
              responseType: 'arraybuffer',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          console.log(`Response status: ${response.status}`);
          console.log(`Response data length: ${response.data?.byteLength || 0}`);

          // Generar nombre de archivo
          const sanitizedTitle = tracking.title.replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `reporte_${sanitizedTitle}_${formattedDate}.pdf`;
          const fileUri = FileSystem.documentDirectory + fileName;

          console.log('Archivo generado:', fileName);

          // Convertir arraybuffer a base64
          console.log('Convirtiendo a base64...');
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );

          console.log('Base64 length:', base64.length);

          // Escribir el archivo en el sistema de archivos
          console.log('Escribiendo archivo...');
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log('Archivo escrito exitosamente');

          // Compartir el archivo si está disponible
          if (await Sharing.isAvailableAsync()) {
            console.log('Compartiendo archivo...');
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: `Reporte: ${tracking.title}`,
            });
            console.log('Archivo compartido exitosamente');
          }

          successCount++;
          console.log(`✓ Reporte descargado exitosamente para tracking ${tracking.id}`);
        } catch (error: any) {
          console.error(`✗ ERROR descargando reporte para tracking ${tracking.id}:`);
          console.error('Error completo:', error);
          console.error('Error message:', error.message);
          console.error('Error response status:', error.response?.status);
          console.error('Error response data:', error.response?.data);
          console.error('Error response headers:', error.response?.headers);
          console.error('Error config:', error.config);
          failCount++;
        }
      }

      console.log(`Resumen: ${successCount} éxito(s), ${failCount} fallo(s)`);

      // Mostrar resultado
      if (successCount > 0) {
        Alert.alert(
          'Descarga completa',
          `Se descargaron ${successCount} reporte(s) exitosamente${failCount > 0 ? ` y ${failCount} fallaron` : ''}`
        );
      } else {
        Alert.alert('Error', 'No se pudo descargar ningún reporte');
      }

      console.log('=== FIN downloadDailyReports ===');
    } catch (error: any) {
      console.error('=== ERROR GENERAL en downloadDailyReports ===');
      console.error('Error completo:', error);
      console.error('Error message:', error.message);
      console.error('=== FIN ERROR GENERAL ===');
      Alert.alert('Error', 'Ocurrió un error al descargar los reportes');
    }
  };


  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 2) }]}>
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
            onLongPress={(tracking) => {
              if (isAdmin) {
                setSelectedTracking(tracking);
                setFinishTrackingModalVisible(true);
              }
            }}
            isSelectionMode={isSelectionMode}
            selectedItems={selectedReportItems}
            onToggleItem={toggleReportItem}
          />
        )}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#777' }}>No hay seguimientos para esta semana</Text>
          </View>
        )}
      />

      {/* Botones de Acción */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: Math.max(insets.bottom, 1) }}>
        

        {isSelectionMode ? (
          /* Generate Report Button */
          <TouchableOpacity
            style={[styles.addButton, { flex: 1, marginLeft: 5, backgroundColor: selectedReportItems.size > 0 ? '#07374a' : '#2a3b45' }]}
            onPress={generateMultipleReport}
            disabled={selectedReportItems.size === 0}
          >
            <Ionicons name="download-outline" size={24} color={selectedReportItems.size > 0 ? "#7bc4c4" : "#555"} />
            <Text style={[styles.addButtonText, { color: selectedReportItems.size > 0 ? "#7bc4c4" : "#555" }]}>
              Generar ({selectedReportItems.size})
            </Text>
          </TouchableOpacity>
        ) : (
          /* Add Tracking Button */
          isAdmin ? (
          <TouchableOpacity
            style={[styles.addButton, { flex: 1, marginLeft: 5 }]}
            onPress={() => setAddTrackingModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#7bc4c4" />
            <Text style={styles.addButtonText}>Añadir</Text>
          </TouchableOpacity>
          ) : null
        )}
        {/* Toggle Selection Mode */}
        <TouchableOpacity
          style={[styles.addButton, { flex: 1, marginRight: 5, backgroundColor: isSelectionMode ? '#6c757d' : '#07374a' }]}
          onPress={() => {
            setIsSelectionMode(!isSelectionMode);
            if (isSelectionMode) setSelectedReportItems(new Set());
          }}
        >
          <Ionicons name={isSelectionMode ? "close-circle-outline" : "documents-outline"} size={24} color="#7bc4c4" />
          <Text style={styles.addButtonText}>{isSelectionMode ? "Cancelar" : "Reporte"}</Text>
        </TouchableOpacity>
      </View>

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

      {/* Modal para finalizar seguimiento */}
      <Modal
        visible={finishTrackingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFinishTrackingModalVisible(false)}
      >
        <Pressable
          style={[styles.modalContainer, { justifyContent: "center" }]}
          onPress={() => setFinishTrackingModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { 
              backgroundColor: "#07374a", 
              marginHorizontal: 20,
              borderRadius: 12,
              padding: 20
            }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { 
                color: "#fff", 
                marginBottom: 10,
                textAlign: "center"
              }]}>
                Finalizar Seguimiento
              </Text>
            </View>
            
            <Text style={{ 
              color: "#fff", 
              fontSize: 16, 
              textAlign: "center",
              marginBottom: 20
            }}>
              ¿Estás seguro que deseas finalizar el seguimiento "{selectedTracking?.title}"?
            </Text>
            
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 15
            }}>
              {/* Botón Cancelar */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#6c757d",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center"
                }}
                onPress={() => {
                  setFinishTrackingModalVisible(false);
                  setSelectedTracking(null);
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              {/* Botón Finalizar */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#e74c3c",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center"
                }}
                onPress={finishTracking}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>
                  Finalizar
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
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