import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const SupplierProductsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState("Nhà cung cấp");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/suppliers/${id}/products`);

        if (response?.data?.items) {
          setProducts(response.data.items);

          if (response.data.items.length > 0) {
            setSupplierName(response.data.items[0].supplierName);
          }
        }
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      // --- CẬP NHẬT PHẦN NÀY ---
      onPress={() => {
        // Điều hướng sang màn hình chi tiết và truyền ID sản phẩm
        navigation.navigate("ProductDetailScreen", { id: item.id });
      }}
      // --------------------------
    >
      <Image
        source={{
          uri: item.imageUrl || "https://via.placeholder.com/150",
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.categoryBadge}>{item.categoryName}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.dateText}>
          Ngày tạo: {new Date(item.createdDate).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1C2A3A" />
        </TouchableOpacity>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Sản phẩm
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Của: {supplierName}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#003d66" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SupplierProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EFF5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C2A3A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#5A6A7D",
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F1F3F4",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: "center",
  },
  categoryBadge: {
    fontSize: 12,
    color: "#1967D2",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C2A3A",
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    color: "#5F6368",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#9AA0A6",
    fontStyle: "italic",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#9AA0A6",
  },
});