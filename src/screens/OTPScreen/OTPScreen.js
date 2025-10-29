import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "@env";

const OTPScreen = ({ route, navigation }) => {
  const { fullName, username, email, password, address, phoneNumber, avatarUri } = route.params;
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otpDigits];
      newOtp[index] = text;
      setOtpDigits(newOtp);
      // tự động focus sang ô tiếp theo
      if (index < 3) inputRefs.current[index + 1].focus();
    } else if (text === "") {
      const newOtp = [...otpDigits];
      newOtp[index] = "";
      setOtpDigits(newOtp);
    }
  };

  const handleCreateAccount = async () => {
    const otp = otpDigits.join("");

    if (otp.length < 4) {
      Alert.alert("Missing OTP", "Please enter the full 4-digit OTP code.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("FullName", fullName);
    formData.append("Username", username);
    formData.append("Email", email);
    formData.append("Password", password);
    formData.append("Address", address);
    formData.append("PhoneNumber", phoneNumber);
    formData.append("Otp", otp);

    if (avatarUri) {
      const filename = avatarUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append("Avatar", { uri: avatarUri, name: filename, type });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
        ]);
      } else {
        Alert.alert("Failed", data.message || "Something went wrong.");
      }
    } catch (e) {
      console.error("Register error:", e);
      Alert.alert("Error", "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP Code</Text>

      <View style={styles.otpContainer}>
        {otpDigits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && otpDigits[index] === "" && index > 0) {
                inputRefs.current[index - 1].focus();
              }
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateAccount}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F0F4F8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003d66",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: "#003d66",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#003d66",
    borderRadius: 10,
    height: 50,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
