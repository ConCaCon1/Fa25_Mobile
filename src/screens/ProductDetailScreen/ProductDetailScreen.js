import { useEffect, useState, useMemo } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Share,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet, apiPost } from "../../ultis/api";

const { width } = Dimensions.get("window");

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [filterType, setFilterType] = useState("ALL");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await apiGet(`/products/${id}/reviews?page=1&size=10`);
      if (res && res.data && res.data.items) {
        setReviews(res.data.items);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitReview = async () => {
    if (!userComment.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = {
        rating: userRating,
        comment: userComment,
      };

      await apiPost(`/products/${id}/reviews`, payload);

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
      setReviewModalVisible(false);
      setUserComment("");
      setUserRating(5);

      fetchReviews();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      const message = `👋 Chào bạn, mình đang quan tâm sản phẩm này:\n\n📦 Tên SP: ${
        product.name
      }\n💰 Giá: ${priceDisplay}\n------------------\n${
        product.description ? product.description.substring(0, 100) + "..." : ""
      }\n\n👉 Bạn tư vấn thêm giúp mình nhé!`;

      await Share.share({
        message: message,
        title: "Tư vấn sản phẩm",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchReviews();
  }, []);

  const handleOrderNow = () => {
    setVariantModalVisible(true);
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

  const priceDisplay = useMemo(() => {
    if (
      !product ||
      !product.productVariants ||
      product.productVariants.length === 0
    ) {
      return "Liên hệ";
    }
    const prices = product.productVariants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString()} ₫`;
    }
    return `${minPrice.toLocaleString()} ₫ - ${maxPrice.toLocaleString()} ₫`;
  }, [product]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const counts = useMemo(() => {
    return {
      ALL: reviews.length,
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
      COMMENT: reviews.filter((r) => r.comment && r.comment.trim() !== "")
        .length,
      MEDIA: 0,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    switch (filterType) {
      case "ALL":
        return reviews;
      case "5":
        return reviews.filter((r) => r.rating === 5);
      case "4":
        return reviews.filter((r) => r.rating === 4);
      case "3":
        return reviews.filter((r) => r.rating === 3);
      case "2":
        return reviews.filter((r) => r.rating === 2);
      case "1":
        return reviews.filter((r) => r.rating === 1);
      case "COMMENT":
        return reviews.filter((r) => r.comment && r.comment.trim() !== "");
      case "MEDIA":
        return [];
      default:
        return reviews;
    }
  }, [reviews, filterType]);

  const onScrollImage = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const RenderStars = ({ rating, size = 14 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let iconName = "star-outline";
      if (rating >= i) iconName = "star";
      else if (rating >= i - 0.5) iconName = "star-half";

      stars.push(
        <Ionicons
          key={i}
          name={iconName}
          size={size}
          color="#FFD700"
          style={{ marginRight: 1 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const InteractiveStarRating = ({ rating, setRating }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setRating(item)}
            style={{ padding: 6 }}
          >
            <Ionicons
              name={item <= rating ? "star" : "star-outline"}
              size={42}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const FilterButton = ({ type, label, count }) => {
    const isActive = filterType === type;
    return (
      <TouchableOpacity
        style={[styles.filterBtn, isActive && styles.filterBtnActive]}
        onPress={() => setFilterType(type)}
      >
        <Text
          style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003d66" />
        <Text style={{ marginTop: 12, color: "#003d66", fontSize: 16 }}>
          Đang tải sản phẩm...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết sản phẩm
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#003d66" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <FlatList
            horizontal
            pagingEnabled
            data={product.productImages}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            onScroll={onScrollImage}
            renderItem={({ item }) => (
              <Image source={{ uri: item.imageUrl }} style={styles.heroImage} />
            )}
          />
          <View style={styles.pagination}>
            {product.productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeImageIndex === index
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{priceDisplay}</Text>

          <View style={styles.ratingRow}>
            <RenderStars rating={parseFloat(averageRating)} size={16} />
            <Text style={styles.ratingTextSmall}>{averageRating}/5 </Text>
            <Text style={styles.soldText}>
              {" "}
              | Đã bán {reviews.length * 3 + 12}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Thông tin chi tiết</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons
                name="shape-outline"
                size={20}
                color="#003d66"
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Danh mục</Text>
              <Text style={styles.infoValue}>{product.categoryName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={20}
                color="#003d66"
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Nhà cung cấp</Text>
              <Text style={styles.infoValue}>{product.supplierName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.reviewHeader}>
            <View>
              <Text style={styles.sectionHeader}>Đánh giá sản phẩm</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <RenderStars rating={parseFloat(averageRating)} size={14} />
                <Text
                  style={{
                    color: "#003d66",
                    fontWeight: "bold",
                    marginLeft: 6,
                  }}
                >
                  {averageRating}/5
                </Text>
                <Text style={{ color: "#888", fontSize: 12 }}>
                  {" "}
                  ({reviews.length} đánh giá)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
              <Text style={styles.writeReviewBtn}>Viết đánh giá</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterButton type="ALL" label="Tất cả" count={counts.ALL} />
              <FilterButton type="5" label="5 Sao" count={counts[5]} />
              <FilterButton type="4" label="4 Sao" count={counts[4]} />
              <FilterButton type="3" label="3 Sao" count={counts[3]} />
              <FilterButton type="2" label="2 Sao" count={counts[2]} />
              <FilterButton type="1" label="1 Sao" count={counts[1]} />
              <FilterButton
                type="COMMENT"
                label="Có Bình Luận"
                count={counts.COMMENT}
              />
            </ScrollView>
          </View>

          {filteredReviews.length === 0 ? (
            <View style={{ alignItems: "center", padding: 20 }}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={40}
                color="#DDD"
              />
              <Text style={styles.noReviewText}>Chưa có đánh giá phù hợp.</Text>
            </View>
          ) : (
            filteredReviews.map((item) => (
              <View key={item.id} style={styles.reviewItem}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.accountName
                      ? item.accountName.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>
                    {item.accountName || "Người dùng"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RenderStars rating={item.rating} size={12} />
                    <Text style={styles.reviewDate}>
                      {" "}
                      • {new Date(item.createdDate).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton}>
          <Ionicons name="chatbox-outline" size={24} color="#003d66" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>

        <View style={styles.verticalLine} />



        <TouchableOpacity style={styles.buyButton} onPress={handleOrderNow}>
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={variantModalVisible}
        onRequestClose={() => setVariantModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVariantModalVisible(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.variantModalView}>
                <View style={styles.modalHeaderBar}>
                  <Text style={styles.modalTitle}>Chọn phân loại</Text>
                  <TouchableOpacity
                    onPress={() => setVariantModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 15,
                    paddingBottom: 15,
                    borderBottomWidth: 1,
                    borderColor: "#EEE",
                  }}
                >
                  <Image
                    source={{ uri: product.productImages[0]?.imageUrl }}
                    style={styles.modalProdImage}
                  />
                  <View style={{ justifyContent: "flex-end", marginLeft: 10 }}>
                    <Text style={styles.modalPricePreview}>
                      {selectedVariantId
                        ? `${product.productVariants
                            .find((v) => v.id === selectedVariantId)
                            ?.price.toLocaleString()} ₫`
                        : priceDisplay}
                    </Text>
                    <Text style={{ color: "#666" }}>Kho: Sẵn hàng</Text>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: 250 }}>
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
                          selectedVariantId === variant.id && {
                            color: "#003d66",
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {variant.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.quantityContainer}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#1C2A3A",
                    }}
                  >
                    Số lượng
                  </Text>
                  <View style={styles.qtyBox}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Text style={{ fontSize: 18, color: "#003d66" }}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantity((q) => q + 1)}
                    >
                      <Text style={{ fontSize: 18, color: "#003d66" }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !selectedVariantId && { backgroundColor: "#8CA2B1" },
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
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.centeredViewBasic}>
            <View style={styles.reviewModalView}>
              <Text style={styles.modalTitle}>Đánh giá sản phẩm</Text>

              <View style={{ alignItems: "center", marginVertical: 15 }}>
                <InteractiveStarRating
                  rating={userRating}
                  setRating={setUserRating}
                />
                <Text
                  style={{
                    color: "#003d66",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {userRating === 5
                    ? "Tuyệt vời"
                    : userRating === 4
                    ? "Hài lòng"
                    : userRating === 3
                    ? "Bình thường"
                    : userRating === 2
                    ? "Không hài lòng"
                    : "Tệ"}
                </Text>
              </View>

              <TextInput
                style={styles.reviewInput}
                placeholder="Hãy chia sẻ nhận xét cho sản phẩm này nhé..."
                multiline
                numberOfLines={4}
                value={userComment}
                onChangeText={setUserComment}
                textAlignVertical="top"
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.modalButtonSmall,
                    { backgroundColor: "#F2F2F2" },
                  ]}
                  onPress={() => setReviewModalVisible(false)}
                >
                  <Text style={[styles.textSmallBtn, { color: "#666" }]}>
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButtonSmall,
                    { backgroundColor: "#003d66" },
                  ]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.textSmallBtn}>Gửi đánh giá</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C2A3A",
    flex: 1,
    textAlign: "center",
  },

  imageContainer: {
    position: "relative",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  heroImage: {
    width: width,
    height: 300,
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: { backgroundColor: "#003d66", width: 20 },
  inactiveDot: { backgroundColor: "rgba(255,255,255,0.7)" },

  sectionCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1C2A3A",
    marginBottom: 8,
    lineHeight: 28,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003d66",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingTextSmall: {
    fontSize: 13,
    color: "#1C2A3A",
    marginLeft: 5,
  },
  soldText: {
    fontSize: 13,
    color: "#777",
  },

  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    backgroundColor: "#E1F5FE",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#5A6A7D",
  },
  infoValue: {
    fontSize: 15,
    color: "#1C2A3A",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E9EFF5",
    marginVertical: 4,
    marginLeft: 44,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#1C2A3A",
  },
  description: {
    fontSize: 14,
    color: "#5A6A7D",
    lineHeight: 22,
    textAlign: "justify",
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  writeReviewBtn: {
    color: "#003d66",
    fontWeight: "600",
    fontSize: 14,
    paddingVertical: 5,
  },

  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9EFF5",
    backgroundColor: "#F2F6FA",
    marginRight: 8,
  },
  filterBtnActive: {
    borderColor: "#003d66",
    backgroundColor: "#E1F5FE",
  },
  filterBtnText: {
    fontSize: 13,
    color: "#5A6A7D",
  },
  filterBtnTextActive: {
    color: "#003d66",
    fontWeight: "600",
  },

  reviewItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9EFF5",
    flexDirection: "row",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E1F5FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontWeight: "bold", color: "#003d66" },
  reviewerName: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
    color: "#1C2A3A",
  },
  reviewDate: { fontSize: 11, color: "#888" },
  reviewComment: {
    marginTop: 6,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noReviewText: { color: "#888", marginTop: 10 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9EFF5",
    elevation: 10,
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  cartButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  chatButtonText: {
    fontSize: 10,
    color: "#555",
    marginTop: 2,
  },
  verticalLine: {
    width: 1,
    height: 24,
    backgroundColor: "#DDD",
  },
  buyButton: {
    flex: 1,
    backgroundColor: "#003d66",
    borderRadius: 4,
    paddingVertical: 10,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  variantModalView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: 400,
  },
  modalHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#1C2A3A" },
  modalProdImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: "#EEE",
  },
  modalPricePreview: { fontSize: 18, color: "#003d66", fontWeight: "bold" },

  variantOption: {
    padding: 10,
    backgroundColor: "#F2F6FA",
    borderRadius: 4,
    marginBottom: 8,
    marginRight: 10,
  },
  variantOptionSelected: {
    backgroundColor: "#E1F5FE",
    borderColor: "#003d66",
    borderWidth: 1,
  },
  variantName: { fontSize: 14, color: "#1C2A3A" },

  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  qtyBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E9EFF5",
    borderRadius: 4,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#F9F9F9",
  },
  qtyText: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: "500",
    color: "#1C2A3A",
  },

  confirmButton: {
    backgroundColor: "#003d66",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  centeredViewBasic: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  reviewModalView: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  reviewInput: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9EFF5",
    height: 100,
    color: "#1C2A3A",
  },
  modalButtonSmall: {
    flex: 0.48,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  textSmallBtn: { fontWeight: "600", color: "#fff" },
});