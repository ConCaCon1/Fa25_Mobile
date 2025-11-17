import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "accessToken"; 
const ROLE_KEY = "userRole";

export const saveRole = async (role) => {
  await AsyncStorage.setItem(ROLE_KEY, role);
};

export const getRole = async () => {
  return await AsyncStorage.getItem(ROLE_KEY);
};

export const clearRole = async () => {
  await AsyncStorage.removeItem(ROLE_KEY);
};

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("❌ Error saving token:", error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("❌ Error getting token:", error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("❌ Error clearing token:", error);
  }
};
