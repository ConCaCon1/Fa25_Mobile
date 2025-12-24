import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { apiGet } from "../../ultis/api"; // Đảm bảo đường dẫn đúng

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Pending":
      return { bg: "#FFF4E5", text: "#FF9800", label: "Đang xử lý", icon: "time-outline" };
    case "Approved":
      return { bg: "#E8F5E9", text: "#4CAF50", label: "Thành công", icon: "checkmark-circle-outline" };
    case "Rejected":
      return { bg: "#FFEBEE", text: "#F44336", label: "Thất bại", icon: "close-circle-outline" };
    default:
      return { bg: "#F5F5F5", text: "#9E9E9E", label: status, icon: "help-circle-outline" };
  }
};

const getTypeLabel = (type) => {
    switch (type) {
        case "Supplier": return "Nhà cung cấp";
        case "Boatyard": return "Xưởng tàu";
        default: return type;
    }
};

const TransactionHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (pageNumber = 1, isRefresh = false) => {
    try {
      // Dựa vào JSON response của bạn, API trả về cấu trúc phân trang
      const res = await apiGet(`/transactions?page=${pageNumber}&size=20`);
      
      if (res?.data?.items) {
        if (isRefresh) {
            setTransactions(res.data.items);
        } else {
            setTransactions(prev => [...prev, ...res.data.items]);
        }
        
        // Kiểm tra xem còn dữ liệu không
        if (pageNumber >= res.data.totalPages) {
            setHasMore(false);
        }
      }
    } catch (error) {
      console.log("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchTransactions(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTransactions(nextPage, false);
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'Supplier' ? '#E3F2FD' : '#FFF3E0' }]}>
                <MaterialCommunityIcons 
                    name={item.type === 'Supplier' ? "truck-delivery-outline" : "anchor"} 
                    size={24} 
                    color={item.type === 'Supplier' ? "#2196F3" : "#FF9800"} 
                />
            </View>
        </View>
        
        <View style={styles.cardCenter}>
            <Text style={styles.transRef}>MGD: {item.transactionReference}</Text>
            <Text style={styles.transType}>{getTypeLabel(item.type)}</Text>
            <Text style={styles.dateText}>
                {new Date(item.createdDate).toLocaleString('vi-VN')}
            </Text>
        </View>

        <View style={styles.cardRight}>
            <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
            </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={{width: 40}} /> 
      </View>

      {/* List */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003d66" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003d66"]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
             <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="text-box-search-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
             </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C' },
  backButton: { padding: 8 },
  
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardLeft: { marginRight: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  
  cardCenter: { flex: 1, justifyContent: 'center' },
  transRef: { fontSize: 13, color: '#8898AA', marginBottom: 2 },
  transType: { fontSize: 15, fontWeight: '600', color: '#2D3748', marginBottom: 2 },
  dateText: { fontSize: 11, color: '#A0AEC0' },

  cardRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 15, fontWeight: '700', color: '#003d66', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#8898AA', marginTop: 10 }
});

export default TransactionHistoryScreen;