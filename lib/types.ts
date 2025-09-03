export interface FormValues {
  name: string;
  email: string;
  phone: string;
  postal: string;
  selectedType: string;
  plannedDate: string;
  comment: string;
  consent: boolean;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  postal?: string;
  selectedType?: string;
  plannedDate?: string;
  comment?: string;
  consent?: string;
}

export interface FormState {
  values: FormValues;
  errors: FormErrors;
}

// ZAKTUALIZOWANY TYP
export interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  preview?: string;
  error?: string;
}

export interface TileData {
  value: string;
  title: string;
  desc: string;
  src: string;
  alt: string;
}

export type NotificationState = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;