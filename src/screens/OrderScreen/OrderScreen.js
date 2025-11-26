import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";
import BottomNavBar from "../../components/BottomNavBar";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
    case "Delivered":
      return { bg: "#E6F4EA", text: "#1E8E3E", label: "Hoàn thành" };
    case "Pending":
      return { bg: "#FEF7E0", text: "#F9AB00", label: "Chờ xử lý" };
    case "Cancelled":
      return { bg: "#FCE8E6", text: "#D93025", label: "Đã hủy" };
    case "Processing":
      return { bg: "#E8F0FE", text: "#1967D2", label: "Đang xử lý" };
    default:
      return { bg: "#F1F3F4", text: "#5F6368", label: status };
  }
};

const OrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await apiGet("/orders?page=1&pageSize=20");
      if (res?.data?.items) {
        setOrders(res.data.items);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchText) return orders;
    return orders.filter((item) => {
      const shortId = item.id.toString().slice(-6);
      return shortId.includes(searchText);
    });
  }, [orders, searchText]);

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("OrderDetailScreen", { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderLabel}>Mã đơn hàng</Text>
            <Text style={styles.orderId}>#{item.id.toString().slice(-6)}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã tàu (Ship ID):</Text>
            <Text style={styles.infoValue}>{item.shipId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng tiền:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(item.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailText}>Xem chi tiết</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchText ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
      </Text>
      <Text style={styles.emptySubText}>
        {searchText
          ? `Không có mã nào khớp với "${searchText}"`
          : "Các đơn hàng mới sẽ xuất hiện tại đây."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
        <Text style={styles.headerSubtitle}>Danh sách các đơn hàng</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã đơn (ví dụ: 123456)"
            placeholderTextColor="#8898AA"
            value={searchText}
            onChangeText={setSearchText}
            keyboardType="numeric"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003d66" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003d66"]} />
          }
        />
      )}

      <BottomNavBar activeScreen="Cart" navigation={navigation} />
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EFF2F7",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#003d66",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8898AA",
    marginTop: 4,
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: "#32325D",
    paddingVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderLabel: {
    fontSize: 12,
    color: "#8898AA",
    marginBottom: 2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#32325D",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#EFF2F7",
    marginVertical: 12,
  },
  cardBody: {
    flexDirection: "column",
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: "#525F7F",
    flexShrink: 0,
    marginRight: 10,
    paddingTop: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#32325D",
    flex: 1,
    textAlign: "right",
    flexWrap: "wrap",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003d66",
  },
  cardFooter: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#003d66",
    textDecorationLine: "underline",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#32325D",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#8898AA",
  },
});
