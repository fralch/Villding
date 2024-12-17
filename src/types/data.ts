export type UserRole = 1 | 2 | 3 | 4; // TODO: Define roles as enums

export type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  uri?: string;
  isPaidUser: boolean;
  role: UserRole;
  user_code: string;
};

export type Project = {
  id: string;
  uri?: string;
  name: string;
  company: string;
  startDate: Date;
  endDate: Date;
  location: string;
};

export type ProjectConfig = {
  [key: string]: {
    photo: boolean;
    location: boolean;
    description: boolean;
    comments: boolean;
    tasksName: boolean;
    share: boolean;
  };
};

export enum ActivityStatus {
  blank = 'blank',
  completed = 'completed',
  inProgress = 'inProgress',
  scheduled = 'scheduled',
}

export type ActivityInfoStatus = 'scheduled' | 'completed';

// TODO: Update from icon list, define by enum?
export type ActivityType =
  | 'compactacion'
  | 'concretoArmado'
  | 'concretoHormigon'
  | 'concretoSimple'
  | 'demolicion'
  | 'demolicion2'
  | 'movimientoTierra'
  | 'relleno';

export type Activity = {
  id: string;
  title: string;
  icon: any; // TODO: Define `icon` type, get from `ActivityType` once defined
  startHour?: string;
  endHour?: string;
  status?: ActivityStatus;
  type?: ActivityType;
  uri?: string;
  editAuthor?: string;
  editDate?: string; // TODO: Change to `date`
  time?: string; // TODO: Change to `time|date`
  location?: string; // TODO: Change to `location`
  description?: string;
  comments?: string;
};

export type ActivityDay = {
  id: string;
  entryId: string;
  title: string; // Note: `title` is date formatted as `YYYY-MM-DD`
  data: Activity[] | {}[] | readonly any[];
};

export type WeekActivity = {
  date: string;
  status: Record<ActivityStatus, string>;
  weekNumber: number;
};

export type ProjectAgendaEntry = {
  id: string;
  agendaId: string;
  name: string;
  weekActivities: WeekActivity[];
};

export type ProjectAgendaItems = { [date: string]: ProjectAgendaEntry };

export type ProjectAgenda = {
  id: string;
  projectId: string;
  totalWeeks: number;
  entries: ProjectAgendaEntry[];
};

export enum NoteStatus {
  hidden = 'hidden',
  regular = 'regular',
  important = 'important',
  completed = 'completed',
}

export type NotesGroup = { value: string; label: string; color: string };

export type NoteData = {
  id: string;
  content: string;
  userId: string;
  status?: NoteStatus;
  date?: Date | number;
  formattedDate?: string;
  time?: Date | number;
  groupValue?: string;
};

export type Notes = {
  [key: string]: {
    data: NoteData[];
    groups: NotesGroup[];
  };
};

export type LanguageCode = 'es';
export type ThemeMode = 'dark' | 'light' | 'base';
export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ProjectView = 'list' | 'cards';
export type UserInfo = 'firstName' | 'lastName' | 'contactEmail' | 'email';
