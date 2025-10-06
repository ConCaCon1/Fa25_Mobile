import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  StatusBar, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [vesselRegNo, setVesselRegNo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "https://marine-bridge.orbitmap.vn/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usernameOrEmail: vesselRegNo,
            password: password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Login success:", data);
        navigation.navigate("Home");
      } else {
        const errorData = await response.json();
        Alert.alert("Login Failed", errorData.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("🚀 BẮT ĐẦU Google Sign-In...");

    const clientIdWeb =
      "1024635096637-k1ovpsiijssgic039v32o728bjjhhonk.apps.googleusercontent.com";
    const redirectUri = "https://auth.expo.io/@anonymous/FA25_MB_OnePiece";
    const scope = "openid profile email";
    const state = "random_state_" + Math.random().toString(36).substring(7);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientIdWeb}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(
      scope
    )}&state=${state}&access_type=offline`;

    console.log("🌐 Auth URL:", authUrl);

    try {
      const canOpen = await Linking.canOpenURL(authUrl);
      console.log("✅ Can open:", canOpen);

      if (canOpen) {
        await Linking.openURL(authUrl);
        console.log("✅ Browser opened!");

        Alert.alert(
          "Google Sign-In",
          "Browser opened! Copy URL after login and paste here.",
          [
            {
              text: "Paste URL",
              onPress: () => {
                Alert.prompt("Paste URL", "Paste the redirect URL:", (url) => {
                  if (url && url.includes("code=")) {
                    const code = new URLSearchParams(url.split("?")[1]).get(
                      "code"
                    );
                    console.log("");
                    console.log("🎯🎯🎯 THÔNG TIN CHO BACKEND 🎯🎯🎯");
                    console.log("📋 Authorization Code:", code);
                    console.log("🔧 Client ID Web:", clientIdWeb);
                    console.log("🔗 Redirect URI:", redirectUri);
                    console.log("");
                    console.log("📡 DATA GỬI CHO BE:");
                    console.log(`{
  "code": "${code}",
  "isAndroid": false
}`);
                    console.log("");
                    console.log("🔧 BE SẼ SỬ DỤNG:");
                    console.log(`{
  "code": "${code}",
  "client_id": "${clientIdWeb}",
  "client_secret": "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",
  "redirect_uri": "${redirectUri}",
  "grant_type": "authorization_code"
}`);
                    console.log("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯");

                    Alert.alert("Success!", `Code: ${code}`);
                    navigation.navigate("Home");
                  } else {
                    Alert.alert("Error", "URL không chứa code");
                  }
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Cannot open browser");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.title}>Welcome to MaritimeHub</Text>
            <Text style={styles.subtitle}>Connect Suppliers and Shipyards</Text>
        </View>

        <View style={styles.form}>
            <TextInput
            style={styles.input}
            placeholder="Username or Email"
            placeholderTextColor="#8A9BAD"
            value={vesselRegNo}
            onChangeText={setVesselRegNo}
            keyboardType="email-address"
            autoCapitalize="none"
            />

            <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8A9BAD"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
                console.log("🔥 Google Sign-In button CLICKED!");
                handleGoogleSignIn();
            }}
            >
              <AntDesign name="google" size={20} color="" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}> Register now</Text>
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
      width: 80,
      height: 80,
      marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003d66', 
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5A6A7D', 
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#1C2A3A',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#003d66', 
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, 
    shadowColor: '#003d66', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8A9BAD',
    fontSize: 12,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E0',
    borderWidth: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  googleIcon: { 
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: '#5A6A7D',
    fontSize: 14,
  },
  registerLink: {
    color: '#003d66', 
    fontWeight: 'bold',
    fontSize: 14,
  },
});