// store/slices/formSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INITIAL_ACADEMIC_DATA } from '../../constants/academicData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SchoolData {
  schoolCode:    string;
  schoolLevel:   string;
  schoolName:    string;
  schoolShift:   string;
  district:      string;
  taluka:        string;
  unionCouncil:  string;
  schoolAddress: string;
}

export interface StudentData {
  sno:             string;
  student_id:      string;
  school_code:     string;
  gr_no:           string;
  bform_no:        string;
  name_of_student: string;
  student_dob:         string;
  student_dob_backend: string;
  gender:          string;
  religion:        string;
  village:         string;
  mother_tongue:   string;
  blood_group:     string;
  residential_address:          string;
  emergency_contact:            string;
  refugee_student:              string;
  disability:                   string;
  seeing_difficulty:            string;
  hearing_difficulty:           string;
  walking_difficulty:           string;
  remembering_or_concentrating: string;
  speech_disorder:              string;
  self_care:                    string;
  profilePhoto: any;
}

export interface AcademicData {
  admissionDate:         string;
  admissionDate_backend: string;
  academicYear:          string;
  classAdmitted:         string;
  currentClass:          string;
  section:               string;
  shift:                 string;
  mediumOfInstruction:   string;
  studentStatus:         string;
  lastSchoolType:        string;
  lastSchoolStudentId:   string;
  lastSchoolName:        string;
  lastClassAttended:     string;
  birthCertificate:      any;
  transferCertificate:   any;
}

export interface ParentsData {
  // ── Father ──────────────────────────────────────────────────────────────────
  fatherName:           string;
  fatherCnic:           string;
  fatherOccupation:     string;
  fatherQualification:  string;  // ← was fatherEducation (wrong key)
  fatherContact:        string;
  fatherEmail:          string;  // ← was missing
  // ── Mother ──────────────────────────────────────────────────────────────────
  motherName:           string;
  motherCnic:           string;
  motherOccupation:     string;
  motherEducation:      string;
  motherContact:        string;
  // ── Guardian / Income ───────────────────────────────────────────────────────
  guardianName:         string;
  guardianRelationship: string;
  guardianContact:      string;
  monthlyIncome:        string;
  // ── File uploads ─────────────────────────────────────────────────────────────
  fatherCnicFront:      any;     // ← was guardianCnic (wrong key)
  fatherCnicBack:       any;
  motherCnicFront:      any;
  motherCnicBack:       any;
}

export interface FormState {
  currentStep:        number;
  createdStudentDbId: number | null;
  school:             SchoolData;
  student:            StudentData;
  academic:           AcademicData;
  parents:            ParentsData;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialSchool: SchoolData = {
  schoolCode:    '',
  schoolLevel:   '',
  schoolName:    '',
  schoolShift:   '',
  district:      '',
  taluka:        '',
  unionCouncil:  '',
  schoolAddress: '',
};

const initialStudent: StudentData = {
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
  profilePhoto: null,
};

const initialAcademic: AcademicData = {
  admissionDate:         '',
  admissionDate_backend: '',
  academicYear:          '',
  classAdmitted:         '',
  currentClass:          '',
  section:               '',
  shift:                 '',
  mediumOfInstruction:   '',
  studentStatus:         '',
  lastSchoolType:        '',
  lastSchoolStudentId:   '',
  lastSchoolName:        '',
  lastClassAttended:     '',
  birthCertificate:      null,
  transferCertificate:   null,
};

const initialParents: ParentsData = {
  // ── Father ──────────────────────────────────────────────────────────────────
  fatherName:           '',
  fatherCnic:           '',
  fatherOccupation:     '',
  fatherQualification:  '',  // ← was fatherEducation
  fatherContact:        '',
  fatherEmail:          '',  // ← was missing
  // ── Mother ──────────────────────────────────────────────────────────────────
  motherName:           '',
  motherCnic:           '',
  motherOccupation:     '',
  motherEducation:      '',
  motherContact:        '',
  // ── Guardian / Income ───────────────────────────────────────────────────────
  guardianName:         '',
  guardianRelationship: '',
  guardianContact:      '',
  monthlyIncome:        '',
  // ── File uploads ─────────────────────────────────────────────────────────────
  fatherCnicFront:      null,  // ← was guardianCnic
  fatherCnicBack:       null,
  motherCnicFront:      null,
  motherCnicBack:       null,
};

const initialState: FormState = {
  currentStep:        1,
  createdStudentDbId: null,
  school:             initialSchool,
  student:            initialStudent,
  academic:           initialAcademic,
  parents:            initialParents,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    setCreatedStudentDbId: (state, action: PayloadAction<number | null>) => {
      state.createdStudentDbId = action.payload;
    },

    updateSchool: (state, action: PayloadAction<Partial<SchoolData>>) => {
      state.school = { ...state.school, ...action.payload };
    },

    updateStudent: (state, action: PayloadAction<Partial<StudentData>>) => {
      state.student = { ...state.student, ...action.payload };
    },

    updateAcademic: (state, action: PayloadAction<Partial<AcademicData>>) => {
      state.academic = { ...state.academic, ...action.payload };
    },

    updateParents: (state, action: PayloadAction<Partial<ParentsData>>) => {
      state.parents = { ...state.parents, ...action.payload };
    },

    resetForm: (state) => {
      state.currentStep        = 1;
      state.createdStudentDbId = null;
      state.school             = initialSchool;
      state.student            = initialStudent;
      state.academic           = initialAcademic;
      state.parents            = initialParents;
    },
  },
});

export const {
  setCurrentStep,
  setCreatedStudentDbId,
  updateSchool,
  updateStudent,
  updateAcademic,
  updateParents,
  resetForm,
} = formSlice.actions;

export default formSlice.reducer; 