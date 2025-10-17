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
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../../components/BottomNavBar";
import { apiGet } from "../../ultis/api";

const AccountScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("BOATYARDS");
  const [boatyards, setBoatyards] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "BOATYARDS") fetchBoatyards();
    else if (activeTab === "SHIPS") fetchShips();
  }, [activeTab]);

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

  const fetchShips = async () => {
    try {
      setLoading(true);
      const json = await apiGet("/ships?page=1&size=30");
      if (json?.data?.items) setShips(json.data.items);
    } catch (error) {
      console.log("Error fetching ships:", error);
    } finally {
      setLoading(false);
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
            uri:
              "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
          }}
          style={updatedStyles.cardAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={updatedStyles.cardTitle}>{ship.name}</Text>
          <Text style={updatedStyles.cardSubtitle}>
            IMO: **{ship.imoNumber}**
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4F8" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
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
            <Text style={styles.name}>Samantha</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={16} color="#003d66" />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
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

        {activeTab === "SHIPS" && (
          <TouchableOpacity
            style={updatedStyles.addButton}
            onPress={() => navigation.navigate("AddShipScreen")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={updatedStyles.addButtonText}>Add Ship</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#003d66"
            style={{ marginTop: 40 }}
          />
        ) : activeTab === "BOATYARDS" ? (
          boatyards.length > 0 ? (
            boatyards.map((item) => <BoatyardCard key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabText}>No boatyards found. ⚓</Text>
            </View>
          )
        ) : activeTab === "SHIPS" ? (
          ships.length > 0 ? (
            ships.map((ship) => <ShipCard key={ship.id} ship={ship} />)
          ) : (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabText}>No ships found. 🚢</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>
              No discounts available yet. 🏷️
            </Text>
          </View>
        )}
      </ScrollView>

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  },
  editText: { color: "#003d66", marginLeft: 4, fontWeight: "600" },
  interests: { color: "#5A6A7D", fontSize: 13, marginTop: 8 },
  bio: { color: "#5A6A7D", fontSize: 13, marginTop: 6 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  tabButton: { paddingVertical: 6, paddingHorizontal: 14 },
  activeTabButton: { backgroundColor: "#003d66", borderRadius: 20 },
  tabText: { color: "#5A6A7D", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: "#FFFFFF" },
  emptyTab: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyTabText: { fontSize: 16, color: "#5A6A7D" },
});

const updatedStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#003d66",
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  cardTitle: {
    color: "#1C2A3A",
    fontWeight: "700",
    fontSize: 16,
  },
  cardSubtitle: {
    color: "#5A6A7D",
    fontSize: 13,
    marginTop: 2,
  },
  infoGroup: {
    marginTop: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  cardInfoText: {
    color: "#1C2A3A",
    fontSize: 13,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003d66",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});
