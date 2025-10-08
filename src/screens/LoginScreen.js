import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [vesselRegNo, setVesselRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // API Base URL
  const API_BASE_URL = "https://marine-bridge.orbitmap.vn/api/v1";
  
  // Google OAuth Config
  const GOOGLE_CLIENT_ID = "1024635096637-k1ovpsiijssgic039v32o728bjjhhonk.apps.googleusercontent.com";

  // Handle regular login
  const handleLogin = async () => {
    if (!vesselRegNo.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter username and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: vesselRegNo,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login success:", data);
        
        // TODO: Save token to AsyncStorage
        // await AsyncStorage.setItem('userToken', data.token);
        
        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home")
          }
        ]);
      } else {
        console.error("❌ Login failed:", data);
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      console.log("🚀 Starting Google Sign-In...");

      // Sử dụng URL cố định để test
      const redirectUri = "https://auth.expo.io/@vinhnguyenhehe/FA25_MB_OnePiece";

      console.log("🔗 Using Redirect URI:", redirectUri);

      // Create Auth Request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: redirectUri,
      });

      console.log("🔧 Auth request created with URI:", redirectUri);

      // Prompt user for authentication
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log("🎯 Auth result type:", result.type);

      if (result.type === 'success') {
        const { code } = result.params;
        console.log("✅ Got authorization code:", code.substring(0, 20) + "...");

        // Log full code và thông tin để test
        console.log("🔧 FULL AUTHORIZATION CODE:", code);
        console.log("🔧 BE SẼ SỬ DỤNG:");
        console.log({
          "code": code,
          "client_id": GOOGLE_CLIENT_ID,
          "client_secret": "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",
          "redirect_uri": redirectUri,
          "grant_type": "authorization_code"
        });

        // Tạm thời bỏ API call để test
        Alert.alert(
          "✅ SUCCESS - Test Complete!",
          `Got authorization code. Check console logs for details.`,
          [
            {
              text: "Go to Home",
              onPress: () => navigation.navigate("Home")
            }
          ]
        );

        // Send code to backend - TẠM THỜI COMMENT ĐỂ TEST
        // await sendCodeToBackend(code);

      } else if (result.type === 'cancel') {
        console.log("⚠️ User cancelled authentication");
        Alert.alert("Cancelled", "Google Sign-In was cancelled");
      } else if (result.type === 'error') {
        console.error("❌ Auth error:", result.error);
        Alert.alert(
          "Authentication Error",
          result.error?.message || "Failed to authenticate with Google"
        );
      } else {
        console.log("⚠️ Unknown result type:", result.type);
        Alert.alert("Error", "An unexpected error occurred");
      }
    } catch (error) {
      console.error("❌ Google Sign-In exception:", error);
      Alert.alert("Error", error.message || "Failed to initiate Google Sign-In");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Send authorization code to backend
  const sendCodeToBackend = async (code) => {
    try {
      console.log("📡 Sending code to backend...");
      
      // Tạo lại redirectUri để log
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });
      
      console.log("🔗 Sending redirect URI to backend:", redirectUri);
      console.log("📋 Authorization Code:", code.substring(0, 20) + "...");

      // Log payload mà backend cần để exchange với Google
      console.log("🔧 BE SẼ SỬ DỤNG:");
      console.log({
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": "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",
        "redirect_uri": redirectUri,
        "grant_type": "authorization_code"
      });

      const response = await fetch(`${API_BASE_URL}/auth/oauth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          isAndroid: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Backend authentication successful:", data);
        
        // TODO: Save token to AsyncStorage
        // await AsyncStorage.setItem('userToken', data.token);
        // await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        Alert.alert(
          "Welcome! 🎉",
          `Successfully signed in with Google`,
          [
            {
              text: "Continue",
              onPress: () => navigation.navigate("Home")
            }
          ]
        );
      } else {
        console.error("❌ Backend error:", data);
        Alert.alert(
          "Authentication Failed",
          data.message || "Failed to authenticate with backend"
        );
      }
    } catch (error) {
      console.error("❌ Backend request error:", error);
      Alert.alert(
        "Network Error",
        "Failed to connect to server. Please check your connection."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to MaritimeHub</Text>
          <Text style={styles.subtitle}>Connect Suppliers and Shipyards</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username or Email"
            placeholderTextColor="#8A9BAD"
            value={vesselRegNo}
            onChangeText={setVesselRegNo}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading && !isGoogleLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8A9BAD"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading && !isGoogleLoading}
          />

          <TouchableOpacity
            style={[styles.button, (isLoading || isGoogleLoading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.googleButton, (isLoading || isGoogleLoading) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#334155" />
            ) : (
              <>
                <AntDesign name="google" size={20} color="#EA4335" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            disabled={isLoading || isGoogleLoading}
          >
            <Text style={styles.registerLink}> Register now</Text>
          </TouchableOpacity>
        </View>

        {/* Test Button */}
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => navigation.navigate("GoogleTest")}
        >
          <Text style={styles.testButtonText}>🧪 Test Google OAuth Manually</Text>
        </TouchableOpacity>
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
  buttonDisabled: {
    opacity: 0.6,
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
  testButton: {
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});