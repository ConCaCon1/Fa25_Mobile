import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Keyboard,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { apiGet, apiPost, apiPut } from "../../ultis/api";

const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  background: "#F5F7FA",
  card: "#FFFFFF",
  textDark: "#2D3748",
  textGray: "#718096",
  border: "#E2E8F0",
  success: "#48BB78",
  warning: "#ED8936",
  danger: "#F56565",
  info: "#4299E1",
  selectedItem: "#E6F6FF", 
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
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState(""); 
  const [payLoading, setPayLoading] = useState(false);
  
  const [ports, setPorts] = useState([]); 
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [selectedPortId, setSelectedPortId] = useState(null); 

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const fetchPorts = async () => {
    try {
      setLoadingPorts(true);
      const res = await apiGet("/ports?page=1&size=100");
      if (res?.data?.items) {
        setPorts(res.data.items);
      }
    } catch (error) {
      console.log("Error fetching ports:", error);
    } finally {
      setLoadingPorts(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    fetchPorts(); 
  }, []);

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

  const handleSelectPort = (port) => {
    setAddress(port.name);
    setSelectedPortId(port.id);
  };

  const handlePayment = async () => {
    if (!address) {
      Alert.alert("Thông báo", "Vui lòng chọn cảng giao hàng.");
      return;
    }
    try {
      setPayLoading(true);
      const res = await apiPost("/payments", {
        id,
        type: "Supplier",
        address: address, // Gửi tên cảng đã chọn
      });
      navigation.navigate("CheckoutScreen", { data: res.data });
      setModalVisible(false);
      setAddress("");
      setSelectedPortId(null);
    } catch (error) {
      Alert.alert("Lỗi", "Thanh toán thất bại, vui lòng thử lại sau.");
    } finally {
      setPayLoading(false);
    }
  };

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
  const itemsList = order.orderItems || [];

  const renderPortItem = ({ item }) => {
    const isSelected = item.id === selectedPortId;
    return (
      <TouchableOpacity 
        style={[styles.portItem, isSelected && styles.portItemSelected]}
        onPress={() => handleSelectPort(item)}
      >
        <View style={styles.portInfo}>
            <FontAwesome5 name="anchor" size={16} color={isSelected ? COLORS.secondary : COLORS.textGray} style={{marginRight: 10}} />
            <View>
                <Text style={[styles.portName, isSelected && styles.portNameSelected]}>{item.name}</Text>
                <Text style={styles.portCity}>{item.city}, {item.country}</Text>
            </View>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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

        <Text style={styles.sectionTitle}>THÔNG TIN TÀU & LIÊN HỆ</Text>
        <View style={styles.card}>
          <InfoRow icon="boat-outline" label="Tên tàu" value={order.shipName || "Không có tên"} />
          
          {order.boatyardName && (
             <InfoRow icon="business-outline" label="Xưởng tàu" value={order.boatyardName} />
          )}

          <InfoRow icon="call-outline" label="Số điện thoại" value={order.phone || "---"} isLast />
        </View>

        <Text style={styles.sectionTitle}>CHI TIẾT SẢN PHẨM</Text>
        <View style={styles.card}>
            {itemsList.map((item, index) => (
                <View key={index} style={[styles.productRow, index === itemsList.length - 1 && styles.noBorder]}>
                    <View style={styles.productIconBox}>
                        <MaterialCommunityIcons name="cube-outline" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                            <Ionicons name="storefront-outline" size={12} color={COLORS.textGray} style={{marginRight: 4}}/>
                            <Text style={styles.supplierText}>{item.supplierName}</Text>
                        </View>

                        <Text style={styles.productName}>
                            {item.productVariantName || "Sản phẩm"}
                        </Text>
                        
                        <Text style={styles.productOption}>
                            Phân loại: {item.productOptionName || "Tiêu chuẩn"}
                        </Text>
                        
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

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Xác nhận thanh toán</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.textGray} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDesc}>
                Vui lòng chọn cảng giao hàng cho đơn #{order.id.toString().slice(-6)}.
              </Text>
              
              <Text style={styles.inputLabel}>Danh sách cảng</Text>
              
              {loadingPorts ? (
                  <View style={{padding: 20}}>
                      <ActivityIndicator color={COLORS.primary} />
                  </View>
              ) : (
                  <FlatList
                    data={ports}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPortItem}
                    style={styles.portList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 10}}
                  />
              )}

              <TouchableOpacity 
                style={[styles.modalButton, (payLoading || !selectedPortId) && styles.disabledBtn]} 
                onPress={handlePayment}
                disabled={payLoading || !selectedPortId}
              >
                {payLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Xác nhận giao hàng</Text>}
              </TouchableOpacity>
            </View>
        </View>
      </Modal>

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
              {selectedItem?.productVariantName || "Sản phẩm"}
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
  
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  headerBtn: { padding: 4 },

  scrollContent: { padding: 20 },

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

  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start' },
  cardLabel: { fontSize: 12, color: COLORS.textGray, fontWeight: "600", marginBottom: 2 },
  orderIdBig: { fontSize: 24, fontWeight: "800", color: COLORS.primary },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardFooterRow: { flexDirection: 'row', alignItems: 'center' },
  footerLabel: { fontSize: 13, color: COLORS.textGray, marginRight: 8 },
  footerValue: { fontSize: 13, color: COLORS.textDark, fontWeight: '500' },

  infoRow: { flexDirection: "row", paddingVertical: 12, alignItems: 'center' },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E6F0F9", justifyContent: "center", alignItems: "center", marginRight: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.textGray },
  infoValue: { fontSize: 15, fontWeight: "600", color: COLORS.textDark },

  productRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  noBorder: { borderBottomWidth: 0 },
  productIconBox: { width: 48, height: 48, backgroundColor: '#F7FAFC', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  supplierText: { fontSize: 12, color: COLORS.textGray, fontWeight: '500' },
  
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
  modalButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disabledBtn: { opacity: 0.7 },
  
  errorText: { marginTop: 10, color: COLORS.textGray },
  backButtonOutline: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8 },
  backButtonTextOutline: { color: COLORS.primary, fontWeight: '600' },

  portList: { maxHeight: 300, marginBottom: 10 },
  portItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
    backgroundColor: COLORS.card
  },
  portItemSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.selectedItem,
  },
  portInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  portName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  portNameSelected: { color: COLORS.secondary },
  portCity: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
});