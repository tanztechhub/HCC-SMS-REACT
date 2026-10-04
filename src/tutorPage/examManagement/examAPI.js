// Exam API Service - Centralized API calls for exam management
const API_URL = import.meta.env.VITE_API_URL;

// Get user data from localStorage
const getUserData = () => JSON.parse(localStorage.getItem('user'));

const examAPI = {
  // ==================== EXAM ENDPOINTS ====================

  // Fetch all exams for current tutor
  getAllExams: async () => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams`, {
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
        'name': `${userData.firstName} ${userData.lastName}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch exams');
    return response.json();
  },

  // Fetch exam by ID
  getExamById: async (examId) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/${examId}`, {
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch exam');
    return response.json();
  },

  // Fetch exams for a specific course
  getExamsByCourse: async (courseId) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch exams');
    return response.json();
  },

  // Create new exam
  createExam: async (examData) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
        'name': `${userData.firstName} ${userData.lastName}`,
      },
      body: JSON.stringify(examData),
    });

    if (!response.ok) throw new Error('Failed to create exam');
    return response.json();
  },

  // Update exam
  updateExam: async (examId, examData) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/${examId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
      body: JSON.stringify(examData),
    });

    if (!response.ok) throw new Error('Failed to update exam');
    return response.json();
  },

  // Delete exam
  deleteExam: async (examId) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/${examId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
    });

    if (!response.ok) throw new Error('Failed to delete exam');
    return response.json();
  },

  // ==================== QUESTION ENDPOINTS ====================

  // Add question to exam
  addQuestion: async (examId, questionData) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/${examId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) throw new Error('Failed to add question');
    return response.json();
  },

  // Update question in exam
  updateQuestion: async (examId, questionId, questionData) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/${examId}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  },

  // Delete question from exam
  deleteQuestion: async (examId, questionId) => {
    const userData = getUserData();
    if (!userData || !userData.token) throw new Error('User not authenticated');

    const response = await fetch(`${API_URL}/exams/${examId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userData.token}`,
        'tutorid': userData.id,
      },
    });

    if (!response.ok) throw new Error('Failed to delete question');
    return response.json();
  },
};

export default examAPI;
