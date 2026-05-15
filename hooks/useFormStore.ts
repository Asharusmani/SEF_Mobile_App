// hooks/useFormStore.ts
import { create } from 'zustand';
import { SchoolFormData, ParentsFormData } from '../types/forms';
import { INITIAL_ACADEMIC_DATA } from '../constants/academicData';

const initialSchool: SchoolFormData = {
  schoolCode:    '',
  schoolLevel:   '',
  schoolName:    '',
  schoolShift:   '',
  district:      '',
  taluka:        '',
  unionCouncil:  '',
  schoolAddress: '',
};

const initialStudent = {
  sno:             '',
  student_id:      '',
  school_code:     '',
  gr_no:           '',
  bform_no:        '',
  name_of_student: '',
  student_dob:         '',
  student_dob_backend: '',
  gender:          '',
  religion:        '',
  village:         '',
  mother_tongue:   '',
  blood_group:     '',
  residential_address:          '',
  emergency_contact:            '',
  refugee_student:              'No',
  disability:                   'No',
  seeing_difficulty:            'No',
  hearing_difficulty:           'No',
  walking_difficulty:           'No',
  remembering_or_concentrating: 'No',
  speech_disorder:              'No',
  self_care:                    'No',
  profilePhoto: null as any,
};

const initialParents: ParentsFormData = {
  fatherName:          '',
  fatherCnic:          '',
  fatherOccupation:    '',
  fatherEducation:     '',
  fatherContact:       '',
  motherName:          '',
  motherCnic:          '',
  motherOccupation:    '',
  motherEducation:     '',
  motherContact:       '',
  guardianName:        '',
  guardianRelationship:'',
  guardianContact:     '',
  monthlyIncome:       '',
  guardianCnic:        null,
};

export type StudentData  = typeof initialStudent;
export type AcademicData = typeof INITIAL_ACADEMIC_DATA;

interface ExtendedFormStore {
  currentStep:        number;
  school:             SchoolFormData;
  student:            StudentData;
  academic:           AcademicData;
  parents:            ParentsFormData;
  createdStudentDbId: number | null;  // addStudents response ka DB id

  setCurrentStep:        (step: number)                   => void;
  updateSchool:          (data: Partial<SchoolFormData>)  => void;
  updateStudent:         (data: Partial<StudentData>)     => void;
  updateAcademic:        (data: Partial<AcademicData>)    => void;
  updateParents:         (data: Partial<ParentsFormData>) => void;
  setCreatedStudentDbId: (id: number | null)              => void;
  resetForm:             ()                               => void;
}

export const useFormStore = create<ExtendedFormStore>((set) => ({
  currentStep:        1,
  school:             initialSchool,
  student:            initialStudent,
  academic:           { ...INITIAL_ACADEMIC_DATA },
  parents:            initialParents,
  createdStudentDbId: null,

  setCurrentStep:        (step) => set({ currentStep: step }),
  setCreatedStudentDbId: (id)   => set({ createdStudentDbId: id }),

  updateSchool:   (data) => set((s) => ({ school:   { ...s.school,   ...data } })),
  updateStudent:  (data) => set((s) => ({ student:  { ...s.student,  ...data } })),
  updateAcademic: (data) => set((s) => ({ academic: { ...s.academic, ...data } })),
  updateParents:  (data) => set((s) => ({ parents:  { ...s.parents,  ...data } })),

  resetForm: () =>
    set({
      currentStep:        1,
      school:             initialSchool,
      student:            initialStudent,
      academic:           { ...INITIAL_ACADEMIC_DATA },
      parents:            initialParents,
      createdStudentDbId: null,
    }),
}));