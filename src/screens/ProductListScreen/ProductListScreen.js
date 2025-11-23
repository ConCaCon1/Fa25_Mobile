import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await apiGet("/products", {
        page: 1,
        size: 10,
        name: keyword,
        sortBy: "",
        isAsc: false,
      });
      setProducts(res.data.items);
    } catch (error) {
      console.log("❌ Lỗi lấy danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onSearch = () => {
    fetchProducts(search);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProductDetailScreen", { id: item.id })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={{ flex: 1, paddingLeft: 10 }}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.supplier}>{item.supplierName}</Text>
        <Text style={styles.category}>{item.categoryName}</Text>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={22}
        color="#A0AEC0"
        style={{ marginLeft: 10 }}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1C2A3A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Danh sách sản phẩm</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#5A6A7D"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm theo tên..."
          placeholderTextColor="#8A9AAD"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#003d66" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FC",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C2A3A",
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1C2A3A",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C2A3A",
    marginBottom: 2,
  },
  supplier: {
    fontSize: 14,
    color: "#5A6A7D",
    marginBottom: 3,
  },
  category: {
    fontSize: 14,
    color: "#007AFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductListScreen;
