import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Dimensions,
  Alert,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import BottomNavBar from "../../components/BottomNavBar";
import { apiGet } from "../../ultis/api";

const { width } = Dimensions.get("window");

const services = [
  { id: 1, name: "Vệ sinh tàu", icon: "pail", color: "#4FC3F7" },
  { id: 2, name: "Bảo trì", icon: "hammer-wrench", color: "#FFB74D" },
  { id: 3, name: "Khử trùng", icon: "spray-bottle", color: "#81C784" },
  { id: 4, name: "Sơn sửa", icon: "format-paint", color: "#BA68C8" },
];

const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  textDark: "#1D3557",
  textMedium: "#64748B",
  border: "#E2E8F0",
  danger: "#E63946",
};

const HomeScreen = ({ navigation }) => {
  const [trackingId, setTrackingId] = useState("");
  const [userName, setUserName] = useState("Thuyền viên");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [boatyards, setBoatyards] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await apiGet("/auth/profile");
        if (profileRes.status === 200 && profileRes.data) {
          setUserName(profileRes.data.fullName || "User");
          setAvatarUrl(profileRes.data.avatarUrl || "");
        }

        const boatyardRes = await apiGet("/boatyards?page=1&size=10");
        if (boatyardRes.data && boatyardRes.data.items)
          setBoatyards(boatyardRes.data.items);

        const supplierRes = await apiGet("/suppliers?page=1&size=10");
        if (supplierRes.data && supplierRes.data.items)
          setSuppliers(supplierRes.data.items);

        const productRes = await apiGet("/products?page=1&size=10");
        if (productRes.data && productRes.data.items)
          setProducts(productRes.data.items);
      } catch (error) {
        console.log("Lỗi tải dữ liệu Home:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTrackOrder = async () => {
    if (!trackingId || trackingId.trim().length === 0) {
      Alert.alert("Thông báo", "Vui lòng nhập mã vận đơn (6 ký tự cuối).");
      return;
    }

    Keyboard.dismiss();
    setIsTracking(true);

    try {
      const res = await apiGet("/orders?page=1&size=1000");

      if (res?.data?.items) {
        const orders = res.data.items;

        const foundOrder = orders.find((order) => {
          const strId = String(order.id).toLowerCase();
          const inputId = trackingId.trim().toLowerCase();
          return strId.endsWith(inputId);
        });

        if (foundOrder) {
          console.log("Tìm thấy đơn hàng:", foundOrder.id);
          navigation.navigate("OrderDetailScreen", { id: foundOrder.id });
          setTrackingId("");
        } else {
          Alert.alert(
            "Rất tiếc",
            `Không tìm thấy đơn hàng nào có mã đuôi là "${trackingId}"`
          );
        }
      } else {
        Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng.");
      }
    } catch (error) {
      console.log("Lỗi Tracking:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm kiếm đơn hàng.");
    } finally {
      setIsTracking(false);
    }
  };

  const handleProductSearchPress = () => {
    navigation.navigate("ProductListScreen");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem}>
      <View
        style={[styles.serviceIconBox, { backgroundColor: item.color + "20" }]}
      >
        <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.serviceText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCardItem = ({ item, type }) => {
    const imageSource = item.avatarUrl
      ? { uri: item.avatarUrl }
      : {
          uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
        };
    const displayAddress = item.address || "Chưa cập nhật địa chỉ";

    const handlePress = () => {
      if (type === "boatyard")
        navigation.navigate("BoatyardDetail", { id: item.id });
      else if (type === "supplier")
        navigation.navigate("SupplierDetail", { id: item.id });
    };

    return (
      <TouchableOpacity
        style={styles.cardItem}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={imageSource}
          style={styles.cardImage}
          imageStyle={{ borderRadius: 16 }}
          resizeMode="cover"
        >
          <View style={styles.cardOverlay}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={12} color="#E0F7FA" />
              <Text style={styles.cardLocation} numberOfLines={1}>
                {displayAddress}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => {
    const prodImage = item.imageUrl
      ? { uri: item.imageUrl }
      : { uri: "https://via.placeholder.com/150" };

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("ProductDetailScreen", { id: item.id })
        }
      >
        <View style={styles.productImageContainer}>
          <Image
            source={prodImage}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.categoryName}
          </Text>
          <View style={styles.productSupplierRow}>
            <MaterialCommunityIcons
              name="store"
              size={12}
              color={COLORS.secondary}
            />
            <Text style={styles.productSupplier} numberOfLines={1}>
              {" "}
              {item.supplierName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Xin chào,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate("Account")}
        >
          <Image
            source={{ uri: avatarUrl || "https://i.pravatar.cc/300" }}
            style={styles.avatar}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.sectionContainer}>
          <View style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Theo dõi đơn hàng</Text>
              <MaterialCommunityIcons
                name="radar"
                size={24}
                color={COLORS.secondary}
              />
            </View>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#94A3B8"
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập 6 ký tự cuối mã đơn..."
                placeholderTextColor="#94A3B8"
                value={trackingId}
                onChangeText={setTrackingId}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleTrackOrder}
                disabled={isTracking}
              >
                {isTracking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dịch vụ phổ biến</Text>
          <FlatList
            data={services}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Xưởng sản xuất nổi bật</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("BoatyardsList")}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {boatyards.length > 0 ? (
            <FlatList
              data={boatyards}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) =>
                renderCardItem({ item, type: "boatyard" })
              }
              keyExtractor={(item) => item.id.toString()}
            />
          ) : (
            <Text style={styles.emptyText}>
              Đang cập nhật danh sách xưởng...
            </Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linh kiện nổi bật</Text>
            <TouchableOpacity onPress={handleProductSearchPress}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {products.length > 0 ? (
            <FlatList
              data={products}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingVertical: 5 }}
            />
          ) : (
            <Text style={styles.emptyText}>Đang cập nhật sản phẩm...</Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhà cung cấp uy tín</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SupplierList")}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {suppliers.length > 0 ? (
            <FlatList
              data={suppliers}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) =>
                renderCardItem({ item, type: "supplier" })
              }
              keyExtractor={(item) => item.id.toString()}
            />
          ) : (
            <Text style={styles.emptyText}>Đang cập nhật nhà cung cấp...</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.promoBanner}
          onPress={handleProductSearchPress}
          activeOpacity={0.9}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Tìm kiếm linh kiện?</Text>
            <Text style={styles.promoSubtitle}>
              Kho phụ tùng khổng lồ đang chờ bạn.
            </Text>
            <View style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Khám phá ngay</Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name="anchor"
            size={80}
            color="rgba(255,255,255,0.2)"
            style={styles.promoIcon}
          />
        </TouchableOpacity>
      </ScrollView>
