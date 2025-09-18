import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const LoginScreen = ({ navigation }) => {
  const [vesselRegNo, setVesselRegNo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login:", vesselRegNo, password);
    navigation.navigate("Home");
  };

  return (
    <ImageBackground
      source={{ uri: "https://i.pinimg.com/736x/a7/d8/01/a7d801430b69f32d0622cb4cf7b9f782.jpg" }} 
      style={styles.background}
      blurRadius={3} 
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Maritime Management</Text>
        <Text style={styles.subtitle}>
          Making a difference in Ocean and Maritime 
        </Text>

        <View style={styles.card}>
          <Text style={styles.loginTitle}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={vesselRegNo}
            onChangeText={setVesselRegNo}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={{ color: "#555" }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}> Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>Powered by asm®</Text>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)", 
    width: "100%",
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#003d66",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  registerLink: {
    color: "#003d66",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    color: "#fff",
    fontSize: 12,
  },
});
