import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { WebView } from "react-native-webview";

const CheckoutScreen = ({ route, navigation }) => {
  const { data } = route.params;
  const [showWebView, setShowWebView] = useState(false);
  const [loadingWeb, setLoadingWeb] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Thanh toán đơn hàng</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>{data.orderCode}</Text>

          <Text style={styles.label}>Số tiền:</Text>
          <Text style={styles.price}>{data.amount.toLocaleString()} VND</Text>

          <Text style={styles.label}>Nội dung thanh toán:</Text>
          <Text style={styles.value}>{data.description}</Text>
        </View>

        <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
        <View style={styles.qrWrapper}>
          <QRCode value={data.qrCode} size={220} />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowWebView(true)}
        >
          <Text style={styles.buttonText}>Mở trang thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showWebView} animationType="slide">
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          {loadingWeb && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0288d1" />
              <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
            </View>
          )}

          <WebView
            source={{ uri: data.checkoutUrl }}
            onLoadStart={() => setLoadingWeb(true)}
            onLoadEnd={() => setLoadingWeb(false)}
            onNavigationStateChange={(navState) => {
              if (navState.url.includes("success")) {
                setShowWebView(false);
                navigation.replace("OrderSuccessScreen", { orderData: data });
              }
            }}
            style={{ flex: 1 }}
          />

       

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Alert.alert(
                  "Hủy thanh toán",
                  "Bạn có chắc chắn muốn hủy thanh toán đơn hàng này?",
                  [
                    { text: "Không", style: "cancel" },
                    {
                      text: "Hủy thanh toán",
                      style: "destructive",
                      onPress: () => {
                        setShowWebView(false);
                        navigation.replace("OrderFailScreen", {
                          orderData: data,
                          reason: "Người dùng đã hủy thanh toán",
                        });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text style={styles.cancelButtonText}>Hủy thanh toán</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f3f3f3",
    marginBottom: 20,
  },
  label: { fontWeight: "bold", fontSize: 16, marginTop: 10 },
  value: { fontSize: 16, color: "#333" },
  price: { fontSize: 20, color: "#e53935", fontWeight: "bold" },
  qrTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  qrWrapper: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    elevation: 3,
  },
  button: {
    backgroundColor: "#0288d1",
    padding: 15,
    width: "100%",
    borderRadius: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 18 },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 10,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#333" },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  closeText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  bottomBar: {
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  cancelButton: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});