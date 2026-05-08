import { create } from 'zustand';
import {
  FormStore,
  SchoolFormData,
  StudentFormData,
  AcademicFormData,
  ParentsFormData,
} from '../types/forms';

const initialSchool: SchoolFormData = {
  schoolCode: '',
  schoolLevel: '',
  schoolName: '',
  schoolShift: '',
  district: '',
  taluka: '',
  unionCouncil: '',
  schoolAddress: '',
};

const initialStudent: StudentFormData = {
  studentName: '',
  fatherName: '',
  dateOfBirth: '',
  gender: '',
  religion: '',
  nationality: 'Pakistani',
  cnic: '',
  bForm: '',
  province: '',
  city: '',
  studentAddress: '',
  profilePhoto: null,
};

const initialAcademic: AcademicFormData = {
  grade: '',
  rollNumber: '',
  admissionDate: '',
  previousSchool: '',
  previousGrade: '',
  mediumOfInstruction: '',
  disabilityStatus: 'No',
  disabilityType: '',
  scholarshipStatus: 'No',
  transferCertificate: null,
  birthCertificate: null,
};

const initialParents: ParentsFormData = {
  fatherName: '',
  fatherCnic: '',
  fatherOccupation: '',
  fatherEducation: '',
  fatherContact: '',
  motherName: '',
  motherCnic: '',
  motherOccupation: '',
  motherEducation: '',
  motherContact: '',
  guardianName: '',
  guardianRelationship: '',
  guardianContact: '',
  monthlyIncome: '',
  guardianCnic: null,
};

export const useFormStore = create<FormStore>((set) => ({
  currentStep: 1,
  school: initialSchool,
  student: initialStudent,
  academic: initialAcademic,
  parents: initialParents,

  setCurrentStep: (step) => set({ currentStep: step }),

  updateSchool: (data) =>
    set((state) => ({ school: { ...state.school, ...data } })),

  updateStudent: (data) =>
    set((state) => ({ student: { ...state.student, ...data } })),

  updateAcademic: (data) =>
    set((state) => ({ academic: { ...state.academic, ...data } })),

  updateParents: (data) =>
    set((state) => ({ parents: { ...state.parents, ...data } })),

  resetForm: () =>
    set({
      currentStep: 1,
      school: initialSchool,
      student: initialStudent,
      academic: initialAcademic,
      parents: initialParents,
    }),
}));
