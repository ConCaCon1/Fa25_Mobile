import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost } from "../../ultis/api"; // Giả định đường dẫn API đúng

const SelectShipScreen = ({ route, navigation }) => {
  const { productId, variantId, variantName } = route.params;
  const [shipList, setShipList] = useState([]);
  const [filteredShipList, setFilteredShipList] = useState([]);
  const [selectedShipId, setSelectedShipId] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingShips, setIsLoadingShips] = useState(true);

  // 1. Lấy danh sách tàu
  useEffect(() => {
    const fetchShips = async () => {
      try {
        const res = await apiGet("/ships?deleted=false");
        const ships = res.data?.items || [];
        setShipList(ships);
        setFilteredShipList(ships); // Khởi tạo danh sách lọc
      } catch (error) {
        setShipList([]);
        setFilteredShipList([]);
        Alert.alert("Lỗi", "Không thể tải danh sách tàu.");
      } finally {
        setIsLoadingShips(false);
      }
    };
    fetchShips();
  }, []);

  // 2. Xử lý tìm kiếm
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const newFilteredList = shipList.filter(ship =>
      ship.name.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredShipList(newFilteredList);
  }, [searchTerm, shipList]);

  // 3. Xử lý đặt hàng
  const handleOrder = async () => {
    if (!selectedShipId) {
      Alert.alert("Lỗi", "Vui lòng chọn một tàu trước khi đặt hàng.");
      return;
    }

    setIsOrdering(true);
    try {
      const orderPayload = {
        shipId: selectedShipId,
        orderItems: [{
          productVariantId: variantId,
          quantity: 1,
          productOptionName: variantName,
        }],
      };
      await apiPost("/orders", orderPayload);
      
      const selectedShip = shipList.find(ship => ship.id === selectedShipId);
      Alert.alert("Đặt hàng thành công! 🎉", `Đã đặt 1 sản phẩm ${variantName} lên tàu ${selectedShip?.name || selectedShipId}.`);
      
      // Quay về màn hình danh sách sản phẩm hoặc chi tiết (tuỳ logic app)
      navigation.goBack(); 
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại.";
      Alert.alert("Lỗi đặt hàng", errorMessage);
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoadingShips) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003d66" />
        <Text style={styles.loadingText}>Đang tải danh sách tàu...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.shipItem,
        selectedShipId === item.id && styles.shipItemSelected,
      ]}
      onPress={() => setSelectedShipId(item.id)}
    >
      <Ionicons 
        name={selectedShipId === item.id ? "boat" : "boat-outline"} 
        size={24} 
        color={selectedShipId === item.id ? "#fff" : "#003d66"} 
        style={styles.shipIcon}
      />
      <View>
        {/* CHỈ HIỂN THỊ TÊN TÀU */}
        <Text style={[styles.shipName, selectedShipId === item.id && styles.shipNameSelected]}>
          {item.name}
        </Text>
        
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn Tàu Đặt Hàng</Text>
        <Text style={styles.headerSubtitle}>Sản phẩm: {variantName}</Text>
      </View>

      {/* Input Tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#808D9A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tàu theo tên..."
          placeholderTextColor="#808D9A"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredShipList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>
            {!isLoadingShips && (searchTerm ? "Không tìm thấy tàu phù hợp." : "Bạn chưa có tàu nào.")}
          </Text>
        )}
      />

      {/* Nút Đặt hàng */}
      <TouchableOpacity
        style={[
          styles.orderButton,
          (!selectedShipId || isOrdering) && styles.orderButtonDisabled,
        ]}
        disabled={!selectedShipId || isOrdering}
        onPress={handleOrder}
      >
        {isOrdering ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.orderButtonText}>Đặt hàng ngay</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F9FC",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F5F9FC",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#5A6A7D",
  },
  header: {
    marginBottom: 16,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C2A3A",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#003d66",
    fontWeight: "600",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9EFF5',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    marginLeft: 8,
    color: "#1C2A3A",
  },
  listContent: {
    paddingBottom: 20,
  },
  shipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EFF5',
    transitionDuration: '0.3s', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shipItemSelected: {
    backgroundColor: "#003d66", 
    borderColor: "#003d66",
    shadowOpacity: 0.2,
    elevation: 5,
  },
  shipIcon: {
    marginRight: 15,
  },
  shipName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C2A3A",
  },
  shipNameSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  shipID: {
    fontSize: 13,
    color: "#5A6A7D",
    marginTop: 2,
  },
  shipIDSelected: {
    color: "#D0E4F5",
  },
  emptyListText: {
    textAlign: 'center',
    color: '#808D9A',
    marginTop: 30,
    fontSize: 16,
    fontStyle: 'italic',
  },
  orderButton: {
    marginTop: 10,
    backgroundColor: "#003d66",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#003d66",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  orderButtonDisabled: {
    opacity: 0.5,
  },
  orderButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});

export default SelectShipScreen;