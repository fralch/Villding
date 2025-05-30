import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// creamos un componente de card para mostrarlos en la lista de proyectos o en una sola selección

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    subtitle: string;
    company: string;
    image: string;
    start_date: string;
    end_date: string;
    week: number;
    week_current: number;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: project.image }}
        style={styles.cardImage}
      />
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => {
          navigate('Project', { project });
        }}
      >
        <Text style={styles.cardTitle}>{project.title}</Text>
        <Text style={styles.cardSubtitle}>{project.subtitle}</Text>
        <Text style={styles.cardCompany}>{project.company}</Text>
        <Text style={[styles.cardCompany, { fontWeight: 'bold', fontSize: 12, color: '#8AA4A5'}]}>{project.start_date} - {project.end_date}</Text>
        <View style={styles.weekBadge}>
          <Text style={styles.weekText}>Semana {project.week_current}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A455E',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderColor: '#0A3649',
    borderWidth: 1,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Sombra para Android
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  cardCompany: {
    color: '#8AA4A5',
    fontSize: 12,
    marginTop: 2,
  },
  weekBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#0A3649',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  weekText: {
    color: 'white',
    fontSize: 12,
  },
});

export default ProjectCard;
