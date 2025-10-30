import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProjectList from "../../components/Project/ProjectList";
import ProjectListSearch from "../../components/Project/ProjectListSearch";
import { getProjects, saveProject, deleteAllProjects } from "../../hooks/localStorageProject";
import { removeProject } from "../../hooks/localStorageCurrentProject";
import { getSesion } from "../../hooks/localStorageUser";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import axios from "axios";
import { styles } from "./styles/HomeProject";
import { API_BASE_URL } from '../../config/api';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  company: string;
  image: string;
  start_date: string;
  end_date: string;
  week: number;
  week_current: number;
}

export default function HomeProject() {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [search, setSearch] = React.useState<string>("");
  const [viewSearch, setViewSearch] = React.useState<boolean>(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = React.useState<Project[]>([]);
  const [imageUserSesion, setImageUserSesion] = React.useState<string>();
  const [user, setUser] = React.useState<any>();

  const screenWidth = Dimensions.get("window").width;
  const headerWidth = Dimensions.get("window").width;

  React.useEffect(() => {
    getSesion().then((StoredSesion: any) => {
      let sesion = JSON.parse(StoredSesion);
      // console.log(sesion.id);
      setImageUserSesion(sesion.uri);
      setUser(sesion);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Esto se ejecuta cada vez que vuelves a la pantalla
      getSesion().then((StoredSesion: any) => {
        let sesion = JSON.parse(StoredSesion);
        // console.log(sesion.uri);
        setImageUserSesion(sesion.uri);
        setUser(sesion);
      });

      return () => {
        // Limpieza si es necesario
      };
    }, [])
  );

  React.useEffect(() => {
    removeProject();
    const filtered = projects.filter((project) => {
      if (search === "") {
        return true;
      }
      return (
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        project.company.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredProjects(filtered);
  }, [search, projects]);

  // useFocusEffect es un gancho de React Navigation que se ejecuta cada vez que la pantalla obtiene el foco.
  useFocusEffect(
    useCallback(() => {
      // Eliminar todos los proyectos almacenados localmente
      deleteAllProjects().then(() => {
        // Consultar los proyectos al servidor
        getSesion().then((StoredSesion: any) => {
          const sesion = JSON.parse(StoredSesion);
          if (sesion && sesion.id) {
            setUser(sesion);
            fetchProjectsFromServer(sesion.id).then((fetchedProjects) => {
              setProjects(fetchedProjects);
              setFilteredProjects(fetchedProjects);
              saveProjectsToLocalStorage(fetchedProjects);
            });
          } else {
            console.error("No se encontró el ID del usuario en la sesión.");
          }
        });
      });
    }, [])
  );

  async function fetchProjectsFromServer(userId: string): Promise<Project[]> {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/user/check-attachment`,
            { user_id: userId },
            {
                headers: {
                    Authorization: `Bearer YOUR_TOKEN`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Accede a la propiedad 'projects' del objeto de respuesta
        const projectsData = response.data.projects;

        // Utiliza un Set para almacenar los IDs de los proyectos procesados
        const seenProjectIds = new Set();

        // Filtra los proyectos duplicados
        const uniqueProjects = projectsData.filter((project: any) => {
            if (seenProjectIds.has(project.id)) {
                return false; // El proyecto ya ha sido procesado
            } else {
                seenProjectIds.add(project.id);
                return true; // El proyecto no ha sido procesado
            }
        });

        // Mapea los datos de la API al formato de la interfaz
        const mappedProjects: Project[] = uniqueProjects.map((project: any) => ({
            id: String(project.id),
            title: project.name,
            subtitle: project.location,
            company: project.company,
            image: project.uri || "",
            start_date: formatDate(project.start_date),
            end_date: formatDate(project.end_date),
            nearest_monday: formatDate(project.nearest_monday),
            week: calculateWeekDifference(project.start_date, project.end_date),
            week_current: calculateWeekCurrent(project.start_date, project.nearest_monday),
        }));

        return mappedProjects;
    } catch (error) {
        console.error("Error al obtener proyectos del servidor:", error);
        return [];
    }
}




  async function saveProjectsToLocalStorage(
    projects: Project[]
  ): Promise<void> {
    try {
      // Guarda los proyectos en AsyncStorage
      for (const project of projects) {
        await saveProject(project);  // Usamos la función saveProject de tu hook
      }
    } catch (error) {
      console.error("Error al guardar proyectos en localStorage:", error);
    }
  }

  // Obtener el lunes de una semana dada una fecha
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    const monday = new Date(date);
    monday.setDate(diff);
    return monday;
  };

  // Función auxiliar para calcular semanas totales del proyecto (desde start_date hasta end_date)
  function calculateWeekDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const diffInWeeks = Math.ceil((end.getTime() - start.getTime()) / msPerWeek);
    return diffInWeeks;
  }

  // Función para calcular la semana actual del proyecto
  function calculateWeekCurrent(startDate: string, nearestMonday: string): number {
    // nearestMonday ya es el lunes de la semana de inicio del proyecto
    const firstMonday = new Date(nearestMonday);
    const currentDate = new Date();
    const currentMonday = getMonday(currentDate);

    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksDiff = Math.floor((currentMonday.getTime() - firstMonday.getTime()) / msPerWeek);

    // La primera semana es 1, no 0
    return weeksDiff + 1;
  }

  function formatDate(date: string | null | undefined): string {
    // Validar que la fecha no sea null o undefined
    if (!date) {
      return '';
    }
    // El servidor devuelve fechas en formato YYYY-MM-DD
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  return (
    <View style={[styles.container]}>
      <ExpoStatusBar style="dark" />

      {!viewSearch ? (
        <View style={[styles.header, { width: headerWidth }]}>
          <Image
            source={require("../../assets/images/logo-tex-simple_white.png")}
            style={styles.title}
          />
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setViewSearch(true)}>
              <Feather
                name="search"
                size={26}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigate("EditUser")}>
              <Image
                source={
                  imageUserSesion
                    ? { uri: imageUserSesion }
                    : require("../../assets/images/user.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {viewSearch ? (
        <View
          style={[
            styles.header,
            {
              width: headerWidth,
            },
          ]}
        >
          <View style={[styles.headerSearch]}>
            <Feather
              name="search"
              size={26}
              color="white"
              style={[styles.icon, { marginRight: 0 }]}
            />
            <TextInput
              style={styles.input}
              placeholder="Buscar..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="white"
            />
            <TouchableOpacity onPress={() => setViewSearch(false)}>
              <MaterialIcons name="cancel" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {!viewSearch ? (
        <ProjectList projects={filteredProjects} />
      ) : (
        <ProjectListSearch projects={filteredProjects} />
      )}
    </View>
  );
}

