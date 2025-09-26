// src/lib/constants.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  TALUKA_OFFICER: 'talukaOfficer',
  DISTRICT_OFFICER: 'districtOfficer'
};