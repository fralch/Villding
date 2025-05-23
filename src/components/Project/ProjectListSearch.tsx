// src/components/ProjectList.tsx
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ProjectListItem from './ProjectListItemSearch';

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

const ProjectListSearch: React.FC<ProjectListProps> = ({ projects }) => {
  const { navigate } = useNavigation<NavigationProp<any>>();
  
  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={({ item }) => (
          <ProjectListItem
            id={item.id}
            image={item.image}
            title={item.title}
            location={item.subtitle}
            company={item.company}
            week={item.week}
            week_current={item.week_current}
            start_date={item.start_date}
            end_date={item.end_date}
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
