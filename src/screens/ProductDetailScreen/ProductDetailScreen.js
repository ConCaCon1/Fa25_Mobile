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
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost } from "../../ultis/api"; 

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shipId, setShipId] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

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

  const handleOrder = async () => {
    if (!shipId.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập Mã tàu (ShipID).");
      return;
    }

    if (!product.isHasVariant || product.productVariants.length === 0) {
      Alert.alert(
        "Lỗi",
        "Sản phẩm này không có biến thể. Vui lòng kiểm tra lại dữ liệu."
      );
      return;
    }

    try {
      setIsOrdering(true);

      const orderItems = product.productVariants.map((variant) => ({
        productVariantId: variant.id, 
        quantity: 1, 
        productOptionName: variant.name || "", 
      }));

      const orderPayload = {
        shipId: shipId.trim(),
        orderItems: orderItems, 
      };

      const res = await apiPost("/orders", orderPayload);

      Alert.alert(
        "Đặt hàng thành công! 🎉",
        `Đã đặt hàng "${product.name}" cho Mã tàu: ${shipId.trim()}.`
      );
      setIsModalVisible(false); 
      setShipId(""); 
    } catch (error) {
      console.log("❌ Lỗi đặt hàng:", error);
      const errorMessage = error.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại.";
      Alert.alert("Lỗi đặt hàng", errorMessage);
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003d66" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
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
        {/* 2. SLIDESHOW ẢNH */}
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
              📦 Danh mục:{" "}
              <Text style={styles.infoBold}>{product.categoryName}</Text>
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <Text style={styles.orderButtonText}>Đặt hàng ngay</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nhập Mã Tàu (ShipID) 🚢</Text>
            <Text style={styles.modalText}>
              Vui lòng nhập mã tàu bạn muốn đặt hàng cho sản phẩm này.
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={setShipId}
              value={shipId}
              placeholder="Ví dụ: Tàu_HQ123"
              autoCapitalize="none"
            />
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={() => {
                  setIsModalVisible(false);
                  setShipId("");
                }}
              >
                <Text style={styles.textCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonOrderModal]}
                onPress={handleOrder}
                disabled={isOrdering || !shipId.trim()}
              >
                {isOrdering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.textOrder}>Đặt hàng</Text>
                )}
              </TouchableOpacity>
            </View>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1C2A3A",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 15,
    color: "#5A6A7D",
  },
  input: {
    height: 50,
    borderColor: "#E9EFF5",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#ccc",
  },
  textCancel: {
    color: "#1C2A3A",
    fontWeight: "bold",
  },
  buttonOrderModal: {
    backgroundColor: "#003d66",
  },
  textOrder: {
    color: "white",
    fontWeight: "bold",
  },
});