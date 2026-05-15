// ─────────────────────────────────────────────────────────────────────────────
// studentData.js
//
// Backend field mapping (Student model):
//
// gr_no                         → GR Number
// name_of_student               → Student Full Name
// student_dob                   → DD-MM-YYYY  (backend format)
// gender                        → "Male" | "Female"
// religion                      → "Islam" | "Christianity" | "Hinduism" | "Other"
// village                       → Village/Area
// mother_tongue                 → Mother Tongue
// blood_group                   → Blood Group
// refugee_student               → "Yes" | "No"
// disability                    → "Yes" | "No"
// seeing_difficulty             → "Yes" | "No"
// hearing_difficulty            → "Yes" | "No"
// walking_difficulty            → "Yes" | "No"
// remembering_or_concentrating  → "Yes" | "No"
// speech_disorder               → "Yes" | "No"
// self_care                     → "Yes" | "No"
// bform_no                      → XXXXX-XXXXXXX-X
// residential_address           → Address
// emergency_contact             → 11 digits, no dash (03XXXXXXXXX)
// school_code                   → parent screen se aata hai
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_STUDENT_DATA = {
  sno:             '',
  student_id:      '',
  school_code:     '',
  gr_no:           '',
  bform_no:        '',
  name_of_student: '',
  student_dob:         '',   // display: DD/MM/YYYY (form mein dikhta hai)
  student_dob_backend: '',   // submit: DD-MM-YYYY  (backend ko jaata hai)
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

/**
 * buildStudentPayload
 *
 * Form state se clean backend payload banata hai.
 * - undefined fields skip hote hain (Sequelize optional fields ke liye)
 * - student_dob_backend → student_dob (backend format DD-MM-YYYY)
 * - profilePhoto payload mein nahi hota (alag multipart field hota hai)
 *
 * @param {typeof INITIAL_STUDENT_DATA & { school_code: string }} data
 * @returns {object} Backend-ready payload
 */
export const buildStudentPayload = (data) => {
  const payload = {
    // student_id = gr_no + sno merge (e.g. "122123")
    student_id:      `${data.gr_no || ''}${data.sno || ''}`,
    school_code:     data.school_code,
    gr_no:           data.gr_no,
    name_of_student: data.name_of_student,

    // student_dob_backend DD-MM-YYYY format mein hona chahiye
    // Agar kisi wajah se empty ho to student_dob (display) fallback use karo
    student_dob: data.student_dob_backend || convertDateForBackend(data.student_dob) || undefined,

    gender:   data.gender   || undefined,
    religion: data.religion || undefined,

    // Optional string fields — empty string nahi bhejna
    bform_no:            data.bform_no            || undefined,
    village:             data.village             || undefined,
    mother_tongue:       data.mother_tongue       || undefined,
    blood_group:         data.blood_group         || undefined,
    residential_address: data.residential_address || undefined,

    // Emergency contact: 11 raw digits
    emergency_contact: data.emergency_contact || undefined,

    // Yes/No ENUM fields — default 'No'
    refugee_student:              data.refugee_student              || 'No',
    disability:                   data.disability                   || 'No',
    seeing_difficulty:            data.seeing_difficulty            || 'No',
    hearing_difficulty:           data.hearing_difficulty           || 'No',
    walking_difficulty:           data.walking_difficulty           || 'No',
    remembering_or_concentrating: data.remembering_or_concentrating || 'No',
    speech_disorder:              data.speech_disorder              || 'No',
    self_care:                    data.self_care                    || 'No',
  };

  // sno sirf tab include karo jab value ho
  if (data.sno) payload.sno = data.sno;

  return payload;
};

/**
 * DD/MM/YYYY (CustomDatePicker display format)
 * → DD-MM-YYYY (backend expected format)
 */
export const convertDateForBackend = (dateStr) => {
  if (!dateStr) return '';
  // DD/MM/YYYY → DD-MM-YYYY
  return dateStr.replace(/\//g, '-');
};