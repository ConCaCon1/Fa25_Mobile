import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.log("❌ Lỗi lấy chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003d66" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1C2A3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <FlatList
          horizontal
          data={product.productImages}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 16, marginBottom: 20 }}
          renderItem={({ item }) => (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          )}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📦 Danh mục: <Text style={styles.infoBold}>{product.categoryName}</Text>
            </Text>
            <Text style={styles.infoText}>
              🏪 Nhà cung cấp:{" "}
              <Text style={styles.infoBold}>{product.supplierName}</Text>
            </Text>
          </View>

          <Text style={styles.variantHeader}>
            {product.isHasVariant ? "Biến thể sản phẩm" : "Không có biến thể"}
          </Text>

          {product.productVariants.length > 0 ? (
            <View style={styles.variantList}>
              {product.productVariants.map((variant) => (
                <View key={variant.id} style={styles.variantItem}>
                  <Text style={styles.variantName}>{variant.name}</Text>
                  <Text style={styles.variantPrice}>
                    {variant.price.toLocaleString()} đ
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noVariant}>Không có biến thể nào.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FC" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#003d66",
    shadowOpacity: 0.1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C2A3A",
    marginLeft: 16,
  },

  image: {
    width: 300,
    height: 220,
    resizeMode: "cover",
    borderRadius: 16,
    marginRight: 14,
    shadowColor: "#003d66",
    shadowOpacity: 0.2,
    elevation: 5,
  },

  contentContainer: {
    paddingHorizontal: 16,
  },

  productName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C2A3A",
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    color: "#5A6A7D",
    marginBottom: 20,
    lineHeight: 22,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9EFF5",
    elevation: 4,
    shadowColor: "#003d66",
    shadowOpacity: 0.08,
  },
  infoText: {
    fontSize: 16,
    color: "#1C2A3A",
    marginBottom: 6,
  },
  infoBold: {
    fontWeight: "700",
    color: "#003d66",
  },

  variantHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C2A3A",
    marginBottom: 12,
  },

  variantList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E9EFF5",
    elevation: 3,
    shadowColor: "#003d66",
    shadowOpacity: 0.08,
    marginBottom: 20,
  },

  variantItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F7F9FA",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  variantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C2A3A",
  },

  variantPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },

  noVariant: {
    fontSize: 15,
    color: "#808D9A",
    fontStyle: "italic",
    marginTop: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