<TouchableOpacity 
  style={styles.chatFab} 
  onPress={() => navigation.navigate("ChatAIScreen")}
>
  <MaterialCommunityIcons name="robot-happy-outline" size={30} color="#fff" />
  <View style={styles.onlineBadge} />
</TouchableOpacity>
      <BottomNavBar activeScreen="Home" navigation={navigation} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greetingText: { fontSize: 14, color: COLORS.textMedium },
  userNameText: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    // backgroundColor: COLORS.danger,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  sectionContainer: { marginBottom: 25, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  seeAllText: { fontSize: 14, color: COLORS.secondary, fontWeight: "600" },
  emptyText: { color: COLORS.textMedium, fontStyle: "italic", fontSize: 13 },
  trackingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  trackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  trackingTitle: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.textDark },
  searchBtn: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceItem: { alignItems: "center", marginRight: 20, width: 70 },
  serviceIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textDark,
    textAlign: "center",
  },
  cardItem: {
    width: width * 0.65,
    height: 190,
    marginRight: 15,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 16,
  },
  cardOverlay: { padding: 12, backgroundColor: "rgba(10, 37, 64, 0.6)" },
  cardName: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  locationRow: { flexDirection: "row", alignItems: "center" },
  cardLocation: { color: "#E0F7FA", fontSize: 12, marginLeft: 4, flex: 1 },
  productCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    width: "100%",
    height: 100,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: { width: "90%", height: "90%" },
  productInfo: { justifyContent: "space-between" },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
    height: 36,
  },
  productCategory: { fontSize: 11, color: COLORS.textMedium, marginBottom: 4 },
  productSupplierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  productSupplier: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "500",
    flex: 1,
  },
  promoBanner: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  promoContent: { flex: 1, zIndex: 2 },
  promoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 5,
  },
  promoSubtitle: { fontSize: 13, color: "#CBD5E1", marginBottom: 15 },
  promoBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  promoBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 12 },
  promoIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    transform: [{ rotate: "-15deg" }],
    zIndex: 1,
  },
  chatFab: {
  position: 'absolute',
  right: 20,
  bottom: 100, // Nằm trên Bottom Bar
  backgroundColor: COLORS.secondary,
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  zIndex: 10,
},
onlineBadge: {
  position: 'absolute',
  right: 2,
  top: 2,
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#4CAF50',
  borderWidth: 2,
  borderColor: '#fff',
},
});
