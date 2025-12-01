// src/screens/SplashScreen/SplashScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Sử dụng lại màu chủ đạo của app bạn
const COLORS = {
  primary: "#0A2540",
  white: "#FFFFFF",
  secondary: "#00A8E8",
};

const { width } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  // Giá trị Animation
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity bắt đầu là 0
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Scale bắt đầu nhỏ hơn 1 chút

  useEffect(() => {
    // 1. Chạy Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500, // 1.5 giây
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Chuyển hướng sau 3 giây
    const timer = setTimeout(() => {
      // Dùng .replace để người dùng không bấm Back quay lại Splash được
      // Tại đây bạn có thể thêm logic kiểm tra Token để điều hướng thẳng vào Home
      navigation.replace("LoginScreen"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Thay thế URI này bằng Logo của bạn */}
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/5626/5626497.png",
          }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.appName}>MaritimeHub</Text>
        <Text style={styles.tagline}>Kết nối vươn khơi</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by MaritimeHub</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Nền xanh đậm
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    tintColor: COLORS.secondary, // Đổi màu icon sang xanh dương sáng (nếu là icon đơn sắc)
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#B0C4DE", 
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
});

export default SplashScreen;