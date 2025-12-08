import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { apiGet } from "../../ultis/api";
import BottomNavBar from "../../components/BottomNavBar";

// Bảng màu Modern Nautical
const COLORS = {
  primary: "#0A2540", // Xanh đậm sang trọng
  secondary: "#00A8E8", // Xanh dương tươi sáng
  accent: "#38B000", // Xanh lá
  warning: "#FFA726", // Cam
  danger: "#EF476F", // Hồng đỏ
  background: "#F4F7FA", // Xám xanh rất nhạt làm nền
  white: "#FFFFFF",
  textDark: "#1D3557",
  textMedium: "#457B9D",
  textLight: "#A8DADC",
  border: "#E1E8ED",
  cardShadow: "#90A4AE",
};

const HistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending");

  const fetchBookings = async () => {
    try {
      const res = await apiGet("/bookings");
      setBookings(res.data.items || []);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách booking:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Confirmed":
        return { color: COLORS.accent, text: "Đã thanh toán", icon: "check-circle" };
      case "Pending":
        return { color: COLORS.warning, text: "Chờ thanh toán", icon: "clock-outline" };
      case "Canceled":
        return { color: COLORS.danger, text: "Đã hủy", icon: "close-circle" };
      default:
        return { color: COLORS.textMedium, text: "Khác", icon: "help-circle" };
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const getPlaceholderImage = () =>
    "https://i.pinimg.com/736x/9e/3b/da/9e3bda55c3cbda1bbb6133db35ab2824.jpg";

  const renderBookingCard = (item) => {
    const statusInfo = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => navigation.navigate("BookingDetailScreen", { bookingId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: getPlaceholderImage() }} style={styles.image} />
          <View style={styles.headerInfo}>
            <View style={styles.rowBetween}>
              <Text style={styles.shipName} numberOfLines={1}>{item.shipName || "Thuyền #NoName"}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                <MaterialCommunityIcons name={statusInfo.icon} size={12} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
            <Text style={styles.dockName} numberOfLines={1}>
              <Ionicons name="location-sharp" size={12} color={COLORS.textMedium} />
              {" "}{item.dockSlotName || "Bến tàu chưa cập nhật"}
            </Text>
            
            <View style={styles.priceTag}>
               <Text style={styles.priceLabel}>Tổng tiền:</Text>
               <Text style={styles.priceValue}>{formatCurrency(item.totalAmount || 0)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.dashedLine} />

        <View style={styles.cardFooter}>
          <View style={styles.timeInfo}>
             <MaterialCommunityIcons name="calendar-blank" size={18} color={COLORS.primary} />
             <Text style={styles.dateText}>
                {new Date(item.startTime).toLocaleDateString("vi-VN")}
             </Text>
          </View>
          <View style={styles.verticalDivider}/>
          <View style={styles.timeInfo}>
             <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.primary} />
             <Text style={styles.dateText}>
                {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                {" - "} 
                {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Lịch sử đặt chỗ</Text>
        <Text style={styles.headerSubtitle}>Quản lý các chuyến đi của bạn</Text>
      </View>

      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          {["Pending", "Confirmed", "Canceled"].map((tab) => (
             <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === "Pending" ? "Chờ thanh toán" : tab === "Confirmed" ? "Đã xong" : "Đã hủy"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.subText}>Đang tải dữ liệu...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Image 
              source={{uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png"}} 
              style={{width: 120, height: 120, opacity: 0.5, marginBottom: 20}}
            />
            <Text style={styles.emptyTitle}>Chưa có booking nào</Text>
            <Text style={styles.subText}>Bạn chưa có đơn đặt lịch nào ở trạng thái này.</Text>
          </View>
        ) : (
          filteredBookings.map(renderBookingCard)
        )}
      </ScrollView>

      <BottomNavBar activeScreen="History" navigation={navigation} />
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  /* HEADER STYLES */
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 4,
  },

  /* TAB STYLES */
  tabWrapper: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E8EEF4", // Màu nền thanh tab tối hơn nền chính một chút
    borderRadius: 12,
    padding: 4,
    height: 44,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMedium,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  /* CARD STYLES */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    padding: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6, // Android
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shipName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    flex: 1,
    marginRight: 4,
  },
  dockName: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  priceLabel: {
    fontSize: 12, 
    color: COLORS.textMedium,
    marginRight: 4
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary
  },

  /* STATUS BADGE */
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "uppercase",
  },

  /* DIVIDER & FOOTER */
  dashedLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 1
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textDark,
  },

  centerBox: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginTop: 10,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: "center",
    marginTop: 5,
  },
});