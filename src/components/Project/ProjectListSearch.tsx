// src/components/ProjectList.tsx
import React, { useEffect, useState } from 'react';
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
  const [projectsWithCurrentWeek, setProjectsWithCurrentWeek] = useState<Project[]>([]);

  const calculateCurrentWeek = (startDateStr: string) => {
    // Las fechas vienen formateadas como DD/MM/YYYY
    const [day, month, year] = startDateStr.split('/').map(Number);
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
  
  return (
    <View style={styles.container}>
      <FlatList
        data={projectsWithCurrentWeek}
        renderItem={({ item }) => (
          <ProjectListItem
            id={item.id}
            image={item.image}
            title={item.title}
            location={item.subtitle}
            company={item.company}
            week={item.week_current}
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
