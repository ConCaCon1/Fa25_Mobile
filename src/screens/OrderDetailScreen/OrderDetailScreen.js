import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, apiPost } from "../../ultis/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusConfig = (status) => {
  switch (status) {
    case "Completed":
    case "Delivered":
      return { bg: "#E6F4EA", text: "#1E8E3E", label: "Hoàn thành", icon: "checkmark-circle" };
    case "Pending":
      return { bg: "#FFF4E5", text: "#FF9800", label: "Chờ xử lý", icon: "time" };
    case "Cancelled":
      return { bg: "#FCE8E6", text: "#D93025", label: "Đã hủy", icon: "close-circle" };
    case "Processing":
      return { bg: "#E8F0FE", text: "#1967D2", label: "Đang xử lý", icon: "sync" };
    default:
      return { bg: "#F1F3F4", text: "#5F6368", label: status, icon: "information-circle" };
  }
};

const InfoRow = ({ icon, label, value, isLast }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon} size={22} color="#003d66" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const OrderDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      const res = await apiGet(`/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.log("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const handlePayment = async () => {
    if (!address.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ giao hàng để tiếp tục.");
      return;
    }

    try {
      setPayLoading(true);

      const body = {
        id: order.id,
        type: "Supplier",
        address: address.trim(),
      };

      const res = await apiPost("/payments", {
        id,
        type: "Supplier",
        address,
      });

      navigation.navigate("CheckoutScreen", { data: res.data });

      setModalVisible(false);
      setAddress("");
    } catch (error) {
      Alert.alert("Lỗi", "Thanh toán thất bại, vui lòng thử lại sau.");
      console.log("Payment error:", error);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003d66" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#D93025" />
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity style={styles.backButtonOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonTextOutline}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View>
              <Text style={styles.labelSmall}>MÃ ĐƠN HÀNG</Text>
              <Text style={styles.orderIdText}>#{order.id.toString().slice(-6)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={16} color={statusConfig.text} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.mainCardFooter}>
            <Text style={styles.footerLabel}>Mã đầy đủ system:</Text>
            <Text style={styles.footerValue}>{order.id}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>THÔNG TIN VẬN CHUYỂN</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="boat" label="Mã tàu (Ship ID)" value={order.shipId} />
          <InfoRow
            icon="business"
            label="Xưởng đóng tàu"
            value={order.boatyardId || "Chưa cập nhật"}
            isLast
          />
        </View>

        <Text style={styles.sectionHeader}>THANH TOÁN</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentLabel}>Tổng tiền thanh toán</Text>
              <Text style={styles.totalAmount}>{formatCurrency(order.totalAmount)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.supportBtn}>
            <Ionicons name="chatbubbles-outline" size={20} color="#666" />
            <Text style={styles.supportText}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} /> 
      </ScrollView>

      {order.status === "Pending" && (
        <View style={styles.bottomActionContainer}>
          <TouchableOpacity 
            style={styles.payButton} 
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.payButtonText}>THANH TOÁN NGAY</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Xác nhận thanh toán</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>
                  Vui lòng nhập địa chỉ giao hàng để hoàn tất đơn hàng #{order.id.toString().slice(-6)}.
                </Text>

                <Text style={styles.inputLabel}>Địa chỉ giao hàng</Text>
                <TextInput
                  placeholder="Nhập số nhà, tên đường, phường/xã..."
                  style={styles.inputField}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />

                <TouchableOpacity 
                  style={[styles.confirmBtn, payLoading && styles.disabledBtn]} 
                  onPress={handlePayment}
                  disabled={payLoading}
                >
                  {payLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmText}>Xác nhận & Giao hàng</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { color: "#525F7F", fontSize: 16, marginTop: 12, marginBottom: 24, fontWeight: '500' },
  backButtonOutline: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: '#003d66', borderRadius: 8 },
  backButtonTextOutline: { color: '#003d66', fontWeight: '600' },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#003d66", letterSpacing: 0.5 },
  
  scrollContent: { padding: 20 },
  
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#003d66', 
  },
  mainCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start' },
  labelSmall: { fontSize: 12, color: "#8898AA", fontWeight: "700", marginBottom: 4 },
  orderIdText: { fontSize: 26, fontWeight: "800", color: "#32325D" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 13, fontWeight: "700" },
  dottedLine: { height: 1, backgroundColor: "#E9ECEF", marginVertical: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 1 },
  mainCardFooter: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  footerLabel: { fontSize: 13, color: "#8898AA", marginRight: 6 },
  footerValue: { fontSize: 13, color: "#525F7F", fontWeight: '500' },

  sectionHeader: { fontSize: 14, fontWeight: "700", color: "#8898AA", marginBottom: 12, marginLeft: 4, letterSpacing: 0.5 },
  
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EFF2F7'
  },
  infoRow: { flexDirection: "row", paddingVertical: 12, alignItems: 'center' },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F3F4" },
  infoIconContainer: {
    width: 42, height: 42,
    borderRadius: 12,
    backgroundColor: "#E6F0F9", 
    justifyContent: "center", alignItems: "center",
    marginRight: 16,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: "#8898AA", marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#32325D" },

  paymentCard: {
    backgroundColor: "#003d66", 
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#003d66", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  paymentRow: { flexDirection: 'row', alignItems: 'center' },
  walletIcon: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", 
    justifyContent: 'center', alignItems: 'center', marginRight: 16 
  },
  paymentLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 4 },
  totalAmount: { color: "#fff", fontSize: 22, fontWeight: "800" },

  supportBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12 },
  supportText: { marginLeft: 8, color: '#666', fontWeight: '500' },

  bottomActionContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1, borderTopColor: '#EFF2F7',
    elevation: 10,
  },
  payButton: {
    backgroundColor: "#003d66",
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: 12,
    shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6,
  },
  payButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", marginRight: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: { width: '100%', alignItems: 'center' },
  modalContent: {
    width: '85%',
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#32325D" },
  modalDesc: { fontSize: 14, color: "#525F7F", marginBottom: 20, lineHeight: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#32325D", marginBottom: 8 },
  inputField: {
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#32325D",
    borderWidth: 1, borderColor: "transparent",
    marginBottom: 24,
    height: 80, 
  },
  confirmBtn: {
    backgroundColor: "#003d66",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.7 },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});