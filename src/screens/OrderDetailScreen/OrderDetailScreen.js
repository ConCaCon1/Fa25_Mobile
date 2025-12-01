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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { apiGet, apiPost, apiPut } from "../../ultis/api";

// --- COLORS & THEME ---
const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  background: "#F5F7FA", // Màu nền hiện đại
  card: "#FFFFFF",
  textDark: "#2D3748",
  textGray: "#718096",
  border: "#E2E8F0",
  success: "#48BB78",
  warning: "#ED8936",
  danger: "#F56565",
  info: "#4299E1",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusConfig = (status) => {
  switch (status) {
    case "Pending":
           return { bg: "#FFF4E5", text: "#FF9800", label: "Chờ xử lý", icon: "time-outline" };
    case "Approved":
      return { bg: "#F0FFF4", text: "#38A169", label: "Đã duyệt", icon: "checkmark-circle-outline" };
    case "Rejected":
      return { bg: "#FFF5F5", text: "#E53E3E", label: "Đã hủy", icon: "close-circle-outline" };
    case "Delivered":
      return { bg: "#EBF8FF", text: "#3182CE", label: "Đã giao", icon: "cube-outline" };
    default:
      return { bg: "#EDF2F7", text: "#718096", label: status, icon: "help-circle-outline" };
  }
};

