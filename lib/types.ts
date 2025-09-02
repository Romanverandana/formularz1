// lib/types.ts

// ====== FORM CORE ======
export type FormValues = {
  name: string;
  email: string;
  phone: string;       // E.164 z react-phone-number-input
  postal: string;      // "00-000"
  selectedType: string;
  plannedDate?: string;
  comment?: string;
  consent: boolean;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export type FormState = {
  values: FormValues;
  errors: FormErrors;
};

// ====== UI / DATA ======
export type TileData = {
  value: string;
  title: string;
  desc?: string;
  src: string;
  alt: string;
};

export type NotificationState = {
  type: "success" | "error" | "info";
  message: string;
};

// ====== FILES ======
export type FileWithProgress = {
  id: string;
  file: File;
  progress: number;     // 0–100
  preview?: string;     // dataURL
  error?: string;
};
