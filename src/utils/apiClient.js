const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Adjust your base URL

const getAuthHeaders = () => {
    const user = localStorage.getItem("user"); 
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
        adminId: user.id,
    };
};

export const apiGet = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const apiPatch = async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};