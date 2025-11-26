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
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { WebView } from "react-native-webview";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const CheckoutScreen = ({ route, navigation }) => {
  const { data } = route.params;

  const [showWebView, setShowWebView] = useState(false);

  const formatCurrency = (value) => {
    if (!value) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    Clipboard.setString(text.toString());
    Alert.alert("Đã sao chép", `Đã copy ${label}: ${text}`);
  };

  const handleWebViewNavigationStateChange = (navState) => {
    const url = navState.url.toLowerCase();

    if (url.includes("success") || url.includes("status=paid")) {
      setShowWebView(false);
      navigation.replace("OrderSuccessScreen", { orderData: data });
      return;
    }

    if (
      url.includes("cancel") ||
      url.includes("status=cancelled") ||
      url.includes("status=canceled") ||
      url.includes("error") ||
      url.includes("failed")
    ) {
      setShowWebView(false);
      navigation.replace("OrderFailScreen", {
        orderData: data,
        reason: url.includes("cancel")
          ? "Thanh toán bị hủy"
          : "Thanh toán thất bại",
      });
      return;
    }
  };

  const handleFinishManual = () => {
    Alert.alert(
      "Xác nhận",
      "Hệ thống sẽ kiểm tra giao dịch của bạn. Vui lòng đợi trong giây lát.",
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Về trang chủ",
          onPress: () => navigation.popToTop(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Mã đơn hàng:</Text>
            <Text style={styles.value}>#{data.orderCode}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowTotal}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(data.amount)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <TouchableOpacity
          style={[styles.methodCard, styles.methodSelected]}
          activeOpacity={1}
        >
          <View style={styles.methodInfo}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={24}
              color="#003d66"
            />
            <View>
              <Text style={styles.methodName}>Chuyển khoản QR (VietQR)</Text>
              <Text style={styles.methodSub}>
                Quét mã QR để thanh toán nhanh
              </Text>
            </View>
          </View>
          <Ionicons name="radio-button-on" size={22} color="#003d66" />
        </TouchableOpacity>

        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
          <Text style={styles.qrSub}>Sử dụng ứng dụng ngân hàng hoặc MoMo</Text>

          <View style={styles.qrFrame}>
            <QRCode value={data.qrCode} size={200} />
          </View>

          <Text style={styles.expiryText}>Đơn hàng hết hạn sau 15 phút</Text>

          <View style={styles.bankInfoCard}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Ngân hàng (BIN):</Text>
              <Text style={styles.bankValue}>
                MB Bank ({data.bin || "970422"})
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.bankRow}>
              <View>
                <Text style={styles.bankLabel}>Số tài khoản:</Text>
                <Text style={styles.bankValueHighlight}>
                  {data.accountNumber}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(data.accountNumber, "Số tài khoản")
                }
              >
                <Ionicons name="copy-outline" size={20} color="#003d66" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.bankRow}>
              <View>
                <Text style={styles.bankLabel}>Số tiền:</Text>
                <Text style={styles.bankValueHighlight}>
                  {formatCurrency(data.amount)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(data.amount, "Số tiền")}
              >
                <Ionicons name="copy-outline" size={20} color="#003d66" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.bankRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankLabel}>Nội dung CK:</Text>
                <Text style={styles.bankValueHighlight}>
                  {data.description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(data.description, "Nội dung")}
              >
                <Ionicons name="copy-outline" size={20} color="#003d66" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setShowWebView(true)}
          >
            <Text style={styles.linkButtonText}>Mở trang thanh toán PayOS</Text>
            <Ionicons
              name="open-outline"
              size={18}
              color="#003d66"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>

        <TouchableOpacity
          style={[styles.payButton, styles.secondaryButton]}
          onPress={handleFinishManual}
        >
          <Text style={[styles.payButtonText, styles.secondaryButtonText]}>
            Tôi đã thanh toán xong
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#003d66" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Cổng thanh toán</Text>
            <View style={{ width: 28 }} />
          </View>

          <WebView
            source={{ uri: data.checkoutUrl }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#003d66" />
              </View>
            )}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EFF2F7",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  content: { padding: 16, paddingBottom: 40 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#64748B", fontSize: 14 },
  value: { fontWeight: "600", color: "#1E293B", fontSize: 15 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  rowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#334155" },
  totalAmount: { fontSize: 20, fontWeight: "700", color: "#003d66" },

  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  methodSelected: {
    borderColor: "#003d66",
    backgroundColor: "#F0F9FF",
  },
  methodInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  methodName: { fontWeight: "600", color: "#1E293B" },
  methodSub: { fontSize: 12, color: "#64748B" },

  qrContainer: { alignItems: "center", marginTop: 10 },
  qrTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003d66",
    marginBottom: 4,
  },
  qrSub: { fontSize: 14, color: "#64748B", marginBottom: 20 },
  qrFrame: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  expiryText: {
    fontStyle: "italic",
    color: "#EF4444",
    marginBottom: 20,
    fontSize: 13,
  },

  bankInfoCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankLabel: { fontSize: 13, color: "#64748B" },
  bankValue: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  bankValueHighlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003d66",
    marginTop: 2,
  },

  linkButton: {
    flexDirection: "row",
    marginTop: 20,
    padding: 10,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#003d66",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  payButton: {
    backgroundColor: "#003d66",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#003d66",
  },
  secondaryButtonText: {
    color: "#003d66",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  closeButton: { padding: 4 },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
});
