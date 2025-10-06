import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Image,
  Platform,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [avatarUri, setAvatarUri] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); 
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderAnims = {
    fullName: new Animated.Value(0),
    username: new Animated.Value(0),
    email: new Animated.Value(0),
    phone: new Animated.Value(0),
    address: new Animated.Value(0),
    password: new Animated.Value(0),
    confirmPassword: new Animated.Value(0),
  };

  const animateBorder = (anim, toValue) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = (field) => {
    setFocusedInput(field);
    animateBorder(borderAnims[field], 1);
  };

  const handleInputBlur = (field) => {
    setFocusedInput(null);
    animateBorder(borderAnims[field], 0);
  };

  const getBorderColor = (anim) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#E2E8F0", "#003d66"],
    });

  const getIconColor = (field) =>
    focusedInput === field ? "#003d66" : "#8A9BAD";

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Need permission to access gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

const handleNext = async () => {
  if (!fullName || !username || !email || !password || !address || !phoneNumber) {
    Alert.alert("Validation Error", "Please fill in all required fields.");
    return;
  }
  if (password !== confirmPassword) {
    Alert.alert("Validation Error", "Passwords do not match.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("https://marine-bridge.orbitmap.vn/api/v1/auth/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert("OTP Sent", "Please check your email for the OTP code.");
      navigation.navigate("OTPScreen", {
        fullName,
        username,
        email,
        password,
        confirmPassword,
        address,
        phoneNumber,
        avatarUri,
      });
    } else {
      Alert.alert("Failed to send OTP", data.message || "Please try again later.");
    }
  } catch (error) {
    console.error("OTP Error:", error);
    Alert.alert("Error", "Could not connect to the server.");
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#003d66" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
              {avatarUri ? (
                <>
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  <View style={styles.editAvatarOverlay}>
                    <MaterialCommunityIcons name="camera-outline" size={24} color="#FFFFFF" />
                  </View>
                </>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="plus" size={40} color="#5A6A7D" />
                  <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/** Input fields */}
          {[
            { key: "fullName", icon: "account-outline", placeholder: "Full Name", value: fullName, setter: setFullName },
            { key: "username", icon: "account-circle-outline", placeholder: "Username", value: username, setter: setUsername },
            { key: "email", icon: "email-outline", placeholder: "Email", value: email, setter: setEmail, keyboard: "email-address" },
            { key: "phone", icon: "phone-outline", placeholder: "Phone Number", value: phoneNumber, setter: setPhoneNumber, keyboard: "phone-pad" },
            { key: "address", icon: "map-marker-outline", placeholder: "Address", value: address, setter: setAddress },
          ].map((field) => (
            <Animated.View
              key={field.key}
              style={[styles.inputContainer, { borderColor: getBorderColor(borderAnims[field.key]) }]}
            >
              <MaterialCommunityIcons
                name={field.icon}
                size={20}
                color={getIconColor(field.key)}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                value={field.value}
                onChangeText={field.setter}
                onFocus={() => handleInputFocus(field.key)}
                onBlur={() => handleInputBlur(field.key)}
                keyboardType={field.keyboard}
                autoCapitalize="none"
              />
            </Animated.View>
          ))}

          {/* Password */}
          <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor(borderAnims.password) }]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={getIconColor("password")} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              onFocus={() => handleInputFocus("password")}
              onBlur={() => handleInputBlur("password")}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <MaterialCommunityIcons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#8A9BAD"
                style={styles.visibilityIcon}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Confirm password */}
          <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor(borderAnims.confirmPassword) }]}>
            <MaterialCommunityIcons name="lock-check-outline" size={20} color={getIconColor("confirmPassword")} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!isPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => handleInputFocus("confirmPassword")}
              onBlur={() => handleInputBlur("confirmPassword")}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <MaterialCommunityIcons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#8A9BAD"
                style={styles.visibilityIcon}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* 👉 Nút Next */}
          <TouchableOpacity style={[styles.registerButton, loading && styles.buttonDisabled]} onPress={handleNext} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Next</Text>}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#003d66' },
  scrollViewContent: { paddingHorizontal: 24, paddingVertical: 20 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 5,
  },
  avatar: {
    width: 126,
    height: 126,
    borderRadius: 63,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    backgroundColor: '#E9EFF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#5A6A7D',
    fontWeight: '500',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#003d66',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 16,
    height: 54, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1,
  },
  inputIcon: { paddingLeft: 15, paddingRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1C2A3A', height: '100%' },
  visibilityIcon: { paddingHorizontal: 15 },
  registerButton: {
    backgroundColor: '#003d66', height: 54, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    elevation: 5, shadowColor: '#003d66', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 5,
  },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: '#5A6A7D',
    fontSize: 14,
  },
  loginLink: {
    color: '#003d66',
    fontWeight: 'bold',
    fontSize: 14,
  },
});