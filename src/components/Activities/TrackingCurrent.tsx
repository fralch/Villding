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

// Definición del componente funcional TrackingCurrent
const TrackingCurrent: React.FC = () => {
  // Hook para la navegación
  const navigation = useNavigation<NavigationProp<any>>();

  // Estados locales del componente
  const [datesToWeekCurrent, setDatesToWeekCurrent] = useState<string[]>([]);
  const [modalSeguimientoVisible, setModalSeguimientoVisible] = useState(false);
  const [modalSinAccesoVisible, setModalSinAccesoVisible] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [titleTracking, setTitleTracking] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [msjeModal, setMsjeModal] = useState("El usuario se ha registrado correctamente.");

  // useEffect para cargar el proyecto y las fechas al montar el componente
  useEffect(() => {
    fetchProjectAndDates();
    obtenerSeguimientos();
  }, []);

  useEffect(() => {
    if (!project?.start_date) return; // Verificar si el proyecto tiene fechas de inicio

    const startDate = new Date(project.start_date.replace(/\//g, "-")); // Convertir la fecha de inicio a objeto Date

    const today = new Date(); // Obtener la fecha actual

    if (isNaN(startDate.getTime())) { // Verificar si la fecha de inicio es válida
      console.error("Fecha de inicio del proyecto no válida");
      return;
    }

    // Calcular la diferencia en días
    const timeDiff = today.getTime() - startDate.getTime(); // Obtener la diferencia en tiempo
    const dayDiff = timeDiff / (24 * 60 * 60 * 1000); // Dividir la diferencia en días

    // Dividir la diferencia en días por 7 para obtener la diferencia en semanas
    const weekIndex = Math.floor(dayDiff / 7); // Obtener la semana actual

    console.log("Inicio del proyecto:", startDate);
    console.log("Semana actual:", weekIndex);
    // console.log(project)
    setCurrentWeekIndex(weekIndex);
  }, [project]);

  // Función para obtener el proyecto y las fechas de la semana actual
  const fetchProjectAndDates = async () => {
    const storedProject = await getProject();
    if (storedProject && typeof storedProject === 'string') {
      const proyecto = JSON.parse(storedProject);
      setProject(proyecto);
    } else if (storedProject) {
      setProject(storedProject);
    }
    const today = new Date();
    const monday = getMonday(today);

    // Obtener las fechas de la semana actual
    let dates = Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + index);
      return currentDate.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });

    setDatesToWeekCurrent(dates);
  };

  // Función para cambiar la semana actual
  const handleWeekChange = (direccion: string) => {
    if (project?.week) {
      let semanas = project?.week ? parseInt(project.week.toString()) : 0;
      // console.log(direccion)
      console.log(currentWeekIndex > semanas)
      if (direccion === "left" && currentWeekIndex === 0) return;
      if (direccion === "right" && currentWeekIndex === semanas - 1) return;
      if (datesToWeekCurrent.length === 0) return;
      const [day, month] = datesToWeekCurrent[0].split("/").map(Number);
      const currentMonday = new Date(new Date().getFullYear(), month - 1, day);

      if (direccion === "right") {
        // Avanzar 1 semana
        currentMonday.setDate(currentMonday.getDate() + 7);
        setCurrentWeekIndex(currentWeekIndex + 1);
      } else if (direccion === "left") {
        // Retroceder 1 semana
        currentMonday.setDate(currentMonday.getDate() - 7);
        setCurrentWeekIndex(currentWeekIndex - 1);
      }

      const newWeekDates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(currentMonday);
        date.setDate(currentMonday.getDate() + index);
        return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
      });

      setDatesToWeekCurrent(newWeekDates);
    }
  };

  // Función para obtener el lunes de semana de una fecha dada
  const getMonday = (date: Date) => {
    const dayOfWeek = date.getDay(); // Obtener el día de la semana actual
    const monday = new Date(date); // Crear una copia de la fecha
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Calcular el lunes de la fecha
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

  const obtenerSeguimientos = async () => {
    // Obtener los seguimientos del usuario con get
    console.log("project id")
    console.log(project?.id)
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://centroesteticoedith.com/endpoint/trackings_project/' + project?.id,
    };

    axios.request(config)
      .then((response: any) => {
        console.log(JSON.stringify(response.data));
        const trackings = response.data;
        const updatedSections = updateTrackingSections(trackings);
       
        setTrackingSections(updatedSections);
      })
      .catch((error: Error) => {
        console.log(error);
      });
  };

  // Función para manejar la creación de un nuevo seguimiento
  const handleNewTracking = () => {
    const data = {
      project_id: project?.id,
      title: titleTracking.trim(), // remover espacios al principio y final
      description: "Descripcion",
      date_start: project?.start_date,
      duration_days: parseInt(project?.week?.toString() || '0')
    };

    axios
      .post("https://centroesteticoedith.com/endpoint/trackings/create", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        const newTrackings: Tracking[] = response.data.trackings;
        const updatedSections = updateTrackingSections(newTrackings);
        setTrackingSections(updatedSections);
        setModalSeguimientoVisible(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Función para actualizar las secciones de seguimiento con nuevos seguimientos
  const updateTrackingSections = (newTrackings: Tracking[]) => {
    const sections: TrackingSection[] = [];
    // Agrupamiento por fecha de inicio
    newTrackings.forEach((tracking) => {
      // Convert date format from "YYYY-MM-DD" to Date object (Convertir la fecha de inicio a objeto Date en formato "YYYY-MM-DD")
      const trackingDate = new Date(tracking.date_start || new Date());
      const weekStartDate = new Date(trackingDate);
      weekStartDate.setDate(trackingDate.getDate() - trackingDate.getDay() + 1); // Get Monday
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
    // Sort sections by date
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
          onPress={() => navigation.navigate("Task", { tracking })}
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

      // In the FlatList component
      <FlatList
        style={styles.flatList}
        data={trackingSections.filter((section) => {
          if (!project?.start_date) return false;
          
          const sectionStartDate = new Date(section.id);
          const projectStartDate = new Date(project.start_date.replace(/\//g, "-"));
          const weekStartDate = new Date(projectStartDate);
          weekStartDate.setDate(projectStartDate.getDate() + (currentWeekIndex * 7));
          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekStartDate.getDate() + 7);
          
          return sectionStartDate >= weekStartDate && sectionStartDate < weekEndDate;
        })}
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
