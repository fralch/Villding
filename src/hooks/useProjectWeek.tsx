import { useState, useEffect } from 'react';

interface ProjectDates {
  startDate: string;
  endDate: string;
}

interface ProjectWeeks {
  currentWeek: number | null;
  totalWeeks: number | null;
}

const useProjectWeek = (projectDates: ProjectDates): ProjectWeeks => {
  const [projectWeeks, setProjectWeeks] = useState<ProjectWeeks>({
    currentWeek: null,
    totalWeeks: null,
  });

  useEffect(() => {
    const calculateCurrentWeek = () => {
      const startDate = new Date(projectDates.startDate);
      const endDate = new Date(projectDates.endDate);
      const currentDate = new Date();

      const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const weeksPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

      setProjectWeeks({
        currentWeek: weeksPassed,
        totalWeeks: totalWeeks,
      });
    };

    calculateCurrentWeek();
  }, [projectDates]);

  return projectWeeks;
};

export default useProjectWeek;
