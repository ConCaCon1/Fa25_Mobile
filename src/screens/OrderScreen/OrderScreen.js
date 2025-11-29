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
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";
import BottomNavBar from "../../components/BottomNavBar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
const PAGE_SIZE = 5;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Pending":
      return { bg: "#FFF4E5", text: "#FF9800", label: "Chờ xử lý", icon: "time-outline" };
    case "Approved":
      return { bg: "#E8F5E9", text: "#4CAF50", label: "Đã duyệt", icon: "checkmark-circle-outline" };
    case "Rejected":
      return { bg: "#FFEBEE", text: "#F44336", label: "Bị từ chối", icon: "close-circle-outline" };
    case "Delivered":
      return { bg: "#E3F2FD", text: "#2196F3", label: "Đã giao", icon: "cube-outline" };
    default:
      return { bg: "#F5F5F5", text: "#9E9E9E", label: status, icon: "help-circle-outline" };
  }
};

const OrderScreen = ({ navigation }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [visibleOrders, setVisibleOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await apiGet("/orders?page=1&pageSize=1000");
      if (res?.data?.items) {
        setAllOrders(res.data.items);
      } else if (Array.isArray(res?.data)) {
        setAllOrders(res.data);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  )

  const filteredData = useMemo(() => {
    let filtered = allOrders;
    
    if (filterStatus !== "All") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }
    
    if (searchText) {
      filtered = filtered.filter((item) => item.id.toString().slice(-6).includes(searchText));
    }
    
    return filtered;
  }, [allOrders, filterStatus, searchText]);

  useEffect(() => {
    const endIndex = currentPage * PAGE_SIZE;
    setVisibleOrders(filteredData.slice(0, endIndex));
    setLoadingMore(false); 
  }, [filteredData, currentPage]);

  useEffect(() => setCurrentPage(1), [searchText, filterStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchOrders();
  }, []);

  const handleLoadMore = () => {
    if (loadingMore) return;
    
    if (visibleOrders.length >= filteredData.length) return;

    setLoadingMore(true);
    setTimeout(() => setCurrentPage((prev) => prev + 1), 500);
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("OrderDetailScreen", { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="package-variant-closed" size={20} color="#003d66" />
            </View>
            <View>
              <Text style={styles.orderLabel}>Đơn hàng</Text>
              <Text style={styles.orderId}>#{item.id.toString().slice(-6)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} style={{marginRight: 4}}/>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="boat-outline" size={16} color="#8898AA" />
              <Text style={styles.infoLabel}>Tàu (Ship ID)</Text>
            </View>
            <Text style={styles.infoValue}>{item.shipId}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="wallet-outline" size={16} color="#8898AA" />
              <Text style={styles.infoLabel}>Tổng tiền</Text>
            </View>
            <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
             {item.createdDate ? new Date(item.createdDate).toLocaleDateString('vi-VN') : 'Hôm nay'}
          </Text>
          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#003d66" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ 4. Component Footer chỉ hiện khi loadingMore = true
  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#003d66" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Đơn hàng</Text>
            <Text style={styles.headerSubtitle}>Quản lý danh sách đặt hàng</Text>
          </View>
        </View>

        <View style={styles.filterBar}>
         <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8898AA" style={{marginRight: 8}}/>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm mã đơn (6 ký tự cuối)..."
              placeholderTextColor="#8898AA"
              value={searchText}
              onChangeText={setSearchText}
              keyboardType="default" 
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {filterStatus !== 'All' && (
        <View style={styles.activeFilterContainer}>
           <Text style={styles.activeFilterText}>Đang lọc: {
             getStatusStyle(filterStatus).label
           }</Text>
           <TouchableOpacity onPress={() => setFilterStatus('All')}>
              <Ionicons name="close-circle" size={18} color="#666" />
           </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003d66" />
        </View>
      ) : (
        <FlatList
          data={visibleOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
              <Text style={styles.emptySubText}>Vui lòng thử từ khóa hoặc bộ lọc khác</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003d66"]} tintColor="#003d66"/>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* FILTER MODAL */}
      <Modal visible={isFilterModalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo trạng thái</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterOptions}>
              {["All", "Pending", "Approved", "Rejected", "Delivered"].map((status) => {
                 const isActive = filterStatus === status;
                 const statusInfo = getStatusStyle(status);
                 return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterOptionItem, isActive && styles.filterOptionActive]}
                    onPress={() => {
                      setFilterStatus(status);
                      setFilterModalVisible(false);
                    }}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                       {status !== 'All' && <Ionicons name={statusInfo.icon} size={18} color={isActive ? "#fff" : statusInfo.text} style={{marginRight: 8}}/>}
                       <Text style={[styles.filterOptionText, isActive && styles.filterOptionTextActive]}>
                         {status === "All" ? "Tất cả đơn hàng" : statusInfo.label}
                       </Text>
                    </View>
                    {isActive && <Ionicons name="checkmark" size={20} color="#fff" />}
                  </TouchableOpacity>
                 )
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavBar activeScreen="Cart" navigation={navigation} />
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
    zIndex: 10,
  },
  headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1A202C", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: "#718096", marginTop: 2, fontWeight: '500' },
  notificationBtn: { padding: 8, backgroundColor: '#F0F4F8', borderRadius: 12, position: 'relative' },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1, borderColor: '#fff' },

  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: "#F0F4F8", 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    height: 48 
  },
  searchInput: { flex: 1, fontSize: 15, color: "#2D3748", height: '100%' },
  filterButton: { 
    width: 48, height: 48, 
    backgroundColor: "#003d66", 
    borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#003d66", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },

  activeFilterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 12, backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  activeFilterText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },

  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#9FB1C8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.02)"
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderIdContainer: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#E6F0F9", justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderLabel: { fontSize: 12, color: "#8898AA", fontWeight: "600", marginBottom: 2 },
  orderId: { fontSize: 16, fontWeight: "800", color: "#2D3748" },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "700" },
  
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },
  
  cardBody: { gap: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'flex-start' },
  infoLabel: { fontSize: 14, color: "#718096", marginLeft: 6, fontWeight: '500' },
  infoValue: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#2D3748",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
    flexWrap: 'wrap'
  },
  totalAmount: { fontSize: 16, fontWeight: "800", color: "#003d66" },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  dateText: { fontSize: 12, color: '#A0AEC0', fontWeight: '500' },
  detailButton: { flexDirection: 'row', alignItems: 'center' },
  detailButtonText: { fontSize: 13, fontWeight: "700", color: "#003d66", marginRight: 4 },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#2D3748", marginTop: 16 },
  emptySubText: { fontSize: 14, color: "#8898AA", marginTop: 6, textAlign: 'center' },
  
  footerLoading: { paddingVertical: 16, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { marginLeft: 8, color: "#003d66", fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1A202C" },
  
  filterOptions: { gap: 12 },
  filterOptionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F7F9FC', borderWidth: 1, borderColor: '#EDF2F7' },
  filterOptionActive: { backgroundColor: '#003d66', borderColor: '#003d66' },
  filterOptionText: { fontSize: 16, color: '#4A5568', fontWeight: '600' },
  filterOptionTextActive: { color: '#fff' },
});