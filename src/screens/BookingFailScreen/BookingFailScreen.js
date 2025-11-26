import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const BookingFailScreen = ({ navigation, route }) => {
  const { message, bookingId } = route.params || {};
  
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Ionicons name="close-circle" size={100} color="#FF3B30" />
        </Animated.View>
        <Text style={styles.title}>Thanh toán thất bại</Text>
        <Text style={styles.subtitle}>Giao dịch đã bị hủy hoặc xảy ra lỗi</Text>
      </View>

      <View style={styles.failCard}>
        {bookingId && (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Mã đơn hàng</Text>
              <Text style={styles.value}>#{bookingId}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Thời gian</Text>
          <Text style={styles.value}>
            {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Lý do</Text>
          <Text style={[styles.value, { color: '#FF3B30' }]} numberOfLines={3} ellipsizeMode="tail">
            {message || "Không xác định"}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={() => navigation.goBack()} 
        >
          <Text style={styles.buttonText}>Thử thanh toán lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.homeButton]}
          onPress={() => navigation.popToTop()} 
        >
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BookingFailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FF3B30", // Màu đỏ cảnh báo
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: "#8898AA",
    marginTop: 5,
    textAlign: 'center',
  },
  failCard: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    // Shadow effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Căn lề trên để text dài không bị lệch xấu
    marginVertical: 12,
  },
  label: {
    fontSize: 15,
    color: "#8898AA",
    fontWeight: "500",
    marginTop: 2, // Căn chỉnh nhỏ với text bên phải
  },
  value: {
    fontSize: 15,
    color: "#1C2A3A",
    fontWeight: "600",
    maxWidth: "65%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E7EB",
    width: "100%",
  },
  footer: {
    width: width * 0.9,
    marginTop: 40,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  retryButton: {
    backgroundColor: "#FF3B30", // Nút đỏ để thử lại
  },
  homeButton: {
    backgroundColor: "#1C2A3A", // Nút tối màu về trang chủ
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});