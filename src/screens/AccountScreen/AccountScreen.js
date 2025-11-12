import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../../components/BottomNavBar";
import { apiGet, apiPatch } from "../../ultis/api";
import { useIsFocused } from "@react-navigation/native";
import { SwipeListView } from "react-native-swipe-list-view";

const AccountScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("SHIPS");
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (activeTab === "SHIPS" && isFocused) {
      setShips([]);
      setPage(1);
      setHasMore(true);
      fetchShips(1, true);
    }
  }, [activeTab, isFocused]);

  // 🔹 Fetch danh sách tàu
  const fetchShips = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const json = await apiGet(`/ships?page=${pageNum}&size=5&deleted=false`);
      const newShips = Array.isArray(json?.data?.items)
        ? json.data.items.filter((s) => !s.deleted)
        : [];
      setShips((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const merged = reset ? newShips : [...safePrev, ...newShips];
        const uniqueShips = merged.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
        if (newShips.length < 5) setHasMore(false);
        return uniqueShips;
      });
    } catch (err) {
      console.log("❌ Error fetching ships:", err);
      setShips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShips = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShips(nextPage);
    }
  };

  // 🔹 Đăng xuất
  const handleLogout = async () => {
    Alert.alert("Logout", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken");
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          } catch (error) {
            console.log("Logout failed:", error);
          }
        },
      },
    ]);
  };

  // 🔹 Xóa tàu
  const handleDeleteShip = async (shipId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa tàu này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await apiPatch(`/ships/${shipId}`, { deleted: true });
            setShips((prev) => prev.filter((s) => s.id !== shipId));
            Alert.alert("✅ Thành công", "Đã xóa tàu thành công!");
          } catch (error) {
            console.error("❌ Lỗi xóa tàu:", error);
            Alert.alert("❌ Thất bại", "Không thể xóa tàu. Thử lại sau.");
          }
        },
      },
    ]);
  };

  // 🔹 UI card tàu
  const ShipCard = ({ ship }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ShipMapScreen", {
          name: ship.name,
          latitude: parseFloat(ship.latitude),
          longitude: parseFloat(ship.longitude),
        })
      }
    >
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
          }}
          style={styles.cardAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{ship.name}</Text>
          <Text style={styles.cardSubtitle}>IMO: {ship.imoNumber || "N/A"}</Text>
        </View>
        <Ionicons name="map-outline" size={20} color="#003d66" />
      </View>
    </TouchableOpacity>
  );

  // 🔹 Danh sách tàu
  const renderShipList = () => (
    <SwipeListView
      data={ships || []}
      keyExtractor={(item, index) => `${item.id || index}-${index}`}
      renderItem={({ item }) => <ShipCard ship={item} />}
      renderHiddenItem={(data) => (
        <View style={styles.rowBack}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteShip(data.item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      rightOpenValue={-80}
      disableRightSwipe={true}
      onEndReached={loadMoreShips}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={
        <View style={styles.listHeaderContainer}>
          <Text style={styles.listHeaderTitle}>My Ships</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddShipScreen")}
          >
            <Ionicons name="add" size={18} color="#005691" />
            <Text style={styles.addButtonText}>Add Ship</Text>
          </TouchableOpacity>
        </View>
      }
      ListEmptyComponent={
        !loading && (
          <Text style={{ textAlign: "center", marginTop: 30 }}>
            No ships found 🚢
          </Text>
        )
      }
      ListFooterComponent={
        loading && (
          <ActivityIndicator
            size="small"
            color="#003d66"
            style={{ marginVertical: 20 }}
          />
        )
      }
    />
  );

  // 🔹 Tab Captains (chỉ hiển thị nút “Add Captain”)
  const renderCaptainPlaceholder = () => (
    <View style={styles.centerBox}>
      <Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/921/921079.png",
        }}
        style={{ width: 90, height: 90, marginBottom: 15 }}
      />
      <Text style={{ fontSize: 16, color: "#2D3748", marginBottom: 10 }}>
        No captains yet 👨‍✈️
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddCaptainScreen")}
      >
        <Ionicons name="add" size={18} color="#005691" />
        <Text style={styles.addButtonText}>Add Captain</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.bannerContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60",
          }}
          style={styles.bannerImage}
        />
        <TouchableOpacity style={styles.settingButton} onPress={handleLogout}>
          <Ionicons name="settings-outline" size={22} color="#1C2A3A" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.avatar}
        />
        <View style={styles.profileInfoContainer}>
          <Text style={styles.name}>Ship Owner</Text>
          <Text style={styles.interests}>Manage your ships & captains</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {["SHIPS", "CAPTAINS"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.listContainer}>
        {activeTab === "SHIPS" ? renderShipList() : renderCaptainPlaceholder()}
      </View>

      <BottomNavBar activeScreen="Account" navigation={navigation} />
    </SafeAreaView>
  );
};

export default AccountScreen;

// ⚙️ Styles giữ nguyên như trước
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  bannerContainer: { position: "relative", height: 180 },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  settingButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 25,
    elevation: 4,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -40,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: { width: 70, height: 70, borderRadius: 50, marginRight: 15 },
  profileInfoContainer: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold", color: "#1A202C" },
  interests: { color: "#718096", fontSize: 13, marginTop: 4 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 5,
  },
  activeTabButton: { backgroundColor: "#003d66" },
  tabText: { color: "#1A202C", fontWeight: "bold" },
  activeTabText: { color: "#FFFFFF" },
  listContainer: { flex: 1, paddingHorizontal: 15 },
  listHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  listHeaderTitle: { fontSize: 18, fontWeight: "bold", color: "#1C2A3A" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F0FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: "#005691", marginLeft: 5, fontWeight: "600" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1A202C" },
  cardSubtitle: { fontSize: 12, color: "#718096" },
  rowBack: {
    alignItems: "center",
    backgroundColor: "red",
    flex: 1,
    justifyContent: "flex-end",
    borderRadius: 12,
    marginBottom: 15,
  },
  deleteButton: {
    width: 80,
    height: "100%",
    backgroundColor: "#E53E3E",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteText: { color: "#fff", marginTop: 4, fontSize: 12 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
