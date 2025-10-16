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
import FriendsTab from "../../components/FriendsTab";
import BottomNavBar from "../../components/BottomNavBar";
import { apiGet } from  "../../ultis/api" ;

const AccountScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("BOATYARDS");
  const [boatyards, setBoatyards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "BOATYARDS") {
      fetchBoatyards();
    }
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
          <Image source={{ uri: "https://i.pravatar.cc/300" }} style={styles.avatar} />
          <View style={styles.profileInfoContainer}>
            <Text style={styles.name}>Samantha</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={16} color="#003d66" />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.interests}>Vessel Management · Logistics · Cargo</Text>
            <Text style={styles.bio}>
              Experienced professional in maritime logistics...
              <Text style={{ color: "#003d66" }}> Detail</Text>
            </Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {["BOATYARDS", "FRIENDS", "DISCOUNT"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#003d66" style={{ marginTop: 40 }} />
        ) : activeTab === "BOATYARDS" ? (
          boatyards.length > 0 ? (
            boatyards.map((item) => (
              <TouchableOpacity key={item.id} style={styles.boatyardCard}
                onPress={() => navigation.navigate("BoatyardDetail", { id: item.id })}>
                <View style={styles.boatyardHeader}>
                  <Image
                    source={{
                      uri:
                        item.avatarUrl ||
                        "https://cdn-icons-png.flaticon.com/512/147/147144.png",
                    }}
                    style={styles.boatyardAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boatyardName}>{item.name}</Text>
                    <Text style={styles.boatyardFullName}>{item.fullName}</Text>
                  </View>
                </View>
                <Text style={styles.boatyardInfo}>📧 {item.email || "No email"}</Text>
                <Text style={styles.boatyardInfo}>📍 {item.address || "No address"}</Text>
                <Text style={styles.boatyardInfo}>📞 {item.phoneNumber || "No phone"}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTabText}>No boatyards found.</Text>
            </View>
          )
        ) : activeTab === "FRIENDS" ? (
          <FriendsTab />
        ) : (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>No discounts available yet.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavBar activeScreen="Account" navigation={navigation} />
    </SafeAreaView>
  );
};

export default AccountScreen;

// Giữ nguyên phần Style như bạn đã có
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
  boatyardCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boatyardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  boatyardAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  boatyardName: { color: "#1C2A3A", fontWeight: "700", fontSize: 15 },
  boatyardFullName: { color: "#5A6A7D", fontSize: 13 },
  boatyardInfo: { color: "#5A6A7D", fontSize: 13, marginTop: 4 },
  emptyTab: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyTabText: { fontSize: 16, color: "#5A6A7D" },
});
