import AsyncStorage from '@react-native-async-storage/async-storage';

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

const PROJECTS_KEY = 'projects';

const saveProject = async (newProject: Project) => {
  try {
    const existingProjects = await getProjects();
    const updatedProjects = [...existingProjects, newProject];
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.log('Error al guardar el proyecto en AsyncStorage:', error);
  }
};

const deleteProject = async (projectId: string) => {
  try {
    const existingProjects = await getProjects();
    const updatedProjects = existingProjects.filter(
      (project) => project.id !== projectId
    );
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.log('Error al eliminar el proyecto de AsyncStorage:', error);
  }
};

// borrar todos  los proyectos
const deleteAllProjects = async () => {
  try {
    await AsyncStorage.removeItem(PROJECTS_KEY);
  } catch (error) {
    console.log('Error al eliminar todos los proyectos de AsyncStorage:', error);
  }
};

const getProjects = async (): Promise<Project[]> => {
  try {
    const projectsJSON = await AsyncStorage.getItem(PROJECTS_KEY);
    return projectsJSON ? JSON.parse(projectsJSON) : [];
  } catch (error) {
    console.log('Error al obtener los proyectos de AsyncStorage:', error);
    return [];
  }
};

const getProjectCurrent = async (
  projectId: string
): Promise<Project | null> => {
  try {
    const projects = await getProjects();
    return projects.find((project) => project.id === projectId) || null;
  } catch (error) {
    console.log('Error al obtener el proyecto actual de AsyncStorage:', error);
    return null;
  }
};

const updateProject = async (updatedProject: Project) => {
  try {
    const existingProjects = await getProjects();
    const updatedProjects = existingProjects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    );
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  } catch (error) {
    console.log('Error al actualizar el proyecto en AsyncStorage:', error);
  }
};

export {
  saveProject,
  deleteProject,
  getProjects,
  updateProject,
  getProjectCurrent,
  deleteAllProjects,
};
