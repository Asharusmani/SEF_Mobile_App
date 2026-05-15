// ─────────────────────────────────────────────────────────────────────────────
// academicData.js
//
// Backend field mapping (StudentAcademic model → student_academics table):
//
// student_id           → INTEGER  — student ka DB id (addStudents response se)
// admitclass           → STRING   — class admitted
// current_class        → STRING   — current class
// section              → STRING   — section (A/B/C...)
// shift                → STRING   — Morning / Evening
// medium_of_instruction→ STRING   — Sindhi / Urdu / English
// status               → STRING   — New Admission / Promoted / etc
// date_of_admission    → STRING   — DD-MM-YYYY
// academic_year        → STRING   — 2024-25 etc
// last_school_type     → STRING   — SEF / NON-SEF
// last_school_student_id→STRING   — agar SEF ho to
// last_school_name     → STRING   — agar NON-SEF ho to
// last_class_attended  → STRING   — agar NON-SEF ho to
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_ACADEMIC_DATA = {
  admissionDate:        '',   // display: DD/MM/YYYY
  academicYear:         '',
  classAdmitted:        '',
  currentClass:         '',
  section:              '',
  shift:                '',
  mediumOfInstruction:  '',
  studentStatus:        '',
  lastSchoolType:       '',
  lastSchoolStudentId:  '',
  lastSchoolName:       '',
  lastClassAttended:    '',
  birthCertificate:     null,
  transferCertificate:  null,
};

/**
 * DD/MM/YYYY → DD-MM-YYYY
 */
const convertDate = (dateStr) => {
  if (!dateStr) return undefined;
  return dateStr.replace(/\//g, '-');
};

/**
 * buildAcademicPayload
 *
 * AcademicForm state → backend-ready payload
 * student_id parent se pass hoga (addStudents response ka id)
 *
 * @param {typeof INITIAL_ACADEMIC_DATA} data
 * @param {number|string} studentDbId  — DB id from createStudent response
 */
export const buildAcademicPayload = (data, studentDbId) => {
  const payload = {
    student_id:            studentDbId,
    admitclass:            data.classAdmitted        || undefined,
    current_class:         data.currentClass         || undefined,
    section:               data.section              || undefined,
    shift:                 data.shift                || undefined,
    medium_of_instruction: data.mediumOfInstruction  || undefined,
    status:                data.studentStatus        || undefined,
    date_of_admission:     data.admissionDate_backend || convertDate(data.admissionDate) || undefined,
    academic_year:         data.academicYear         || undefined,
    last_school_type:      data.lastSchoolType       || undefined,
  };

  // Conditional fields
  if (data.lastSchoolType === 'SEF') {
    payload.last_school_student_id = data.lastSchoolStudentId || undefined;
  }

  if (data.lastSchoolType === 'NON-SEF') {
    payload.last_school_name    = data.lastSchoolName    || undefined;
    payload.last_class_attended = data.lastClassAttended || undefined;
  }

  return payload;
};