// src/components/ProjectListItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface ProjectListItemProps {
  image: string;
  title: string;
  location: string;
  company: string;
  start_date: string;
  end_date: string;
  week: number;
  week_current: number;
  id?: string;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  image,
  title,
  location,
  company,
  week,
  week_current,
  start_date,
  end_date,
  id,
}) => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  
  // Crear el objeto proyecto completo para pasar a la navegación
  const project = {
    id: id || '',
    image,
    title,
    subtitle: location,
    company,
    start_date,
    end_date,
    week,
    week_current
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigate('Project', { project })}
      activeOpacity={0.7}
      onLongPress={() => navigate('Project', { project })}
    >
      <Image
        source={{ uri: image }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{location}</Text>
        <Text style={styles.subtitle}>{company}</Text>
      </View>
      {/* <Ionicons
        name='ellipsis-vertical'
        size={30}
        color='white'
      /> */}
      <View style={styles.weekBadge}>
        <Text style={styles.weekText}>Semana {week}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#144a67',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
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

export default ProjectListItem;
