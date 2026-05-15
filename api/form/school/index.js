// api/form/school/index.js
import apiClient from '../../axios';

// POST /school/createSchool
export const createSchool = async (data) => {
  const response = await apiClient.post('/school/createSchool', data);
  return response.data;
};

// GET /school/getAllSchools
export const getAllSchools = async ({ page = 1, limit = 10, district, schoolLevel, schoolShift } = {}) => {
  const params = { page, limit };
  if (district)    params.district    = district;
  if (schoolLevel) params.schoolLevel = schoolLevel;
  if (schoolShift) params.schoolShift = schoolShift;
  const response = await apiClient.get('/school/getAllSchools', { params });
  return response.data;
};

// GET /school/getSchoolById/:id  (matches by school_code in service)
export const getSchoolById = async (id) => {
  const response = await apiClient.get(`/school/getSchoolById/${id}`);
  return response.data.data;
};

// PUT /school/update/:id
export const updateSchool = async (id, data) => {
  const response = await apiClient.put(`/school/update/${id}`, data);
  return response.data;
};

// DELETE /school/delete/:id
export const deleteSchool = async (id) => {
  const response = await apiClient.delete(`/school/delete/${id}`);
  return response.data;
};