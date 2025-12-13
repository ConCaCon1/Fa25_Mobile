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
// Đảm bảo đường dẫn import này đúng với project của bạn
import { apiGet, apiPost } from "../../ultis/api";

const { width } = Dimensions.get("window");

// --- COMPONENT PHỤ: THANH TIẾN TRÌNH ĐÁNH GIÁ ---
const RatingProgressBar = ({ star, count, total }) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.progressBarRow}>
      <Text style={styles.starLabel}>{star} sao</Text>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.countLabel}>{count}</Text>
    </View>
  );
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // --- STATE CHO MODAL MUA HÀNG ---
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // State mới: Lưu trữ các Modifier đã chọn (Ví dụ: { groupId: optionId })
  const [selectedModifiers, setSelectedModifiers] = useState({});

  // --- STATE CHO REVIEW ---
  const [reviews, setReviews] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [filterType, setFilterType] = useState("ALL");

  // --- API CALLS ---
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

  useEffect(() => {
    fetchDetail();
    fetchReviews();
  }, []);

  // --- LOGIC XỬ LÝ VARIANT & MODIFIER ---

  // Lấy ra variant object hiện tại dựa trên ID đang chọn
  const currentVariant = useMemo(() => {
    if (!product || !selectedVariantId) return null;
    return product.productVariants.find((v) => v.id === selectedVariantId);
  }, [product, selectedVariantId]);

  // Khi người dùng đổi Variant hoặc đóng Modal, reset lại các modifier đã chọn và số lượng
  useEffect(() => {
    setSelectedModifiers({});
    // setQuantity(1); // Có thể bỏ comment nếu muốn reset số lượng về 1 khi đổi loại
  }, [selectedVariantId, variantModalVisible]);

  // Hàm chọn modifier
  const handleSelectModifier = (groupId, optionId) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  const handleOrderNow = () => {
    setVariantModalVisible(true);
  };

  // Logic nút "Xác nhận"
  const handleConfirmSelection = () => {
    if (!selectedVariantId) return;

    // Kiểm tra xem Variant này có Modifier Group không (Ví dụ: Màu sắc)
    // Nếu có, bắt buộc phải chọn hết các option
    if (currentVariant?.modifierGroups && currentVariant.modifierGroups.length > 0) {
        const missingGroup = currentVariant.modifierGroups.find(
            (g) => !selectedModifiers[g.id]
        );
        if (missingGroup) {
            Alert.alert("Thông báo", `Vui lòng chọn ${missingGroup.name}`);
            return;
        }
    }

    // Tạo chuỗi tên Modifier để hiển thị (VD: "Trắng, Size L")
    let modifierNames = "";
    if (currentVariant?.modifierGroups) {
        modifierNames = currentVariant.modifierGroups
            .map((g) => {
                const selectedOpt = g.modifierOptions.find(
                    (o) => o.id === selectedModifiers[g.id]
                );
                return selectedOpt ? selectedOpt.name : "";
            })
            .filter(name => name !== "")
            .join(", ");
    }

    // Lấy danh sách ID các option đã chọn để gửi lên Server
    const selectedModifierOptionIds = Object.values(selectedModifiers);

    setVariantModalVisible(false);

    // Chuyển sang màn hình Ship
    navigation.navigate("SelectShipScreen", {
      productId: product.id,
      variantId: selectedVariantId,
      variantName: currentVariant.name,
      modifierNames: modifierNames,        // Tên hiển thị
      modifierOptionIds: selectedModifierOptionIds, // ID để xử lý backend
      quantity: quantity,
      price: currentVariant.price,
    });

    setQuantity(1);
  };

  // --- REVIEW LOGIC ---
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

  // --- HELPERS HIỂN THỊ ---
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
      case "ALL": return reviews;
      case "5": return reviews.filter((r) => r.rating === 5);
      case "4": return reviews.filter((r) => r.rating === 4);
      case "3": return reviews.filter((r) => r.rating === 3);
      case "2": return reviews.filter((r) => r.rating === 2);
      case "1": return reviews.filter((r) => r.rating === 1);
      case "COMMENT": return reviews.filter((r) => r.comment && r.comment.trim() !== "");
      case "MEDIA": return [];
      default: return reviews;
    }
  }, [reviews, filterType]);

  const onScrollImage = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  // --- SUB-COMPONENTS RENDER ---
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
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
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
        <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  // --- LOADING VIEW ---
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

  // --- MAIN RENDER ---
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
        {/* HERO IMAGE */}
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

        {/* BASIC INFO */}
        <View style={styles.sectionCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{priceDisplay}</Text>

          <View style={styles.ratingRow}>
            <RenderStars rating={parseFloat(averageRating)} size={16} />
            <Text style={styles.ratingTextSmall}>{averageRating}/5 </Text>
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

        {/* --- REVIEWS SECTION --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Đánh giá sản phẩm</Text>

          {/* 1. Rating Overview */}
          <View style={styles.ratingOverviewContainer}>
            <View style={styles.ratingBigBox}>
              <Text style={styles.ratingBigText}>{averageRating}</Text>
              <View style={{ marginVertical: 4 }}>
                <RenderStars rating={parseFloat(averageRating)} size={18} />
              </View>
              <Text style={styles.ratingTotalText}>
                {reviews.length} đánh giá
              </Text>
            </View>

            <View style={styles.ratingChartBox}>
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingProgressBar
                  key={star}
                  star={star}
                  count={counts[star]}
                  total={counts.ALL}
                />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* 2. Filters */}
          <Text style={styles.filterTitle}>Lọc theo:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <FilterButton type="ALL" label="Tất cả" count={counts.ALL} />
            <FilterButton type="5" label="5 Sao" count={counts[5]} />
            <FilterButton type="4" label="4 Sao" count={counts[4]} />
            <FilterButton type="3" label="3 Sao" count={counts[3]} />
            <FilterButton type="2" label="2 Sao" count={counts[2]} />
            <FilterButton type="1" label="1 Sao" count={counts[1]} />
            <FilterButton
              type="COMMENT"
              label="Có bình luận"
              count={counts.COMMENT}
            />
          </ScrollView>

          <View style={styles.divider} />

          {/* 3. Review List Header */}
          <View style={styles.reviewListHeader}>
            <Text style={styles.reviewListTitle}>Bình luận từ khách hàng</Text>
            <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
              <Text style={styles.writeReviewLink}>Viết đánh giá</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Render Reviews */}
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyReviewContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={40}
                color="#DDD"
              />
              <Text style={styles.noReviewText}>
                Chưa có đánh giá phù hợp.
              </Text>
            </View>
          ) : (
            filteredReviews.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {item.accountName
                        ? item.accountName.charAt(0).toUpperCase()
                        : "?"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>
                      {item.accountName || "Khách hàng ẩn danh"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <RenderStars rating={item.rating} size={12} />
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(item.createdDate).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <Text style={styles.reviewContent}>{item.comment}</Text>
                <View style={styles.reviewFooter}>
                  <TouchableOpacity style={styles.helpfulBtn}>
                    <Ionicons name="thumbs-up-outline" size={14} color="#888" />
                    <Text style={styles.helpfulText}>Hữu ích?</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <View style={styles.verticalLine} />
        <TouchableOpacity style={styles.buyButton} onPress={handleOrderNow}>
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL: VARIANT SELECTION (ĐÃ CẬP NHẬT) --- */}
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
                {/* Header Modal */}
                <View style={styles.modalHeaderBar}>
                  <Text style={styles.modalTitle}>Chọn phân loại</Text>
                  <TouchableOpacity onPress={() => setVariantModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>

                {/* Info Sản phẩm thu nhỏ */}
                <View style={styles.modalProductInfo}>
                  <Image
                    source={{ uri: product.productImages[0]?.imageUrl }}
                    style={styles.modalProdImage}
                  />
                  <View style={{ justifyContent: "flex-end", marginLeft: 10 }}>
                    <Text style={styles.modalPricePreview}>
                      {selectedVariantId && currentVariant
                        ? `${currentVariant.price.toLocaleString()} ₫`
                        : priceDisplay}
                    </Text>
                    <Text style={{ color: "#666" }}>Kho: Sẵn hàng</Text>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: 300 }}>
                  {/* 1. Chọn Variant (Phân loại chính) */}
                  <Text style={styles.optionTitle}>Phân loại:</Text>
                  <View style={styles.variantListContainer}>
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
                  </View>

                  {/* 2. Chọn Modifier (Màu sắc...) - Hiển thị khi đã chọn Variant */}
                  {currentVariant &&
                    currentVariant.modifierGroups &&
                    currentVariant.modifierGroups.length > 0 && (
                      <View style={{ marginTop: 5 }}>
                        {currentVariant.modifierGroups.map((group) => (
                          <View key={group.id} style={{ marginBottom: 10 }}>
                            <Text style={styles.optionTitle}>{group.name}:</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                              {group.modifierOptions.map((option) => {
                                const isSelected = selectedModifiers[group.id] === option.id;
                                return (
                                  <TouchableOpacity
                                    key={option.id}
                                    style={[
                                      styles.modifierOption,
                                      isSelected && styles.modifierOptionSelected,
                                    ]}
                                    onPress={() => handleSelectModifier(group.id, option.id)}
                                  >
                                    <Text
                                      style={[
                                        styles.modifierText,
                                        isSelected && styles.modifierTextSelected,
                                      ]}
                                    >
                                      {option.name}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                </ScrollView>

                {/* Số lượng */}
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Số lượng</Text>
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

                {/* Nút Xác nhận */}
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (!selectedVariantId ||
                      // Kiểm tra xem đã chọn đủ modifier bắt buộc chưa
                      (currentVariant?.modifierGroups?.length > 0 &&
                        currentVariant.modifierGroups.some(
                          (g) => !selectedModifiers[g.id]
                        ))) && { backgroundColor: "#8CA2B1" },
                  ]}
                  onPress={handleConfirmSelection}
                  disabled={!selectedVariantId}
                >
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: WRITE REVIEW (Giữ nguyên) */}
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
                <Text style={{ color: "#003d66", fontWeight: "bold", fontSize: 16 }}>
                  {userRating === 5 ? "Tuyệt vời" : userRating === 4 ? "Hài lòng" : userRating === 3 ? "Bình thường" : userRating === 2 ? "Không hài lòng" : "Tệ"}
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

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.modalButtonSmall, { backgroundColor: "#F2F2F2" }]}
                  onPress={() => setReviewModalVisible(false)}
                >
                  <Text style={[styles.textSmallBtn, { color: "#666" }]}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButtonSmall, { backgroundColor: "#003d66" }]}
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
  iconButton: { padding: 5 },
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
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingTextSmall: { fontSize: 13, color: "#1C2A3A", marginLeft: 5 },

  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  infoIconBox: {
    width: 32,
    height: 32,
    backgroundColor: "#E1F5FE",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: { fontSize: 12, color: "#5A6A7D" },
  infoValue: { fontSize: 15, color: "#1C2A3A", fontWeight: "500" },
  divider: {
    height: 1,
    backgroundColor: "#E9EFF5",
    marginVertical: 4,
    marginLeft: 0,
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

  // --- REVIEW STYLES ---
  ratingOverviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  ratingBigBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: "#EEE",
  },
  ratingBigText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#003d66",
  },
  ratingTotalText: { fontSize: 12, color: "#888" },
  ratingChartBox: { flex: 1, paddingLeft: 20, justifyContent: "center" },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starLabel: { fontSize: 12, color: "#555", width: 35 },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#003d66",
    borderRadius: 3,
  },
  countLabel: {
    fontSize: 12,
    color: "#888",
    width: 25,
    textAlign: "right",
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C2A3A",
    marginBottom: 10,
    marginTop: 5,
  },
  filterContainer: { paddingBottom: 8 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9EFF5",
    backgroundColor: "#FFF",
    marginRight: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterBtnActive: { borderColor: "#003d66", backgroundColor: "#F0F8FF" },
  filterBtnText: { fontSize: 13, color: "#5A6A7D" },
  filterBtnTextActive: { color: "#003d66", fontWeight: "700" },

  reviewListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  reviewListTitle: { fontSize: 16, fontWeight: "bold", color: "#1C2A3A" },
  writeReviewLink: { fontSize: 14, color: "#003d66", fontWeight: "600" },

  emptyReviewContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 10,
  },
  noReviewText: { color: "#999", marginTop: 10 },

  reviewCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewCardHeader: { flexDirection: "row", marginBottom: 8 },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontWeight: "bold", color: "#555" },
  reviewerName: { fontWeight: "bold", color: "#333", fontSize: 14 },
  reviewDate: { fontSize: 12, color: "#888" },
  reviewContent: { fontSize: 14, color: "#444", lineHeight: 20 },
  reviewFooter: { marginTop: 8 },
  helpfulBtn: { flexDirection: "row", alignItems: "center" },
  helpfulText: { fontSize: 12, color: "#888", marginLeft: 4 },

  // --- FOOTER ---
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#EEE",
    elevation: 10,
  },
  verticalLine: { width: 1, height: 30, backgroundColor: "#DDD", marginHorizontal: 15 },
  buyButton: {
    flex: 1,
    backgroundColor: "#003d66",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // --- MODAL STYLES (CẬP NHẬT & BỔ SUNG) ---
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  variantModalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    width: "100%",
    maxHeight: "80%", // Giới hạn chiều cao modal
  },
  modalHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1C2A3A" },
  modalProductInfo: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  modalProdImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  modalPricePreview: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53935",
  },
  
  // Style cho Variant & Modifiers
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C2A3A",
    marginBottom: 8,
    marginTop: 4,
  },
  variantListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  variantOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  variantOptionSelected: { borderColor: "#003d66", backgroundColor: "#E6F0F5" },
  variantName: { fontSize: 14, color: "#333" },

  // Modifier styles (Mới)
  modifierOption: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  modifierOptionSelected: {
    borderColor: "#003d66",
    backgroundColor: "#E6F0F5",
  },
  modifierText: {
    fontSize: 13,
    color: "#333",
  },
  modifierTextSelected: {
    color: "#003d66",
    fontWeight: "600",
  },

  // Quantity styles
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 20,
  },
  quantityLabel: { fontSize: 16, fontWeight: "500", color: "#1C2A3A" },
  qtyBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DDD", borderRadius: 4 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "#F9F9F9" },
  qtyText: { paddingHorizontal: 15, fontSize: 16, fontWeight: "500", color: "#333" },

  confirmButton: {
    backgroundColor: "#003d66",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // --- REVIEW MODAL STYLES (BASIC) ---
  centeredViewBasic: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  reviewModalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    height: 100,
    marginBottom: 15,
    fontSize: 14,
  },
  modalButtonSmall: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  textSmallBtn: { fontSize: 14, color: "#fff", fontWeight: "600" },
});