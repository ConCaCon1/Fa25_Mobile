import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [vesselRegNo, setVesselRegNo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login:", vesselRegNo, password);
    navigation.navigate("Home");
  };

  const handleGoogleSignIn = async () => {
    console.log('🚀 BẮT ĐẦU Google Sign-In...');
    
    const clientIdWeb = '1024635096637-k1ovpsiijssgic039v32o728bjjhhonk.apps.googleusercontent.com';
    const redirectUri = 'https://auth.expo.io/@anonymous/FA25_MB_OnePiece';
    const scope = 'openid profile email';
    const state = 'random_state_' + Math.random().toString(36).substring(7);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientIdWeb}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline`;
    
    console.log('🌐 Auth URL:', authUrl);
    
    try {
      const canOpen = await Linking.canOpenURL(authUrl);
      console.log('✅ Can open:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(authUrl);
        console.log('✅ Browser opened!');
        
        Alert.alert(
          'Google Sign-In',
          'Browser opened! Copy URL after login and paste here.',
          [
            {
              text: 'Paste URL',
              onPress: () => {
                Alert.prompt('Paste URL', 'Paste the redirect URL:', (url) => {
                  if (url && url.includes('code=')) {
                    const code = new URLSearchParams(url.split('?')[1]).get('code');
                    console.log('');
                    console.log('🎯🎯🎯 THÔNG TIN CHO BACKEND 🎯🎯🎯');
                    console.log('📋 Authorization Code:', code);
                    console.log('🔧 Client ID Web:', clientIdWeb);
                    console.log('🔗 Redirect URI:', redirectUri);
                    console.log('');
                    console.log('📡 DATA GỬI CHO BE:');
                    console.log(`{
  "code": "${code}",
  "isAndroid": false
}`);
                    console.log('');
                    console.log('🔧 BE SẼ SỬ DỤNG:');
                    console.log(`{
  "code": "${code}",
  "client_id": "${clientIdWeb}",
  "client_secret": "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",
  "redirect_uri": "${redirectUri}",
  "grant_type": "authorization_code"
}`);
                    console.log('🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯');
                    
                    Alert.alert('Success!', `Code: ${code}`);
                    navigation.navigate("Home");
                  } else {
                    Alert.alert('Error', 'URL không chứa code');
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Cannot open browser');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message);
    }
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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={() => {
              console.log('🔥 Google Sign-In button CLICKED!');
              handleGoogleSignIn();
            }}
          >
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
    fontSize: 12,
  },
  googleButton: {
    backgroundColor: "#4285f4",
    width: "100%",
    height: 48,
    marginBottom: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  googleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    color: "#fff",
    fontSize: 12,
  },
});
