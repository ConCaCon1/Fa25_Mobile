import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import BottomNavBar from "../../components/BottomNavBar";
import { apiGet } from "../../ultis/api";

const NotificationScreen = ({ navigation }) => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const res = await apiGet("/ships?page=1&size=50&deleted=false");
        if (res?.data?.items) {
          setShips(res.data.items);
        }
      } catch (error) {
        console.log("Lỗi lấy danh sách tàu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShips();
  }, []);

  const handleShipPress = (ship) => {
    navigation.navigate("ShipProblem", {
      shipId: ship.id,
      shipName: ship.name,
    });
  };

  const renderShipItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleShipPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Image
          source={{
            uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
          }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.textContent}>
        <Text style={styles.shipName}>{item.name}</Text>
        <Text style={styles.shipInfo}>IMO: {item.imoNumber || "---"}</Text>
        <Text style={styles.shipInfo}>Đăng ký: {item.registerNo}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F8" />

      <View style={styles.header}>
        <Text style={styles.title}>Chọn tàu để xem sự cố</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A2540" />
        </View>
      ) : (
        <FlatList
          data={ships}
          keyExtractor={(item) => item.id}
          renderItem={renderShipItem}
          contentContainerStyle={styles.scrollContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa có tàu nào.</Text>
            </View>
          }
        />
      )}

      <BottomNavBar activeScreen="Notifications" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1C2A3A" },
  scrollContainer: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatar: { width: 40, height: 40, opacity: 0.8 },
  textContent: { flex: 1 },
  shipName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  shipInfo: { fontSize: 13, color: "#64748B" },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#64748B", fontSize: 16 },
});

export default NotificationScreen;
