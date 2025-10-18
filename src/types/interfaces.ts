interface Tracking {
  id: number;
  project_id: number;
  title: string;
  description: string;
  date_start: string | null;
  date_end: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  checked?: number[];
}

interface TrackingSection {
  id: string;
  trackings: Tracking[];
}

interface Project {
  company: string;
  id: string;
  image: string;
  subtitle: string;
  title: string;
  start_date: string;
  end_date: string;
  week_current: number;
  week: number;
}

interface User {
  id: any;
  nombres: string;
  apellidos: string;
  email: string;
  email_contact?: string;
  password: string;
  rol: string;
  user_code: string;
  telefono?: string;
  edad?: number;
  uri?: string;
  tamano_img?: number;
}

// exportar las interfaces
export { Tracking, TrackingSection, Project, User };