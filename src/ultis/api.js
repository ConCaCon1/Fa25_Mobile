import { getToken } from "../auth/authStorage";
import { API_BASE_URL } from "@env";

export const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const token = await getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    console.log("📡 Fetching:", `${API_BASE_URL}${endpoint}`);
    console.log("🪪 Headers:", headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn("❌ API Error:", response.status, response.statusText);
      throw new Error(`API error ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("🚨 fetchWithAuth error:", error);
    throw error;
  }
};

export const apiGet = (endpoint) =>
  fetchWithAuth(endpoint, { method: "GET" });

export const apiPost = (endpoint, body) =>
  fetchWithAuth(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPut = (endpoint, body) =>
  fetchWithAuth(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const apiPatch = (endpoint, body) =>
  fetchWithAuth(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiDelete = (endpoint) =>
  fetchWithAuth(endpoint, { method: "DELETE" });
