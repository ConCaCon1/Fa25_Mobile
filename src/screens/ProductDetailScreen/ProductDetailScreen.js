import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const [quantity, setQuantity] = useState(1);

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

  const handleOrderNow = () => {
    setVariantModalVisible(true);
  };

  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId);
    setVariantModalVisible(false);
    navigation.navigate("SelectShipScreen", {
      productId: product.id,
      variantId: variantId,
      variantName:
        product.productVariants.find((v) => v.id === variantId)?.name || "",
    });
  };

  useEffect(() => {
    if (product && selectedVariantId) {
      const exists = product.productVariants.some(
        (v) => v.id === selectedVariantId
      );
      if (!exists) {
        setSelectedVariantId("");
      }
    }
  }, [product, selectedVariantId]);

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003d66" />
        <Text style={{ marginTop: 10, color: "#1C2A3A" }}>
          Đang tải chi tiết sản phẩm...
        </Text>
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
              <Text>📦 Danh mục: </Text>
              <Text style={styles.infoBold}>{product.categoryName}</Text>
            </Text>
            <Text style={styles.infoText}>
              <Text>🏪 Nhà cung cấp: </Text>
              <Text style={styles.infoBold}>{product.supplierName}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
          <Text style={styles.orderButtonText}>Mua hàng</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={variantModalVisible}
        onRequestClose={() => setVariantModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.variantModalView}>
            <TouchableOpacity
              style={{ position: "absolute", top: 12, right: 16, zIndex: 10 }}
              onPress={() => setVariantModalVisible(false)}
            >
              <Text style={{ fontSize: 22, color: "#888" }}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Chọn Biến thể Sản phẩm</Text>
            <Text style={styles.modalText}>
              Vui lòng chọn biến thể bạn muốn đặt hàng:
            </Text>

            <ScrollView
              style={{ width: "100%", maxHeight: 220, marginBottom: 10 }}
            >
              {product.productVariants.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantOption,
                    selectedVariantId === variant.id &&
                      styles.variantOptionSelected,
                  ]}
                  onPress={() => setSelectedVariantId(variant.id)}
                >
                  <Text
                    style={[
                      styles.variantName,
                      selectedVariantId === variant.id && { color: "#003d66" },
                    ]}
                  >
                    {variant.name}
                  </Text>
                  <Text
                    style={[
                      styles.variantPrice,
                      selectedVariantId === variant.id && { color: "#003d66" },
                    ]}
                  >
                    {variant.price.toLocaleString()} <Text>VNĐ</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, marginHorizontal: 12 }}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedVariantId && { backgroundColor: "#df2a2aff" },
              ]}
              onPress={() => {
                if (selectedVariantId) {
                  setVariantModalVisible(false);
                  const selectedVariant = product.productVariants.find(
                    (v) => v.id === selectedVariantId
                  );
                  navigation.navigate("SelectShipScreen", {
                    productId: product.id,
                    variantId: selectedVariantId,
                    variantName: selectedVariant?.name || "",
                    quantity: quantity,
                  });
                  setQuantity(1);
                }
              }}
              disabled={!selectedVariantId}
            >
              <Text style={styles.textOrder}>Mua</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F2F6FA",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  variantName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C2A3A",
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003d66",
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
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E9EFF5",
    backgroundColor: "#fff",
  },
  orderButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003d66",
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#003d66",
    shadowOpacity: 0.3,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end", // Đẩy modal xuống sát chân màn hình
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  variantModalView: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 180,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#5A6A7D",
  },
  variantOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F2F6FA",
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E9EFF5",
    width: "100%",
  },
  variantOptionSelected: {
    backgroundColor: "#E1F5FE",
    borderColor: "#007AFF",
  },
  textOrder: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButton: {
    borderRadius: 10,
    padding: 14,
    elevation: 2,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonCancel: {
    backgroundColor: "#DC3545",
  },
  textCancel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
