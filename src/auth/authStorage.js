import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "accessToken"; 
const ROLE_KEY = "userRole";
const USERNAME_KEY = "userUsername"; 
const EMAIL_KEY = "userEmail";       


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


export const saveRole = async (role) => {
  try {
    await AsyncStorage.setItem(ROLE_KEY, role);
  } catch (error) {
    console.error("❌ Error saving role:", error);
  }
};

export const getRole = async () => {
  try {
    return await AsyncStorage.getItem(ROLE_KEY);
  } catch (error) {
    console.error("❌ Error getting role:", error);
    return null;
  }
};

export const clearRole = async () => {
  try {
    await AsyncStorage.removeItem(ROLE_KEY);
  } catch (error) {
    console.error("❌ Error clearing role:", error);
  }
};



export const saveUsername = async (username) => {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
  } catch (error) {
    console.error("❌ Error saving username:", error);
  }
};

export const getUsername = async () => {
  try {
    return await AsyncStorage.getItem(USERNAME_KEY);
  } catch (error) {
    console.error("❌ Error getting username:", error);
    return null;
  }
};

export const saveEmail = async (email) => {
  try {
    await AsyncStorage.setItem(EMAIL_KEY, email);
  } catch (error) {
    console.error("❌ Error saving email:", error);
  }
};

export const getEmail = async () => {
  try {
    return await AsyncStorage.getItem(EMAIL_KEY);
  } catch (error) {
    console.error("❌ Error getting email:", error);
    return null;
  }
};


export const getUserData = async () => {
  try {
    const role = await AsyncStorage.getItem(ROLE_KEY);
    const username = await AsyncStorage.getItem(USERNAME_KEY);
    const email = await AsyncStorage.getItem(EMAIL_KEY);
    return { role, username, email };
  } catch (error) {
    console.error("❌ Error getting user data:", error);
    return { role: null, username: null, email: null };
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, USERNAME_KEY, EMAIL_KEY]);
  } catch (error) {
    console.error("❌ Error clearing all data:", error);
  }
};