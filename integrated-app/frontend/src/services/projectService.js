import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Get all projects
export const getAllProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/projects/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Get project by ID
export const getProjectById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/projects/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw error;
  }
};

// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await axios.post(`${API_URL}/api/projects/add/`, projectData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Update an existing project
export const updateProject = async (id, projectData) => {
  try {
    const response = await axios.put(`${API_URL}/api/projects/${id}/update/`, projectData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw error;
  }
};

// Get project contributions
export const getProjectContributions = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/api/projects/${projectId}/contributions/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching contributions for project ${projectId}:`, error);
    throw error;
  }
};

// Publish a project
export const publishProject = async (projectId) => {
  try {
    const response = await axios.put(`${API_URL}/api/projects/${projectId}/publish/`);
    return response.data;
  } catch (error) {
    console.error(`Error publishing project ${projectId}:`, error);
    throw error;
  }
};

// Get token price
export const getTokenPrice = async (tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/api/token/price/?token_address=${tokenAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
};

// Validate token
export const validateToken = async (tokenAddress) => {
  try {
    const response = await axios.post(`${API_URL}/api/token/validate/`, { token_address: tokenAddress });
    return response.data;
  } catch (error) {
    console.error('Error validating token:', error);
    throw error;
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  getProjectContributions,
  publishProject,
  getTokenPrice,
  validateToken
}; 