import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import ProjectCard from './ProjectCard';

// creamos un componente de lista de proyectos para iterarlos y poder usar solo un card si es necesario
interface Project {
  title: string;
  subtitle: string;
  company: string;
  image: string;
  week: number;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {projects.map((project, index) => (
        <ProjectCard
          key={index}
          project={project}
        />
      ))}
      <View style={styles.content}>
        <Text style={styles.newProjectText}>+ Nuevo proyecto</Text>
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
