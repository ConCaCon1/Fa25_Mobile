import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GoogleTestScreen = ({ navigation }) => {
  const [inputUrl, setInputUrl] = useState("");
  const [extractedCode, setExtractedCode] = useState("");

  // Google OAuth Config
  const GOOGLE_CLIENT_ID = "1024635096637-k1ovpsiijssgic039v32o728bjjhhonk.apps.googleusercontent.com";
  const GOOGLE_CLIENT_SECRET = "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";
  const REDIRECT_URI = "https://auth.expo.io/@vinhnguyenhehe/FA25_MB_OnePiece";

  const extractCodeFromUrl = (url) => {
    try {
      // Extract code from URL like: https://auth.expo.io/@vinhnguyenhehe/FA25_MB_OnePiece?code=4/0AVGzR1B...
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const code = urlParams.get('code');
      
      if (code) {
        setExtractedCode(code);
        
        // Log thông tin đầy đủ
        console.log("🔧 EXTRACTED CODE:", code);
        console.log("🔧 BE SẼ SỬ DỤNG:");
        const payload = {
          "code": code,
          "client_id": GOOGLE_CLIENT_ID,
          "client_secret": GOOGLE_CLIENT_SECRET,
          "redirect_uri": REDIRECT_URI,
          "grant_type": "authorization_code"
        };
        console.log(payload);

        Alert.alert(
          "✅ Code Extracted Successfully!",
          `Code: ${code.substring(0, 30)}...\n\nCheck console for full payload!`,
          [
            {
              text: "Copy Payload to Clipboard",
              onPress: () => {
                // Có thể copy payload vào clipboard nếu cần
                console.log("📋 COPY THIS PAYLOAD FOR BACKEND TEST:");
                console.log(JSON.stringify(payload, null, 2));
              }
            },
            {
              text: "OK"
            }
          ]
        );
      } else {
        Alert.alert("❌ Error", "No code found in URL");
      }
    } catch (error) {
      Alert.alert("❌ Error", "Invalid URL format");
      console.error("URL parsing error:", error);
    }
  };

  const openGoogleAuth = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid%20profile%20email`;
    
    Alert.alert(
      "🔗 Google OAuth URL",
      "Copy this URL and open in browser:\n\n" + authUrl,
      [
        {
          text: "Copy URL",
          onPress: () => {
            console.log("🔗 GOOGLE AUTH URL:");
            console.log(authUrl);
          }
        },
        {
          text: "OK"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Google OAuth Code Extractor</Text>
        <Text style={styles.subtitle}>Test Google OAuth manually</Text>

        <TouchableOpacity style={styles.button} onPress={openGoogleAuth}>
          <Text style={styles.buttonText}>1. Get Google Auth URL</Text>
        </TouchableOpacity>

        <Text style={styles.label}>2. Paste the redirect URL here:</Text>
        <TextInput
          style={styles.input}
          placeholder="https://auth.expo.io/@vinhnguyenhehe/FA25_MB_OnePiece?code=..."
          value={inputUrl}
          onChangeText={setInputUrl}
          multiline
        />

        <TouchableOpacity 
          style={[styles.button, styles.extractButton]} 
          onPress={() => extractCodeFromUrl(inputUrl)}
        >
          <Text style={styles.buttonText}>3. Extract Code & Generate Payload</Text>
        </TouchableOpacity>

        {extractedCode ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>✅ Extracted Code:</Text>
            <Text style={styles.codeText}>{extractedCode.substring(0, 50)}...</Text>
            <Text style={styles.resultTitle}>📋 Check console for full payload!</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003d66',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A6A7D',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#003d66',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#1C2A3A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#003d66',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  extractButton: {
    backgroundColor: '#10B981',
  },
  backButton: {
    backgroundColor: '#6B7280',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 5,
  },
  codeText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
});

export default GoogleTestScreen;
