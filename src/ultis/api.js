import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

/**
 * @param {string} endpoint - đường dẫn API, ví dụ: /boatyards
 * @param {object} options - fetch options (method, body, headers,...)
 * @returns {Promise<object>} - dữ liệu JSON trả về
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn("❌ API Error:", response.status, response.statusText);
      throw new Error(`API error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("🚨 fetchWithAuth error:", error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint) => fetchWithAuth(endpoint, { method: "GET" });

/**
 * POST request
 */
export const apiPost = (endpoint, body) =>
  fetchWithAuth(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

/**
 * PUT request
 */
export const apiPut = (endpoint, body) =>
  fetchWithAuth(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });

/**
 * DELETE request
 */
export const apiDelete = (endpoint) =>
  fetchWithAuth(endpoint, { method: "DELETE" });
