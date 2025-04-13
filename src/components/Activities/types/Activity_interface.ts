// Activity_interface.ts
export interface Activity {
    id?: number;
    name: string;
    description: string;
    location: string;
    horas: string;
    status: string;
    comments: string;
    icon: string;
    image: string | string[];
    fecha_creacion: string;
    tracking_id?: number;
    project_id?: number;
  }