import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { apiGet } from "../../ultis/api"; 

// Constants màu sắc
const COLORS = {
  primary: "#003d66",
  background: "#F8FAFC",
  white: "#FFFFFF",
  grayText: "#64748B",
  darkText: "#1E293B",
  border: "#E2E8F0",
  success: "#10B981", 
  warning: "#F59E0B", 
  danger: "#EF4444", 
};

const BookingDetailScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const res = await apiGet(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể lấy chi tiết booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetail();
  }, [bookingId]);

  const handlePayment = () => {
    navigation.navigate("CheckoutDockScreen", {
      bookingId: booking.id,
      totalAmount: booking.totalAmount,
      bookingData: booking, 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return COLORS.success;
      case "Pending": return COLORS.warning;
      case "Canceled": return COLORS.danger;
      default: return COLORS.grayText;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Confirmed": return "Đã thanh toán";
      case "Pending": return "Chờ thanh toán";
      case "Canceled": return "Đã hủy";
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.grayText }}>Không tìm thấy thông tin booking.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const startTime = formatDate(booking.startTime);
  const endTime = formatDate(booking.endTime);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Booking</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={[styles.rowBetween, { alignItems: "flex-start" }]}>
            
            <View style={{ flex: 1, marginRight: 12 }}> 
              <Text style={styles.shipName}>{booking.shipName}</Text>
              
              <Text style={styles.subText}>
                ID: #{booking.id}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}> 
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(booking.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-circle-outline" size={20} color={COLORS.grayText} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Chủ tàu</Text>
              <Text style={styles.infoValue}>{booking.shipOwnerName}</Text>
              <Text style={styles.subText}>{booking.shipOwnerPhoneNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Thời gian & Địa điểm</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="anchor" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vị trí bến (Dock Slot)</Text>
              <Text style={styles.infoValue}>{booking.dockSlotName}</Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Bắt đầu</Text>
              <Text style={styles.timeValue}>{startTime.time}</Text>
              <Text style={styles.dateValue}>{startTime.date}</Text>
            </View>
            
            <View style={styles.timeArrow}>
               <Ionicons name="arrow-forward-circle" size={24} color={COLORS.primary} />
               <View style={styles.dottedLine} />
            </View>

            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Kết thúc</Text>
              <Text style={styles.timeValue}>{endTime.time}</Text>
              <Text style={styles.dateValue}>{endTime.date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Dịch vụ sử dụng</Text>
        </View>

        <View style={styles.card}>
          {booking.services && booking.services.length > 0 ? (
            booking.services.map((s, index) => (
              <View key={s.id || index} style={styles.serviceItem}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name="construct-outline" size={18} color={COLORS.grayText} style={{marginRight: 8}}/>
                  <Text style={styles.serviceName}>{s.typeService}</Text>
                </View>
                <Text style={styles.servicePrice}>{formatCurrency(s.price)}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: COLORS.grayText, fontStyle: "italic" }}>Không có dịch vụ đi kèm</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalAmount}>{formatCurrency(booking.totalAmount)}</Text>
          </View>
        </View>

      </ScrollView>

      {booking.status === "Pending" && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.paymentBtn} 
            onPress={handlePayment}
          >
            <Text style={styles.paymentBtnText}>Thanh toán ngay</Text>
            <Ionicons name="card-outline" size={20} color="#fff" style={{marginLeft: 8}}/>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookingDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  backBtn: {
    padding: 8,
  },

  content: {
    padding: 16,
    paddingBottom: 100, 
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleContainer: {
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.darkText,
  },

  shipName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },
  subText: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.grayText,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.darkText,
    marginTop: 2,
  },

  timelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
  },
  timeBlock: {
    alignItems: "center",
    flex: 1,
  },
  timeArrow: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
  },
  dottedLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    zIndex: -1,
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  dateValue: {
    fontSize: 12,
    color: COLORS.grayText,
  },

  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  serviceName: {
    fontSize: 15,
    color: COLORS.darkText,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.darkText,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.grayText,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  paymentBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
});