// Component dòng thông tin nhỏ gọn hơn
const InfoRow = ({ icon, label, value, isLast }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const OrderDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  
  // --- STATE ---
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // State thanh toán
  const [isModalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // State sửa số lượng
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // --- FETCH DATA ---
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

  // --- HANDLERS ---
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity ? item.quantity.toString() : "1");
    setEditModalVisible(true);
  };

  const handleUpdateOrder = async () => {
    if (!newQuantity || isNaN(newQuantity) || Number(newQuantity) <= 0) {
        Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ (lớn hơn 0).");
        return;
    }
    try {
      setUpdateLoading(true);
      const payload = {
        id: order.id, 
        orderItems: [
            {
                id: selectedItem.id,
                quantity: Number(newQuantity)
            }
        ]
      };
      await apiPut(`/orders/${id}`, payload);
      Alert.alert("Thành công", "Đã cập nhật số lượng sản phẩm.");
      setEditModalVisible(false);
      fetchOrderDetail();
    } catch (error) {
      console.log("Update error:", error);
      Alert.alert("Lỗi", "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!address.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ giao hàng.");
      return;
    }
    try {
      setPayLoading(true);
      const res = await apiPost("/payments", {
        id,
        type: "Supplier",
        address: address.trim(),
      });
      navigation.navigate("CheckoutScreen", { data: res.data });
      setModalVisible(false);
      setAddress("");
    } catch (error) {
      Alert.alert("Lỗi", "Thanh toán thất bại, vui lòng thử lại sau.");
    } finally {
      setPayLoading(false);
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.textGray} />
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity style={styles.backButtonOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonTextOutline}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const itemsList = order.orderItems || order.orderDetails || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* 1. Header Clean */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Order Summary Card (Status & ID) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardLabel}>Đơn hàng</Text>
              <Text style={styles.orderIdBig}>#{order.id.toString().slice(-6)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={14} color={statusConfig.text} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.cardFooterRow}>
            <Text style={styles.footerLabel}>Mã ID đầy đủ:</Text>
            <Text style={[styles.footerValue, {flex: 1, textAlign: 'right'}]} numberOfLines={1} ellipsizeMode="middle">
                {order.id}
            </Text>
          </View>
        </View>

        {/* 3. Shipping Info */}
        <Text style={styles.sectionTitle}>THÔNG TIN VẬN CHUYỂN</Text>
        <View style={styles.card}>
          <InfoRow icon="boat-outline" label="Mã tàu (Ship ID)" value={order.shipId || "---"} />
          <InfoRow
            icon="business-outline"
            label="Xưởng đóng tàu"
            value={order.boatyardId || "Chưa cập nhật"}
            isLast
          />
        </View>

        {/* 4. Product List & Total */}
        <Text style={styles.sectionTitle}>CHI TIẾT ĐƠN HÀNG</Text>
        <View style={styles.card}>
            {/* List Products */}
            {itemsList.map((item, index) => (
                <View key={index} style={[styles.productRow, index === itemsList.length - 1 && styles.noBorder]}>
                    <View style={styles.productIconBox}>
                        <MaterialCommunityIcons name="cube-outline" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={styles.productName}>
                            {item.productName || item.productVariantName || "Sản phẩm"}
                        </Text>
                        <Text style={styles.productOption}>{item.productOptionName || "Tiêu chuẩn"}</Text>
                        <Text style={styles.productPrice}>{formatCurrency(item.price || 0)}</Text>
                    </View>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.quantityText}>x{item.quantity}</Text>
                        {order.status === "Pending" && (
                            <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.editIconBtn}>
                                <Text style={styles.editText}>Sửa</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}

            {/* Total Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                </View>
            </View>
        </View>

        <View style={{ height: 100 }} /> 
      </ScrollView>

      {/* 5. Bottom Action Bar */}
      {order.status === "Pending" && (
        <View style={styles.bottomBar}>
          <View style={{flex: 1}}>
             <Text style={{fontSize: 12, color: COLORS.textGray}}>Tổng cộng</Text>
             <Text style={{fontSize: 18, fontWeight: 'bold', color: COLORS.primary}}>
                {formatCurrency(order.totalAmount)}
             </Text>
          </View>
          <TouchableOpacity 
            style={styles.payButton} 
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.payButtonText}>Thanh toán</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* --- MODAL THANH TOÁN --- */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Xác nhận thanh toán</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={COLORS.textGray} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalDesc}>
                  Nhập địa chỉ giao hàng cho đơn #{order.id.toString().slice(-6)}.
                </Text>
                <Text style={styles.inputLabel}>Địa chỉ nhận hàng</Text>
                <TextInput
                  placeholder="VD: 123 Đường ABC, Quận 1..."
                  style={styles.inputField}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.modalButton, payLoading && styles.disabledBtn]} 
                  onPress={handlePayment}
                  disabled={payLoading}
                >
                  {payLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Xác nhận</Text>}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- MODAL SỬA SỐ LƯỢNG --- */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa số lượng</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc} numberOfLines={1}>
              {selectedItem?.productName || "Sản phẩm"}
            </Text>
            <Text style={styles.inputLabel}>Số lượng mới</Text>
            <TextInput
                  style={[styles.inputField, { height: 50, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]} 
                  value={newQuantity}
                  onChangeText={(text) => setNewQuantity(text.replace(/[^0-9]/g, ''))} 
                  keyboardType="numeric"
            />
            <TouchableOpacity 
              style={[styles.modalButton, updateLoading && styles.disabledBtn]} 
              onPress={handleUpdateOrder}
              disabled={updateLoading}
            >
              {updateLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Lưu thay đổi</Text>}
            </TouchableOpacity>
          </View>
        </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  headerBtn: { padding: 4 },

  scrollContent: { padding: 20 },

  // Common Card Style
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textGray, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase' },

  // Order Info Card
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start' },
  cardLabel: { fontSize: 12, color: COLORS.textGray, fontWeight: "600", marginBottom: 2 },
  orderIdBig: { fontSize: 24, fontWeight: "800", color: COLORS.primary },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardFooterRow: { flexDirection: 'row', alignItems: 'center' },
  footerLabel: { fontSize: 13, color: COLORS.textGray, marginRight: 8 },
  footerValue: { fontSize: 13, color: COLORS.textDark, fontWeight: '500' },

  // Shipping Info
  infoRow: { flexDirection: "row", paddingVertical: 12, alignItems: 'center' },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E6F0F9", justifyContent: "center", alignItems: "center", marginRight: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.textGray },
  infoValue: { fontSize: 15, fontWeight: "600", color: COLORS.textDark },

  // Product List
  productRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  noBorder: { borderBottomWidth: 0 },
  productIconBox: { width: 48, height: 48, backgroundColor: '#F7FAFC', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 2 },
  productOption: { fontSize: 12, color: COLORS.textGray, marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  quantityText: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 4 },
  editIconBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#EDF2F7', borderRadius: 6 },
  editText: { fontSize: 11, fontWeight: '600', color: COLORS.secondary },

  summaryContainer: { marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 20,
  },
  payButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  payButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", marginRight: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: '100%', backgroundColor: "#fff", borderRadius: 20, padding: 24, shadowColor: "#000", elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  modalDesc: { fontSize: 14, color: COLORS.textGray, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textDark, marginBottom: 8 },
  inputField: {
    backgroundColor: "#F7FAFC", borderRadius: 12, padding: 14, fontSize: 16,
    color: COLORS.textDark, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  modalButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disabledBtn: { opacity: 0.7 },
  
  errorText: { marginTop: 10, color: COLORS.textGray },
  backButtonOutline: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8 },
  backButtonTextOutline: { color: COLORS.primary, fontWeight: '600' },
});