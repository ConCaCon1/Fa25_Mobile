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

const BookingSuccessScreen = ({ navigation, route }) => {
  const { bookingId, message, totalAmount } = route.params || {};
  
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Ionicons name="checkmark-circle" size={100} color="#00C851" />
        </Animated.View>
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>Cảm ơn bạn đã sử dụng dịch vụ</Text>
      </View>

      <View style={styles.receiptCard}>
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
          <Text style={styles.value}>{new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái</Text>
          <Text style={[styles.value, { color: '#00C851' }]} numberOfLines={2}>
             {message || "Đã thanh toán"}
          </Text>
        </View>

        {totalAmount && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryBtn]} 
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.secondaryButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BookingSuccessScreen;

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
    color: "#1C2A3A", 
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: "#8898AA",
    marginTop: 5,
  },
  receiptCard: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  label: {
    fontSize: 15,
    color: "#8898AA",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    color: "#1C2A3A",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E7EB",
    width: "100%",
  },
  totalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E4E7EB",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#8898AA",
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 28,
    color: "#00C851",
    fontWeight: "bold",
  },
  footer: {
    width: width * 0.9,
    marginTop: 40,
    gap: 12, 
  },
  button: {
    backgroundColor: "#1C2A3A",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#1C2A3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1C2A3A",
    elevation: 0, 
    shadowOpacity: 0,
  },
  secondaryButtonText: {
    color: "#1C2A3A",
    fontSize: 16,
    fontWeight: "700",
  }
});