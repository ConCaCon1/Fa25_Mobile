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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { apiGet } from "../../ultis/api"; // Giữ nguyên đường dẫn import của bạn
import BottomNavBar from "../../components/BottomNavBar"; // Giữ nguyên đường dẫn import của bạn

// Màu sắc chủ đạo (có thể tách ra file constants)
const COLORS = {
  primary: "#003d66", // Xanh đậm chủ đạo
  primaryLight: "#e0f7fa", // Xanh nhạt cho nền
  accent: "#28a745", // Xanh lá cho trạng thái thành công
  warning: "#ffc107", // Vàng cho trạng thái chờ
  danger: "#dc3545", // Đỏ cho trạng thái hủy
  textDark: "#1a202c",
  textMedium: "#4a5568",
  textLight: "#718096",
  white: "#FFFFFF",
  grayBackground: "#F8FAFC",
  borderColor: "#e2e8f0",
};

const HistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiGet("/bookings");
        setBookings(res.data.items || []);
      } catch (error) {
        console.log("Lỗi khi lấy danh sách booking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: COLORS.accent, text: "Đã thanh toán" };
      case "Pending":
        return { backgroundColor: COLORS.warning, text: "Đang chờ" };
      case "Canceled":
        return { backgroundColor: COLORS.danger, text: "Đã hủy" };
      default:
        return { backgroundColor: COLORS.textLight, text: "Không xác định" };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPlaceholderImage = () => {
    return "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử đặt lịch</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải lịch sử booking...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="sail-boat" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyTextTitle}>Không có booking nào</Text>
            <Text style={styles.emptyTextSubtitle}>Hãy bắt đầu đặt chỗ cho thuyền của bạn ngay!</Text>
          </View>
        ) : (
          bookings.map((item) => {
            const statusInfo = getStatusStyle(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate("BookingDetailScreen", { bookingId: item.id })}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: getPlaceholderImage() }} 
                  style={styles.image}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item.shipName || "Thuyền không tên"}</Text>
                  <Text style={styles.boatyardName}>{item.boatyardName || "Bến tàu không rõ"}</Text>

                  <View style={styles.detailGroup}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar-month-outline" size={16} color={COLORS.textMedium} />
                      <Text style={styles.detailText}>
                        {new Date(item.startTime).toLocaleDateString("vi-VN")}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="clock-time-four-outline" size={16} color={COLORS.textMedium} />
                      <Text style={styles.detailText}>
                        {new Date(item.startTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(item.endTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="anchor" size={16} color={COLORS.textMedium} />
                      <Text style={styles.detailText}>{item.dockSlotName || "Chưa có vị trí"}</Text>
                    </View>
                  </View>
                  
                  {item.totalAmount !== undefined && (
                    <Text style={styles.totalAmountText}>
                      Tổng: <Text style={{fontWeight: 'bold', color: COLORS.primary}}>{formatCurrency(item.totalAmount)}</Text>
                    </Text>
                  )}
                </View>

                <View style={[styles.statusChip, { backgroundColor: statusInfo.backgroundColor }]}>
                  <Text style={styles.statusChipText}>{statusInfo.text}</Text>
                </View>
              </TouchableOpacity>
            );
          })
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
    backgroundColor: COLORS.grayBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100, // Để không bị BottomNavBar che mất item cuối
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    flexDirection: "row",
    padding: 15,
    marginBottom: 16,
    // Modern Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative', // Quan trọng cho chip trạng thái
  },
  image: {
    width: 100,
    height: 120, // Tăng chiều cao ảnh để cân đối hơn
    borderRadius: 12,
    marginRight: 15,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    color: COLORS.textDark,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 4,
  },
  boatyardName: {
    color: COLORS.textMedium,
    fontSize: 14,
    marginBottom: 8,
  },
  detailGroup: {
    marginTop: 5,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    color: COLORS.textMedium,
    fontSize: 13,
    marginLeft: 8,
  },
  totalAmountText: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginTop: 5,
  },

  // Status Chip
  statusChip: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.textMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyTextTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
    marginTop: 20,
    textAlign: 'center',
  },
  emptyTextSubtitle: {
    fontSize: 15,
    color: COLORS.textMedium,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});