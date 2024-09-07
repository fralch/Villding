import React from 'react';
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
  week: number;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  const { navigate } = useNavigation<NavigationProp<any>>();

  const handleNewProject = () => {
    navigate('NewProject');
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {projects.map((project, index) => (
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
