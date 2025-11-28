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
import { apiGet, apiPost } from "../../ultis/api"; 

const SelectShipScreen = ({ route, navigation }) => {
  const { productId, variantId, variantName, quantity } = route.params; // ✔ THÊM quantity

  const [shipList, setShipList] = useState([]);
  const [filteredShipList, setFilteredShipList] = useState([]);
  const [selectedShipId, setSelectedShipId] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingShips, setIsLoadingShips] = useState(true);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const res = await apiGet("/ships?deleted=false");
        const ships = res.data?.items || [];
        setShipList(ships);
        setFilteredShipList(ships); 
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

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const newFilteredList = shipList.filter(ship =>
      String(ship.name).toLowerCase().includes(lowercasedTerm)
    );
    setFilteredShipList(newFilteredList);
  }, [searchTerm, shipList]);

  const handleOrder = async () => {
    if (!selectedShipId) {
      Alert.alert("Lỗi", "Vui lòng chọn một tàu trước khi đặt hàng.");
      return;
    }

    setIsOrdering(true);
    try {
      const orderPayload = {
        shipId: selectedShipId,
        orderItems: [
          {
            productVariantId: variantId,
            quantity: quantity, 
            productOptionName: variantName,
          }
        ],
      };

      await apiPost("/orders", orderPayload);
      
      const selectedShip = shipList.find(ship => ship.id === selectedShipId);
      Alert.alert(
        "Đặt hàng thành công! 🎉", 
        `Đã đặt ${quantity} sản phẩm ${String(
          variantName
        )} lên tàu ${String(selectedShip?.name || selectedShipId)}.`
      );
      
      navigation.goBack(); 
      
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại.";
      Alert.alert("Lỗi đặt hàng", errorMessage);
    } finally {
      setIsOrdering(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
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
      <View style={styles.shipInfo}>
        <Text
          style={[
            styles.shipName,
            selectedShipId === item.id && styles.shipNameSelected
          ]}
        >
          {String(item.name)}
        </Text>
      </View>
      {selectedShipId === item.id && (
        <Ionicons 
          name="checkmark-circle" 
          size={24} 
          color="#fff" 
          style={styles.checkmarkIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#1C2A3A" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Chọn Tàu Đặt Hàng</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {quantity} × {String(variantName)} {/* ✔ Hiển thị số lượng */}
          </Text>
        </View>
      </View>

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
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Ionicons name="alert-circle-outline" size={30} color="#808D9A" />
            <Text style={styles.emptyListText}>
              {!isLoadingShips &&
                (searchTerm
                  ? "Không tìm thấy tàu phù hợp."
                  : "Bạn chưa có tàu nào để đặt hàng.")}
            </Text>
          </View>
        )}
      />

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

// Styles giữ nguyên…
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F9FC",
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22, 
    fontWeight: "700",
    color: "#1C2A3A",
  },
  headerSubtitle: {
    fontSize: 14, 
    color: "#003d66",
    fontWeight: "600",
    marginTop: 2,
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
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    marginLeft: 8,
    color: "#1C2A3A",
  },

  listContent: { paddingBottom: 20 },

  shipItem: {
    flexDirection: 'row',
    alignItems: 'center', 
    padding: 18, 
    backgroundColor: "#FFFFFF",
    marginBottom: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EFF5',
  },
  shipItemSelected: {
    backgroundColor: "#003d66", 
    borderColor: "#003d66",
  },
  shipIcon: { marginRight: 15 },
  checkmarkIcon: { position: 'absolute', right: 15 },
  shipInfo: {
    flex: 1, 
    justifyContent: 'center',
    minHeight: 24, 
  },
  shipName: {
    fontSize: 18, 
    fontWeight: "600",
    color: "#1C2A3A",
  },
  shipNameSelected: { color: "#fff" },

  emptyListContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EFF5',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#808D9A',
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
  },

  orderButton: {
    marginTop: 20,
    backgroundColor: "#003d66",
    padding: 18, 
    borderRadius: 15, 
    alignItems: "center",
  },
  orderButtonDisabled: { opacity: 0.4 },
  orderButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 19, 
  },
});

export default SelectShipScreen;
