// src/components/ProjectList.tsx
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ProjectListItem from './ProjectListItemSearch';

interface Project {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  company: string;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectListSearch: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={({ item }) => (
          <ProjectListItem
            image={item.image}
            title={item.title}
            location={item.subtitle}
            company={item.company}
            onPress={() => console.log(`Clicked on ${item.title}`)}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#10384e',
  },
});

export default ProjectListSearch;
