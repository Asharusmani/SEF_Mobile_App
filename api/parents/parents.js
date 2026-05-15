// api/parents.js
import axiosInstance from '../axios/index';

/**
 * Maps frontend ParentsData fields → backend snake_case fields
 * and builds a multipart FormData for the /student-parent/create endpoint.
 *
 * Backend model columns (student_parents table):
 *   father_guardian_name, father_guardian_cnic_no, father_guardian_contact,
 *   guardian_relation, guardian_email, guardian_occupation, guardian_qualification,
 *   guardian_cnic_front_photo (file), guardian_cnic_back_photo (file),
 *   mother_name, mother_cnic, mother_cnic_photo_front (file), mother_cnic_back_photo (file)
 *
 * Extra frontend-only fields (no backend column — sent as plain text, ignored by DB):
 *   motherOccupation, motherEducation, motherContact,
 *   guardianName, guardianContact, monthlyIncome
 */
export const buildParentFormData = (parents, studentDbId) => {
  const fd = new FormData();

  // ── Required ────────────────────────────────────────────────────────────────
  fd.append('student_id', String(studentDbId));

  // ── Father / Guardian fields ────────────────────────────────────────────────
  if (parents.fatherName)           fd.append('father_guardian_name',    parents.fatherName);
  if (parents.fatherCnic)           fd.append('father_guardian_cnic_no', parents.fatherCnic);
  if (parents.fatherContact)        fd.append('father_guardian_contact', parents.fatherContact);
  if (parents.guardianRelationship) fd.append('guardian_relation',       parents.guardianRelationship);
  if (parents.fatherEmail)          fd.append('guardian_email',          parents.fatherEmail);
  if (parents.fatherOccupation)     fd.append('guardian_occupation',     parents.fatherOccupation);
  if (parents.fatherQualification)  fd.append('guardian_qualification',  parents.fatherQualification);

  // ── Mother fields ───────────────────────────────────────────────────────────
  if (parents.motherName)           fd.append('mother_name',             parents.motherName);
  if (parents.motherCnic)           fd.append('mother_cnic',             parents.motherCnic);

  // ── Extra fields (no DB column yet — backend ignores them) ──────────────────
  if (parents.motherOccupation)     fd.append('mother_occupation',       parents.motherOccupation);
  if (parents.motherEducation)      fd.append('mother_education',        parents.motherEducation);
  if (parents.motherContact)        fd.append('mother_contact',          parents.motherContact);
  if (parents.guardianName)         fd.append('guardian_name',           parents.guardianName);
  if (parents.guardianContact)      fd.append('guardian_contact',        parents.guardianContact);
  if (parents.monthlyIncome)        fd.append('monthly_income',          String(parents.monthlyIncome));

  // ── File uploads (React Native file objects) ────────────────────────────────
  // Each file object from DocumentUpload should look like:
  //   { uri, name, type }  (standard RN FormData file shape)
  if (parents.fatherCnicFront) {
    fd.append('guardian_cnic_front_photo', {
      uri:  parents.fatherCnicFront.uri,
      name: parents.fatherCnicFront.name || 'father_cnic_front.jpg',
      type: parents.fatherCnicFront.type || 'image/jpeg',
    });
  }
  if (parents.fatherCnicBack) {
    fd.append('guardian_cnic_back_photo', {
      uri:  parents.fatherCnicBack.uri,
      name: parents.fatherCnicBack.name || 'father_cnic_back.jpg',
      type: parents.fatherCnicBack.type || 'image/jpeg',
    });
  }
  if (parents.motherCnicFront) {
    fd.append('mother_cnic_photo_front', {
      uri:  parents.motherCnicFront.uri,
      name: parents.motherCnicFront.name || 'mother_cnic_front.jpg',
      type: parents.motherCnicFront.type || 'image/jpeg',
    });
  }
  if (parents.motherCnicBack) {
    fd.append('mother_cnic_back_photo', {
      uri:  parents.motherCnicBack.uri,
      name: parents.motherCnicBack.name || 'mother_cnic_back.jpg',
      type: parents.motherCnicBack.type || 'image/jpeg',
    });
  }

  return fd;
};

/**
 * POST /student-parent/create
 * Sends multipart/form-data with parent info + optional CNIC images.
 */
export const createParent = async (parents, studentDbId) => {
  const formData = buildParentFormData(parents, studentDbId);

  const response = await axiosInstance.post('/student/parent/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};