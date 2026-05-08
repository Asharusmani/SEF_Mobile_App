export const SCHOOL_LEVELS = [
  'Primary (1-5)',
  'Middle (1-8)',
  'Secondary (1-10)',
  'Higher Secondary (1-12)',
];

export const SCHOOL_SHIFTS = ['Morning', 'Evening', 'Both'];

export const DISTRICTS: Record<string, string[]> = {
  'Karachi': ['Karachi East', 'Karachi West', 'Karachi Central', 'Karachi South', 'Korangi', 'Malir'],
  'Hyderabad': ['City', 'Latifabad', 'Qasimabad'],
  'Sukkur': ['Sukkur City', 'Rohri', 'Saleh Pat'],
  'Larkana': ['Larkana City', 'Ratodero', 'Dokri'],
  'Nawabshah': ['Nawabshah City', 'Sakrand', 'Moro'],
  'Mirpurkhas': ['Mirpurkhas City', 'Digri', 'Kot Ghulam Muhammad'],
  'Jacobabad': ['Jacobabad City', 'Thul', 'Garhi Khairo'],
  'Shikarpur': ['Shikarpur City', 'Lakhi', 'Khanpur'],
  'Khairpur': ['Khairpur City', 'Gambat', 'Kingri'],
  'Ghotki': ['Ghotki City', 'Ubauro', 'Mirpur Mathelo'],
};

export const DISTRICT_LIST = Object.keys(DISTRICTS);

export const GRADES = [
  'Nursery', 'KG', 'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
  'Grade 9', 'Grade 10',
];

export const GENDERS = ['Male', 'Female'];

export const RELIGIONS = ['Islam', 'Christianity', 'Hinduism', 'Other'];

export const PROVINCES = ['Sindh', 'Punjab', 'KPK', 'Balochistan', 'Gilgit Baltistan', 'AJK'];

export const RELATIONSHIPS = ['Father', 'Mother', 'Guardian', 'Other'];

export const OCCUPATIONS = [
  'Government Employee', 'Private Employee', 'Business',
  'Farmer', 'Labor', 'Unemployed', 'Other',
];

export const EDUCATION_LEVELS = [
  'Illiterate', 'Primary', 'Middle', 'Matric',
  'Intermediate', 'Graduate', 'Post Graduate',
];

export const FORM_STEPS = [
  { id: 1, label: 'SCHOOL' },
  { id: 2, label: 'STUDENT' },
  { id: 3, label: 'ACADEMIC' },
  { id: 4, label: 'PARENTS' },
];
