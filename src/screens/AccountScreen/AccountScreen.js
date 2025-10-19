import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../../components/BottomNavBar";
import { apiGet } from "../../ultis/api";
import { useIsFocused } from "@react-navigation/native";

const AccountScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("BOATYARDS");
  const [boatyards, setBoatyards] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (activeTab === "BOATYARDS") {
      fetchBoatyards();
    } else if (activeTab === "SHIPS") {
      setShips([]);
      setPage(1);
      setHasMore(true);
      fetchShips(1);
    }
  }, [activeTab, isFocused]);

  // Thêm một useEffect để tự động refresh khi quay lại từ AddShipScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Logic refresh chỉ khi tab SHIPS đang active
      if (activeTab === "SHIPS") {
        setShips([]);
        setPage(1);
        setHasMore(true);
        fetchShips(1);
      }
    });

    return unsubscribe;
  }, [navigation, activeTab]);


  const fetchBoatyards = async () => {
    try {
      setLoading(true);
      const json = await apiGet("/boatyards?page=1&size=30");
      if (json?.data?.items) setBoatyards(json.data.items);
    } catch (error) {
      console.log("Error fetching boatyards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShips = async (pageNum = 1) => {
    try {
      setLoading(true);
      const json = await apiGet(`/ships?page=${pageNum}&size=5`);
      if (json?.data?.items?.length > 0) {
        setShips((prev) => [...prev, ...json.data.items]);
        if (json.data.items.length < 5) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Error fetching ships:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShips = () => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchShips(next);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
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

  const BoatyardCard = ({ item }) => (
    <TouchableOpacity
      style={updatedStyles.card}
      onPress={() => navigation.navigate("BoatyardDetail", { id: item.id })}
    >
      <View style={updatedStyles.cardHeader}>
        <Image
          source={{
            uri:
              item.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/147/147144.png",
          }}
          style={updatedStyles.cardAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={updatedStyles.cardTitle}>{item.name}</Text>
          <Text style={updatedStyles.cardSubtitle}>{item.fullName}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#5A6A7D" />
      </View>
      <View style={updatedStyles.infoGroup}>
        <View style={updatedStyles.infoRow}>
          <MaterialIcons name="email" size={16} color="#003d66" />
          <Text style={updatedStyles.cardInfoText}>
            {item.email || "No email"}
          </Text>
        </View>
        <View style={updatedStyles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#003d66" />
          <Text style={updatedStyles.cardInfoText}>
            {item.address || "No address"}
          </Text>
        </View>
        <View style={updatedStyles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#003d66" />
          <Text style={updatedStyles.cardInfoText}>
            {item.phoneNumber || "No phone"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ShipCard = ({ ship }) => (
    <TouchableOpacity
      style={updatedStyles.card}
      onPress={() =>
        navigation.navigate("ShipMapScreen", {
          name: ship.name,
          latitude: parseFloat(ship.latitude),
          longitude: parseFloat(ship.longitude),
        })
      }
    >
      <View style={updatedStyles.cardHeader}>
        <Image
          source={{
            uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
          }}
          style={updatedStyles.cardAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={updatedStyles.cardTitle}>{ship.name}</Text>
          <Text style={updatedStyles.cardSubtitle}>
            IMO: {ship.imoNumber || "N/A"}
          </Text>
        </View>
        <Ionicons name="map-outline" size={20} color="#003d66" />
      </View>
      <View style={updatedStyles.infoGroup}>
        <View style={updatedStyles.infoRow}>
          <MaterialIcons name="local-activity" size={16} color="#003d66" />
          <Text style={updatedStyles.cardInfoText}>
            Register No: {ship.registerNo}
          </Text>
        </View>
        <View style={updatedStyles.infoRow}>
          <MaterialIcons name="business" size={16} color="#003d66" />
          <Text style={updatedStyles.cardInfoText}>
            Build Year: {ship.buildYear}
          </Text>
        </View>
        <View style={updatedStyles.infoRow}>
          <Ionicons name="navigate-outline" size={16} color="#003d66" />
          <Text style={updatedStyles.cardInfoText}>
            Current Pos: ({parseFloat(ship.latitude).toFixed(3)},{" "}
            {parseFloat(ship.longitude).toFixed(3)})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderShipList = () => (
    <FlatList
      data={ships}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <ShipCard ship={item} />}
      contentContainerStyle={{ paddingBottom: 100 }}
      onEndReached={loadMoreShips}
      onEndReachedThreshold={0.2}
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
      ListFooterComponent={
        loading ? (
          <ActivityIndicator
            size="small"
            color="#003d66"
            style={{ marginVertical: 20 }}
          />
        ) : null
      }
      ListEmptyComponent={
        !loading && (
          <Text style={{ textAlign: "center", marginTop: 30 }}>
            No ships found. 🚢
          </Text>
        )
      }
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4F8" }}>
      <StatusBar barStyle="dark-content" />

      {activeTab === "SHIPS" ? (
        <>
          <View style={styles.bannerContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60",
              }}
              style={styles.bannerImage}
            />
            <TouchableOpacity
              style={styles.settingButton}
              onPress={handleLogout}
            >
              <Ionicons name="settings-outline" size={22} color="#1C2A3A" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: "https://i.pravatar.cc/300" }}
              style={styles.avatar}
            />
            <View style={styles.profileInfoContainer}>
              <Text style={styles.name}>Samantha</Text>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={16} color="#003d66" />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
              <Text style={styles.interests}>
                Vessel Management · Logistics · Cargo
              </Text>
              <Text style={styles.bio}>
                Experienced professional in maritime logistics...
                <Text style={{ color: "#003d66" }}> Detail</Text>
              </Text>
            </View>
          </View>

          <View style={styles.tabRow}>
            {["BOATYARDS", "SHIPS", "DISCOUNT"].map((tab) => (
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

          {renderShipList()}
        </>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bannerContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60",
              }}
              style={styles.bannerImage}
            />
            <TouchableOpacity
              style={styles.settingButton}
              onPress={handleLogout}
            >
              <Ionicons name="settings-outline" size={22} color="#1C2A3A" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: "https://i.pravatar.cc/300" }}
              style={styles.avatar}
            />
            <View style={styles.profileInfoContainer}>
              <Text style={styles.name}>Samantha</Text>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={16} color="#003d66" />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
              <Text style={styles.interests}>
                Vessel Management · Logistics · Cargo
              </Text>
              <Text style={styles.bio}>
                Experienced professional in maritime logistics...
                <Text style={{ color: "#003d66" }}> Detail</Text>
              </Text>
            </View>
          </View>

          <View style={styles.tabRow}>
            {["BOATYARDS", "SHIPS", "DISCOUNT"].map((tab) => (
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

          {activeTab === "BOATYARDS" &&
            (boatyards.length > 0 ? (
              boatyards.map((item) => (
                <BoatyardCard key={item.id} item={item} />
              ))
            ) : (
              <Text style={{ textAlign: "center", marginTop: 40 }}>
                No boatyards found ⚓
              </Text>
            ))}

          {activeTab === "DISCOUNT" && (
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              No discounts available yet 🏷️
            </Text>
          )}
        </ScrollView>
      )}

      <BottomNavBar activeScreen="Account" navigation={navigation} />
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  bannerContainer: { position: "relative" },
  bannerImage: { width: "100%", height: 150 },
  settingButton: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 6,
    borderRadius: 20,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#003d66",
  },
  profileInfoContainer: { flex: 1 },
  name: { color: "#1C2A3A", fontWeight: "700", fontSize: 18 },
  buttonRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  editButton: {
    backgroundColor: "#E9EFF5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start', // Giữ nút co lại
  },
  editText: { color: "#003d66", marginLeft: 4, fontWeight: "600" },
  interests: { color: "#5A6A7D", fontSize: 13, marginTop: 8 },
  bio: { color: "#5A6A7D", fontSize: 13, marginTop: 6 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTabButton: {
    backgroundColor: "#003d66",
    shadowColor: "#003d66",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
  },
  tabText: {
    color: "#5A6A7D",
    fontSize: 13,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  emptyTab: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyTabText: { fontSize: 16, color: "#5A6A7D" },
  listHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C2A3A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EFF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#005691",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
});

const updatedStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9EFF5",
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EFF5",
  },
  cardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  cardTitle: {
    color: "#1C2A3A",
    fontWeight: "700",
    fontSize: 17,
  },
  cardSubtitle: {
    color: "#5A6A7D",
    fontSize: 13,
    marginTop: 2,
  },
  infoGroup: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  cardInfoText: {
    color: "#5A6A7D",
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1, // Giúp text tự xuống hàng nếu quá dài
  },
});