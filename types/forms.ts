export interface SchoolFormData {
  schoolCode: string;
  schoolLevel: string;
  schoolName: string;
  schoolShift: string;
  district: string;
  taluka: string;
  unionCouncil: string;
  schoolAddress: string;
}

export interface StudentFormData {
  studentName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  nationality: string;
  cnic: string;
  bForm: string;
  province: string;
  city: string;
  studentAddress: string;
  profilePhoto: DocumentFile | null;
}

export interface AcademicFormData {
  grade: string;
  rollNumber: string;
  admissionDate: string;
  previousSchool: string;
  previousGrade: string;
  mediumOfInstruction: string;
  disabilityStatus: string;
  disabilityType: string;
  scholarshipStatus: string;
  transferCertificate: DocumentFile | null;
  birthCertificate: DocumentFile | null;
}

export interface ParentsFormData {
  fatherName: string;
  fatherCnic: string;
  fatherOccupation: string;
  fatherEducation: string;
  fatherContact: string;
  motherName: string;
  motherCnic: string;
  motherOccupation: string;
  motherEducation: string;
  motherContact: string;
  guardianName: string;
  guardianRelationship: string;
  guardianContact: string;
  monthlyIncome: string;
  guardianCnic: DocumentFile | null;
}

export interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface FormStore {
  currentStep: number;
  school: SchoolFormData;
  student: StudentFormData;
  academic: AcademicFormData;
  parents: ParentsFormData;
  setCurrentStep: (step: number) => void;
  updateSchool: (data: Partial<SchoolFormData>) => void;
  updateStudent: (data: Partial<StudentFormData>) => void;
  updateAcademic: (data: Partial<AcademicFormData>) => void;
  updateParents: (data: Partial<ParentsFormData>) => void;
  resetForm: () => void;
}
