import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { getProject } from "../../hooks/localStorageCurrentProject";
import ConfirmModal from "../Alerta/ConfirmationModal";
import axios from "axios";
import { Tracking, TrackingSection, Project, User } from "../../types/interfaces";
import { styles } from "./styles/TrackingCurrentStyles";

const TrackingCurrent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // Estados para manejar la lógica del componente
  const [datesToWeekCurrent, setDatesToWeekCurrent] = useState<string[]>([]);
  const [modalSeguimientoVisible, setModalSeguimientoVisible] = useState(false);
  const [modalSinAccesoVisible, setModalSinAccesoVisible] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]);
  const [filteredTrackings, setFilteredTrackings] = useState<TrackingSection[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [titleTracking, setTitleTracking] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [msjeModal, setMsjeModal] = useState("El usuario se ha registrado correctamente.");

  // useEffect para cargar el proyecto y las fechas al montar el componente
  useEffect(() => {
    fetchProjectAndDates();
  }, []);

  // useEffect para obtener los seguimientos cuando el proyecto cambia
  useEffect(() => {
    if (project) {
      obtenerSeguimientos();
    }
  }, [project]);

  // useEffect para calcular la semana actual basada en la fecha de inicio del proyecto
  useEffect(() => {
    if (!project?.start_date) return;

    const startDate = new Date(project.start_date.replace(/\//g, "-"));
    const today = new Date();

    if (isNaN(startDate.getTime())) {
      console.error("Fecha de inicio del proyecto no válida");
      return;
    }

    const timeDiff = today.getTime() - startDate.getTime();
    const dayDiff = timeDiff / (24 * 60 * 60 * 1000);
    const weekIndex = Math.floor(dayDiff / 7);

    setCurrentWeekIndex(weekIndex);
  }, [project]);

  // useEffect para filtrar los seguimientos basados en la semana actual 
  useEffect(() => {
    if (trackingSections.length === 0 || datesToWeekCurrent.length === 0) return; // Si alguna de estas listas está vacía, no se realiza ninguna acción

    const [startDay, startMonth] = datesToWeekCurrent[0].split("/").map(Number);   // Extraer el día y el mes de inicio de la semana actual desde el primer día de la semana actual
    const [endDay, endMonth] = datesToWeekCurrent[6].split("/").map(Number); // Extraer el  día y el mes de fin de la semana actual desde el último día de la semana actual

    const currentYear = new Date().getFullYear(); // Obtener el año actual
    const weekStartDate = new Date(currentYear, startMonth - 1, startDay); // Crear una fecha de inicio de la semana actual utilizando el año actual, el mes y el día de inicio
    const weekEndDate = new Date(currentYear, endMonth - 1, endDay, 23, 59, 59); // Crear una fecha de fin de la semana actual, estableciendo la hora al final del día (23:59:59)

    const filtered: TrackingSection[] = trackingSections.map(section => { // Filtrar las secciones de seguimiento para incluir solo aquellas con seguimientos dentro de la semana actual
      const filteredTrackings = section.trackings.filter(tracking => { // Filtrar los seguimientos dentro de cada sección
        if (!tracking.date_start) return false; // Si el seguimiento no tiene fecha de inicio, se excluye del filtrado
        const trackingStartDate = new Date(tracking.date_start); // Convertir la fecha de inicio del seguimiento a un objeto Date
        return trackingStartDate <= weekEndDate; // Incluir solo los seguimientos que comienzan antes o durante la semana actual
      });

      return { // Devolver la sección con los seguimientos filtrados 
        ...section, 
        trackings: filteredTrackings // Se mantiene la estructura original de la sección pero con los seguimientos actualizados
      };
    }).filter(section => section.trackings.length > 0); // Filtrar las secciones para excluir aquellas que no tienen seguimientos después del filtrado

    setFilteredTrackings(filtered); // Actualizar el estado con las secciones de seguimiento filtradas
  }, [trackingSections, datesToWeekCurrent, currentWeekIndex]);

  // Función para obtener el proyecto y las fechas de la semana actual
  const fetchProjectAndDates = async () => {
    const storedProject = await getProject(); // Obtener el proyecto almacenado en la base de datos
    if (storedProject) { // Si el proyecto se ha almacenado en la base de datos
      setProject(typeof storedProject === 'string' ? JSON.parse(storedProject) : storedProject); // Actualizar el estado con el proyecto almacenado
    }
    const today = new Date(); // Obtener la fecha actual
    const monday = getMonday(today); // Obtener el lunes de la fecha actual

    let dates = Array.from({ length: 7 }, (_, index) => { // Crear una lista de fechas de la semana actual
      const currentDate = new Date(monday); // Crear una fecha con la fecha actual y el índice del día
      currentDate.setDate(monday.getDate() + index); // Agregar el índice del día a la fecha actual
      return currentDate.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }); // Devolver la fecha en formato local (DD/MM)
    });

    setDatesToWeekCurrent(dates); // Actualizar el estado con las fechas de la semana actual
  };

  // Función para cambiar la semana actual
  const handleWeekChange = (direccion: string) => {
    if (!project?.week) return;

    const semanas = parseInt(project.week.toString(), 10);
    if ((direccion === "left" && currentWeekIndex === 0) ||
        (direccion === "right" && currentWeekIndex === semanas - 1) ||
        datesToWeekCurrent.length === 0) return;

    const [day, month] = datesToWeekCurrent[0].split("/").map(Number);
    const currentMonday = new Date(new Date().getFullYear(), month - 1, day);

    if (direccion === "right") {
      currentMonday.setDate(currentMonday.getDate() + 7);
      setCurrentWeekIndex(currentWeekIndex + 1);
    } else if (direccion === "left") {
      currentMonday.setDate(currentMonday.getDate() - 7);
      setCurrentWeekIndex(currentWeekIndex - 1);
    }

    const newWeekDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + index);
      return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });

    setDatesToWeekCurrent(newWeekDates);
  };

  // Función para obtener el lunes de una fecha dada
  const getMonday = (date: Date) => {
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  };

  // Función para renderizar una columna de día
  const renderDayColumn = (day: string, index: number) => {
    const currentDate = datesToWeekCurrent[index];
    const today = new Date();
    const isToday = today.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) === currentDate;

    return (
      <View key={index} style={[styles.dayColumn, isToday && { backgroundColor: "#0A3649", borderRadius: 8 }]}>
        <Text style={[styles.dayText, isToday && { color: "#4ABA8D" }]}>{day}</Text>
        <Text style={[styles.dateText, isToday && { color: "#4ABA8D" }]}>{currentDate}</Text>
      </View>
    );
  };

  // Función para obtener los seguimientos del proyecto
  const obtenerSeguimientos = async () => {
    if (!project?.id) return;

    try {
      const response = await axios.get(`https://centroesteticoedith.com/endpoint/trackings_project/${project.id}`);
      const trackings = response.data;
      const updatedSections = updateTrackingSections(trackings);
      setTrackingSections(updatedSections);
    } catch (error) {
      console.error("Error al obtener seguimientos:", error);
    }
  };

  // Función para crear un nuevo seguimiento
  const handleNewTracking = async () => {
    if (!project) return;

    const today = new Date();
    const trackingStartDate = project.start_date
      ? new Date(project.start_date.replace(/\//g, "-")).toISOString().split('T')[0]
      : today.toISOString().split('T')[0];

    const data = {
      project_id: project.id,
      title: titleTracking.trim(),
      description: "Descripcion",
      date_start: today.toISOString().split('T')[0],
      duration_days: '7',
    };

    try {
      await axios.post('https://centroesteticoedith.com/endpoint/trackings/create', data);
      obtenerSeguimientos();
    } catch (error) {
      console.error("Error al crear seguimiento:", error);
    }
  };

  // Función para actualizar las secciones de seguimiento con nuevos seguimientos
  const updateTrackingSections = (newTrackings: Tracking[]) => {  
    const sections: TrackingSection[] = []; // Crear una lista de secciones de seguimiento vacía
    newTrackings.forEach((tracking) => { // Iterar sobre los nuevos seguimientos
      const trackingDate = new Date(tracking.date_start || new Date());  // Obtener la fecha de inicio del seguimiento o la fecha actual
      const weekStartDate = new Date(trackingDate); // Crear una fecha con la fecha de inicio del seguimiento
      weekStartDate.setDate(trackingDate.getDate() - trackingDate.getDay() + 1); // Agregar el índice del día del lunes al día de inicio del seguimiento
      const sectionId = weekStartDate.toISOString().split('T')[0]; // Obtener la fecha en formato ISO (YYYY-MM-DD) de la sección

      const existingSection = sections.find((section) => section.id === sectionId); // Buscar la sección existente con la fecha de inicio del seguimiento
      if (existingSection) { // Si la sección existe
        existingSection.trackings.push(tracking); // Agregar el seguimiento a la sección existente
      } else {
        sections.push({ // Si la sección no existe, crearla
          id: sectionId, // Obtener la fecha en formato ISO (YYYY-MM-DD) de la sección
          trackings: [tracking] // Agregar el seguimiento a la sección
        });
      }
    });
    sections.sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime()); // Ordenar las secciones de seguimiento por fecha
    return sections;// Devolver las secciones de seguimiento ordenadas
  };

  // Función para volver al proyecto
  const backToProject = () => {
    navigation.navigate("HomeProject");
  };

  // Función para renderizar una sección de seguimiento
  const renderTrackingSection = ({ item }: { item: TrackingSection }) => (
    <ScrollView style={styles.trackingSection}>
      {item.trackings.map((tracking) => (
        <TouchableOpacity
          key={tracking.id}
          style={styles.taskRow}
          onLongPress={() => setModalSinAccesoVisible(true)}
          onPress={() => {
            const trackingWithWeekIndex = { ...tracking, currentWeekIndex: currentWeekIndex + 1, days: datesToWeekCurrent };
            navigation.navigate("Activity", { tracking: trackingWithWeekIndex });
          }}
        >
          <Text style={styles.taskTitle}>{tracking.title}</Text>
          <View style={styles.iconRow}>
            {tracking.checked &&
              tracking.checked.map((isChecked, i) => (
                <View
                  key={i}
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isChecked === -1 ? "#004e66" : "#0A3649",
                    },
                  ]}
                >
                  <Ionicons
                    name={isChecked == 1 ? "checkmark" : isChecked == -1 ? "ellipse-outline" : "ellipse-sharp"}
                    size={isChecked === 1 ? 24 : 12}
                    color={isChecked === 1 ? "#4ABA8D" : "#D1A44C"}
                    style={styles.icon}
                  />
                </View>
              ))}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

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
        <TouchableOpacity onPress={() => handleWeekChange('left')} disabled={currentWeekIndex === 0}>
          <Ionicons name="chevron-back" size={30} color={currentWeekIndex === 0 ? "#07374a" : "white"} />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>Semana {currentWeekIndex + 1}</Text>
        <TouchableOpacity
          onPress={() => handleWeekChange('right')}
          disabled={currentWeekIndex === Math.ceil((new Date(project?.end_date || "").getTime() - new Date(project?.start_date || "").getTime()) / (7 * 24 * 60 * 60 * 1000)) - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={30}
            color={currentWeekIndex === Math.ceil((new Date(project?.end_date || "").getTime() - new Date(project?.start_date || "").getTime()) / (7 * 24 * 60 * 60 * 1000)) - 1 ? "#07374a" : "white"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(renderDayColumn)}
      </View>

      <FlatList
        style={styles.flatList}
        data={filteredTrackings}
        keyExtractor={(item) => item.id}
        renderItem={renderTrackingSection}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#777' }}>No hay seguimientos para esta semana</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalSeguimientoVisible(true)}>
        <Ionicons name="add-circle-outline" size={24} color="#7bc4c4" />
        <Text style={styles.addButtonText}>Añadir seguimiento</Text>
      </TouchableOpacity>

      <Modal
        visible={modalSeguimientoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalSeguimientoVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>Añadir seguimiento</Text>
              <Pressable onPress={() => setModalSeguimientoVisible(false)}>
                <Ionicons name="close-outline" size={30} color="white" />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del seguimiento"
              placeholderTextColor="#777"
              onChangeText={(text: string) => setTitleTracking(text)}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#004e66", borderColor: "white", borderWidth: 1 }]}
                onPress={() => setModalSeguimientoVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "white", paddingHorizontal: 10 }]}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalSeguimientoVisible(false);
                  handleNewTracking();
                }}
              >
                <Text style={[styles.modalButtonText, { paddingHorizontal: 10 }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalSinAccesoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalSinAccesoVisible(false)}
      >
        <Pressable style={[styles.modalContainer, { justifyContent: "flex-end" }]} onPress={() => setModalSinAccesoVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: "#CFA54A" }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: "#07374a", marginBottom: 0 }]}>No tienes acceso</Text>
            </View>
            <Text style={{ color: "#07374a", fontSize: 16 }}>Pídele al administrador que te comparta esta actividad</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TrackingCurrent;
