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

  const calculateCurrentWeek = (startDateStr: string) => {
    const [year, month, day] = startDateStr.split('/').map(Number);
    const startDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    const differenceInMs = currentDate.getTime() - startDate.getTime();
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    return Math.floor(differenceInDays / 7) + 1;
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
