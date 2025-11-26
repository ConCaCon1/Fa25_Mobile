import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Clipboard,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from 'react-native-qrcode-svg';
import { WebView } from 'react-native-webview';
import { apiPost } from "../../ultis/api"; 

const CheckoutDockScreen = ({ route, navigation }) => {
  const { bookingId, totalAmount, bookingData } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState("BANK");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showWebView, setShowWebView] = useState(false);

  const formatCurrency = (value) => {
    if (!value) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const body = {
        id: bookingId,
        type: "Boatyard",
        address: "Trực tuyến"
      };

      const res = await apiPost("/payments", body);

      if (res && res.data) {
        setPaymentData(res.data);
      } else {
        Alert.alert("Lỗi", "Không nhận được dữ liệu thanh toán từ server.");
      }

    } catch (error) {
      console.log("Payment Error:", error);
      Alert.alert("Lỗi", "Không thể tạo thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentUrl = () => {
    if (paymentData?.checkoutUrl) {
      setShowWebView(true);
    }
  };

  const copyToClipboard = (text, label) => {
    if(!text) return;
    Clipboard.setString(text.toString());
    Alert.alert("Đã sao chép", `Đã copy ${label}: ${text}`);
  };

  const handleFinishManual = () => {
    Alert.alert("Xác nhận", "Hệ thống sẽ kiểm tra giao dịch của bạn. Vui lòng đợi trong giây lát.", [
      { text: "Đóng", style: "cancel" },
      { 
        text: "Về trang chủ", 
        onPress: () => navigation.popToTop() 
      }
    ]);
  };

  const handleWebViewNavigationStateChange = (navState) => {
      const { url } = navState;
      if (!url) return;

      if (url.includes("status=PAID") || url.includes("success")) {
          setShowWebView(false);
          navigation.replace("BookingSuccessScreen", { 
              bookingId: bookingId,
              message: "Thanh toán thành công!"
          });
          return;
      }

      if (url.includes("status=CANCELLED") || url.includes("cancel") || url.includes("fail")) {
          setShowWebView(false);
          navigation.replace("BookingFailScreen", {
              bookingId: bookingId,
              message: "Bạn đã hủy thanh toán hoặc giao dịch thất bại."
          });
          return;
      }
  };

  if (!bookingData) return null;

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
        {!paymentData ? (
          <>
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Tàu:</Text>
                    <Text style={styles.value}>{bookingData.shipName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Bến:</Text>
                    <Text style={styles.value}>{bookingData.dockSlotName}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.rowTotal}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity 
                style={[styles.methodCard, styles.methodSelected]}
                onPress={() => setPaymentMethod('BANK')}
            >
                <View style={styles.methodInfo}>
                    <MaterialCommunityIcons name="qrcode-scan" size={24} color="#003d66" />
                    <View>
                        <Text style={styles.methodName}>Chuyển khoản QR (VietQR)</Text>
                        <Text style={styles.methodSub}>Quét mã QR để thanh toán nhanh</Text>
                    </View>
                </View>
                <Ionicons name="radio-button-on" size={22} color="#003d66" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
            <Text style={styles.qrSub}>Sử dụng ứng dụng ngân hàng hoặc MoMo</Text>
            
            <View style={styles.qrFrame}>
               {paymentData.qrCode ? (
                   <QRCode value={paymentData.qrCode} size={200} />
               ) : (
                   <ActivityIndicator />
               )}
            </View>
            
            <Text style={styles.expiryText}>Đơn hàng hết hạn sau 15 phút</Text>

            <View style={styles.bankInfoCard}>
                <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Ngân hàng (BIN):</Text>
                    <Text style={styles.bankValue}>MB Bank ({paymentData.bin})</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.bankRow}>
                    <View>
                        <Text style={styles.bankLabel}>Số tài khoản:</Text>
                        <Text style={styles.bankValueHighlight}>{paymentData.accountNumber}</Text>
                    </View>
                    <TouchableOpacity onPress={() => copyToClipboard(paymentData.accountNumber, "Số tài khoản")}>
                        <Ionicons name="copy-outline" size={20} color="#003d66" />
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />
                <View style={styles.bankRow}>
                    <View>
                        <Text style={styles.bankLabel}>Số tiền:</Text>
                        <Text style={styles.bankValueHighlight}>{formatCurrency(paymentData.amount)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => copyToClipboard(paymentData.amount, "Số tiền")}>
                        <Ionicons name="copy-outline" size={20} color="#003d66" />
                    </TouchableOpacity>
                </View>
                <View style={styles.divider} />
                <View style={styles.bankRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.bankLabel}>Nội dung CK:</Text>
                        <Text style={styles.bankValueHighlight}>{paymentData.description}</Text>
                    </View>
                    <TouchableOpacity onPress={() => copyToClipboard(paymentData.description, "Nội dung")}>
                        <Ionicons name="copy-outline" size={20} color="#003d66" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.linkButton} onPress={openPaymentUrl}>
                <Text style={styles.linkButtonText}>Mở trang thanh toán PayOS</Text>
                <Ionicons name="open-outline" size={18} color="#003d66" style={{marginLeft: 6}}/>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!paymentData ? (
           <TouchableOpacity 
              style={styles.payButton} 
              onPress={handleCreatePayment}
              disabled={loading}
           >
              {loading ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.payButtonText}>Tiếp tục thanh toán</Text>
              )}
           </TouchableOpacity>
        ) : (
            <TouchableOpacity 
              style={[styles.payButton, {backgroundColor: "#10B981"}]} 
              onPress={handleFinishManual}
            >
              <Text style={styles.payButtonText}>Tôi đã thanh toán xong</Text>
            </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
             <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#003d66" />
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Cổng thanh toán</Text>
             <View style={{width: 28}} />
          </View>

          {paymentData?.checkoutUrl && (
              <WebView
                source={{ uri: paymentData.checkoutUrl }}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#003d66" />
                    </View>
                )}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                style={{ flex: 1 }}
              />
          )}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

export default CheckoutDockScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#334155", marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#64748B" },
  value: { fontWeight: "600", color: "#1E293B" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  rowTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  totalAmount: { fontSize: 20, fontWeight: "700", color: "#003d66" },
  methodCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  methodSelected: { borderColor: "#003d66", backgroundColor: "#F0F9FF" },
  methodInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  methodName: { fontWeight: "600", color: "#1E293B" },
  methodSub: { fontSize: 12, color: "#64748B" },
  qrContainer: { alignItems: 'center', marginTop: 10 },
  qrTitle: { fontSize: 20, fontWeight: 'bold', color: '#003d66', marginBottom: 4 },
  qrSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  qrFrame: { padding: 16, backgroundColor: '#fff', borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 16 },
  expiryText: { fontStyle: 'italic', color: '#EF4444', marginBottom: 20, fontSize: 13 },
  bankInfoCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankLabel: { fontSize: 13, color: '#64748B' },
  bankValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  bankValueHighlight: { fontSize: 16, fontWeight: 'bold', color: '#003d66', marginTop: 2 },
  linkButton: { flexDirection: 'row', marginTop: 20, padding: 10, alignItems: 'center' },
  linkButtonText: { color: '#003d66', fontWeight: '600', textDecorationLine: 'underline' },
  footer: { padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  payButton: { backgroundColor: "#003d66", padding: 16, borderRadius: 12, alignItems: "center" },
  payButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  closeButton: { padding: 4 },
  loadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' }
});