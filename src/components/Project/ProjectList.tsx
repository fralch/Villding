import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ProjectCard from './ProjectCard';

// creamos un componente de lista de proyectos para iterarlos y poder usar solo un card si es necesario
interface Project {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  company: string;
  start_date: string;
  end_date: string;
  week: number;
  week_current: number;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [projectsWithCurrentWeek, setProjectsWithCurrentWeek] = useState<Project[]>([]);

  // Obtener el lunes de una semana dada una fecha
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    return new Date(date.setDate(diff));
  };

  const calculateCurrentWeek = (startDateStr: string) => {
    const [year, month, day] = startDateStr.split('/').map(Number);
    const startDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    // Encontrar el primer lunes desde la fecha de inicio
    const firstMonday = getMonday(startDate);
    
    // Encontrar el lunes de la semana actual
    const currentMonday = getMonday(currentDate);
    
    // Calcular la diferencia en semanas entre los dos lunes
    const weeksDiff = Math.floor((currentMonday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    return weeksDiff + 1; // Sumamos 1 porque la primera semana es la semana 1
  };

  useEffect(() => {
    const updatedProjects = projects.map(project => ({
      ...project,
      week_current: calculateCurrentWeek(project.start_date)
    }));
    setProjectsWithCurrentWeek(updatedProjects);
  }, [projects]);

  const handleNewProject = () => {
    navigate('NewProject');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {projectsWithCurrentWeek.map((project, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigate('Project', { project })}
        >
          <ProjectCard
            key={index}
            project={project}
          />
        </TouchableOpacity>
      ))}
      <View style={styles.content}>
        <TouchableOpacity onPress={handleNewProject}>
          <Text style={styles.newProjectText}>+ Nuevo proyecto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    backgroundColor: '#0A3649',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  newProjectText: {
    color: '#33BABA',
    fontSize: 18,
    fontWeight: '500',
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default ProjectList;
