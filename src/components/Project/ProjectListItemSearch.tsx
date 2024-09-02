// src/components/ProjectListItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProjectListItemProps {
  image: string;
  title: string;
  location: string;
  company: string;
  onPress: () => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  image,
  title,
  location,
  company,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
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
      <Ionicons
        name='ellipsis-vertical'
        size={24}
        color='white'
      />
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
});

export default ProjectListItem;
