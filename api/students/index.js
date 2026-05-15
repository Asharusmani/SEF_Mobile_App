// api/students/index.js
import apiClient from '../axios';

// ─────────────────────────────────────────────────────────────────────────────
// Student routes:
// POST   /api/student/addStudents
// GET    /api/student/getAllStudent
// GET    /api/student/getStudentById/:id
// PUT    /api/student/students/:id
// DELETE /api/student/deleteStudent/:id
// PATCH  /api/student/transferStudents/:id
//
// Academic routes:
// POST   /api/student/academic/create
// GET    /api/student/academic/getAll
// PUT    /api/student/academic/update/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create student — POST /api/student/addStudents
 * multipart/form-data — photo 'files' key mein
 * Returns: { success, message, data: { id, student_id, ... } }
 */
export const createStudent = async (studentData, photoFile = null) => {
  const formData = new FormData();

  Object.entries(studentData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, String(value));
    }
  });

  if (photoFile) {
    formData.append('files', {
      uri:  photoFile.uri,
      type: photoFile.mimeType || 'image/jpeg',
      name: photoFile.fileName || 'photo.jpg',
    });
  }

  const response = await apiClient.post('/student/addStudents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Create academic record — POST /api/student/academic/create
 * JSON body — student_id (DB integer id) required
 *
 * @param {object} academicPayload  — buildAcademicPayload ka output
 */
export const createAcademic = async (academicPayload) => {
  const response = await apiClient.post('/student/academic/create', academicPayload);
  return response.data;
};

/**
 * Get all students — GET /api/student/getAllStudent
 */
// api/students/index.js

export const getAllStudents = async (schoolCode = null, params = {}) => {
  // schoolCode hai to filtered, nahi hai to sab
  const url = schoolCode 
    ? `/student/getAllStudent/${schoolCode}`
    : `/student/getAllStudent/all`;  // yeh backend mein nahi hai

  const response = await apiClient.get(url, { params });
  return response.data;
};

/**
 * Get student by ID — GET /api/student/getStudentById/:id
 */
export const getStudentById = async (id) => {
  const response = await apiClient.get(`/student/getStudentById/${id}`);
  return response.data.data;
};

/**
 * Update student — PUT /api/student/students/:id
 */
export const updateStudent = async (id, studentData) => {
  const response = await apiClient.put(`/student/students/${id}`, studentData);
  return response.data;
};

/**
 * Delete student — DELETE /api/student/deleteStudent/:id
 */
export const deleteStudent = async (id) => {
  const response = await apiClient.delete(`/student/deleteStudent/${id}`);
  return response.data;
};

/**
 * Transfer student — PATCH /api/student/transferStudents/:id
 */
export const transferStudent = async (id, data) => {
  const response = await apiClient.patch(`/student/transferStudents/${id}`, data);
  return response.data;
};