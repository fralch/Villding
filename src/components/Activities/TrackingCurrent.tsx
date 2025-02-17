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
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { getProject } from "../../hooks/localStorageCurrentProject";
import { getSesion } from "../../hooks/localStorageUser";
import ConfirmModal from "../Alerta/ConfirmationModal";
import axios from "axios";
import { Tracking, TrackingSection, Project, User } from "../../types/interfaces";

const TrackingCurrent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [datesToWeekCurrent, setDatesToWeekCurrent] = useState<string[]>([]);
  const [modalSeguimientoVisible, setModalSeguimientoVisible] = useState(false);
  const [modalSinAccesoVisible, setModalSinAccesoVisible] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [titleTracking, setTitleTracking] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [msjeModal, setMsjeModal] = useState(
    "El usuario se ha registrado correctamente."
  );

  useEffect(() => {
    getProject().then((StoredProject: any) => {
      const proyecto = JSON.parse(StoredProject);
      setProject(proyecto);
    });
  }, []);

  const handleNextWeek = () => {
    if (!project?.start_date || !project?.end_date) {
      console.log("Fechas no definidas");
      return;
    }

    const startDate = new Date(project.start_date.replace(/\//g, "-"));
    const endDate = new Date(project.end_date.replace(/\//g, "-"));

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.log("Formato de fecha inválido:", project.start_date, project.end_date);
      return;
    }

    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    if (currentWeekIndex < totalWeeks - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
      updateDatesForWeek(currentWeekIndex + 1);
    }
  };

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
      updateDatesForWeek(currentWeekIndex - 1);
    }
  };

  const updateDatesForWeek = (weekIndex: number) => {
    if (!project?.start_date) return;
  
    const startDate = new Date(project.start_date.replace(/\//g, "-"));
  
    // Calcular el lunes de la semana inicial
    const initialMonday = new Date(startDate);
    const dayOfWeek = initialMonday.getDay(); // 0 (Domingo) - 6 (Sábado)
    initialMonday.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
    // Calcular el lunes de la semana actual
    const weekStartDate = new Date(initialMonday);
    weekStartDate.setDate(initialMonday.getDate() + weekIndex * 7);
  
    const weekDates = Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + index);
      return currentDate.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });
  
    setDatesToWeekCurrent(weekDates);
  };
  

  const getDatesForCurrentWeek = (): string[] => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Domingo) - 6 (Sábado)

    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + index);
      return currentDate.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
    });
  };

  useEffect(() => {
    setDatesToWeekCurrent(getDatesForCurrentWeek());
  }, []);

  const handleNewTracking = () => {
    const data = {
      project_id: project?.id,
      user_id: user?.id,
      title: titleTracking,
      description: "Descripcion",
    };

    axios
      .post("https://centroesteticoedith.com/endpoint/trackings/create", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        const newTrackings: Tracking[] = response.data.trackings;

        const updatedSections = trackingSections.map((section) => {
          const weekTrackings = newTrackings.filter((tracking: Tracking) => {
            const trackingDate = new Date(tracking.date_start || "");
            const sectionStartDate = new Date(section.id);
            return (
              trackingDate >= sectionStartDate &&
              trackingDate <
                new Date(sectionStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            );
          });
          if (weekTrackings.length > 0) {
            return {
              ...section,
              trackings: [...section.trackings, ...weekTrackings],
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
        <TouchableOpacity
          onPress={handlePreviousWeek}
          disabled={currentWeekIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={30}
            color={currentWeekIndex === 0 ? "#07374a" : "white"}
          />
        </TouchableOpacity>
        <Text style={styles.weekTitle}>Semana {currentWeekIndex + 1}</Text>
        <TouchableOpacity
          onPress={handleNextWeek}
          disabled={
            currentWeekIndex ===
            Math.ceil(
              (new Date(project?.end_date || "").getTime() -
                new Date(project?.start_date || "").getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            ) -
              1
          }
        >
          <Ionicons
            name="chevron-forward"
            size={30}
            color={
              currentWeekIndex ===
              Math.ceil(
                (new Date(project?.end_date || "").getTime() -
                  new Date(project?.start_date || "").getTime()) /
                  (7 * 24 * 60 * 60 * 1000)
              ) -
                1
                ? "#07374a"
                : "white"
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day, index) => {
          const currentDate = datesToWeekCurrent[index];
          const today = new Date();
          const isToday =
            today.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) === currentDate;

          return (
            <View
              key={index}
              style={[styles.dayColumn, isToday && { backgroundColor: "#0A3649", borderRadius: 8 }]}
            >
              <Text style={[styles.dayText, isToday && { color: "#4ABA8D" }]}>{day}</Text>
              <Text style={[styles.dateText, isToday && { color: "#4ABA8D" }]}>{currentDate}</Text>
            </View>
          );
        })}
      </View>

      <FlatList
        style={styles.flatList}
        data={trackingSections.filter((section) => {
          const sectionStartDate = new Date(section.id);
          const currentWeekStartDate = new Date(project?.start_date || "");
          currentWeekStartDate.setDate(
            currentWeekStartDate.getDate() + currentWeekIndex * 7
          );
          return (
            sectionStartDate >= currentWeekStartDate &&
            sectionStartDate <
              new Date(currentWeekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          );
        })}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScrollView style={styles.trackingSection}>
            {item.trackings.map((tracking: Tracking) => (
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
                            backgroundColor:
                              isChecked === -1 ? "#004e66" : "#0A3649",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            isChecked == 1
                              ? "checkmark"
                              : isChecked == -1
                              ? "ellipse-outline"
                              : "ellipse-sharp"
                          }
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
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalSeguimientoVisible(true)}
      >
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#004e66",
                    borderColor: "white",
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setModalSeguimientoVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: "white", paddingHorizontal: 10 },
                  ]}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
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
        <Pressable
          style={[styles.modalContainer, { justifyContent: "flex-end" }]}
          onPress={() => setModalSinAccesoVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: "#CFA54A" }]}>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: "#07374a", marginBottom: 0 },
                ]}
              >
                No tienes acceso
              </Text>
            </View>
            <Text style={{ color: "#07374a", fontSize: 16 }}>
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
    backgroundColor: "#07374a",
    paddingHorizontal: 0,
  },
  weekSelector: {
    backgroundColor: "#05222F",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: "stretch",
    marginVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  weekTitle: {
    color: "white",
    fontSize: 20,
    marginHorizontal: 10,
  },
  daysRow: {
    backgroundColor: "#05222F",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 1,
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayText: {
    color: "white",
    fontSize: 14,
  },
  dateText: {
    color: "#7bc4c4",
    fontSize: 12,
  },
  trackingSection: {
    marginVertical: 0,
  },
  taskRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    height: 80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#004e66",
    borderRadius: 8,
    marginBottom: 5,
  },
  taskTitle: {
    color: "white",
    fontSize: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  iconContainer: {
    backgroundColor: "#0A3649",
    borderRadius: 5,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "14%",
    height: 40,
  },
  icon: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#07374a",
    borderRadius: 8,
  },
  addButtonText: {
    color: "#7bc4c4",
    fontSize: 18,
    marginLeft: 10,
  },
  flatList: {
    flex: 1,
    backgroundColor: "#07374a",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#0A3649",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    width: "90%",
  },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#0A3649",
    fontSize: 16,
  },
  modalInput: {
    backgroundColor: "#05222F",
    color: "white",
    fontSize: 16,
    width: "80%",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    borderColor: "#0A3649",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
  },
});

export default TrackingCurrent;
