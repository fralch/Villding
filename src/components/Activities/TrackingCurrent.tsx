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
    if (trackingSections.length === 0 || datesToWeekCurrent.length === 0) return;

    const [startDay, startMonth] = datesToWeekCurrent[0].split("/").map(Number);
    const [endDay, endMonth] = datesToWeekCurrent[6].split("/").map(Number);

    const currentYear = new Date().getFullYear();
    const weekStartDate = new Date(currentYear, startMonth - 1, startDay);
    const weekEndDate = new Date(currentYear, endMonth - 1, endDay, 23, 59, 59);

    const filtered: TrackingSection[] = trackingSections.map(section => {
      const filteredTrackings = section.trackings.filter(tracking => {
        if (!tracking.date_start) return false;
        const trackingStartDate = new Date(tracking.date_start);
        return trackingStartDate <= weekEndDate;
      });

      return {
        ...section,
        trackings: filteredTrackings
      };
    }).filter(section => section.trackings.length > 0);

    setFilteredTrackings(filtered);
  }, [trackingSections, datesToWeekCurrent, currentWeekIndex]);

  // Función para obtener el proyecto y las fechas de la semana actual
  const fetchProjectAndDates = async () => {
    const storedProject = await getProject();
    if (storedProject) {
      setProject(typeof storedProject === 'string' ? JSON.parse(storedProject) : storedProject);
    }
    const today = new Date();
    const monday = getMonday(today);

    let dates = Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + index);
      return currentDate.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });

    setDatesToWeekCurrent(dates);
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
    const sections: TrackingSection[] = [];
    newTrackings.forEach((tracking) => {
      const trackingDate = new Date(tracking.date_start || new Date());
      const weekStartDate = new Date(trackingDate);
      weekStartDate.setDate(trackingDate.getDate() - trackingDate.getDay() + 1);
      const sectionId = weekStartDate.toISOString().split('T')[0];

      const existingSection = sections.find((section) => section.id === sectionId);
      if (existingSection) {
        existingSection.trackings.push(tracking);
      } else {
        sections.push({
          id: sectionId,
          trackings: [tracking]
        });
      }
    });
    sections.sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());
    return sections;
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
