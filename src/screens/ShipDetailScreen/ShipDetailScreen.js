import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api"; // ✅ đúng


const ShipDetailScreen = ({ route, navigation }) => {
  const { shipId } = route.params;
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipDetail();
  }, []);

const fetchShipDetail = async () => {
  try {
    setLoading(true);
    const response = await apiGet(`/ships/${shipId}`);
    setShip(response.data || null); 
  } catch (error) {
    console.log("❌ Lỗi lấy thông tin tàu:", error);
    Alert.alert("Lỗi", "Không thể tải thông tin tàu. Thử lại sau.");
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#003d66" />
      </View>
    );
  }

  if (!ship) {
    return (
      <View style={styles.centerBox}>
        <Text>Không tìm thấy thông tin tàu 🚢</Text>
      </View>
    );
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.name}>{ship.name}</Text>
            <Text style={styles.subtitle}>IMO: {ship.imoNumber || "N/A"}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ShipMapScreen", {
                name: ship.name,
                latitude: parseFloat(ship.latitude),
                longitude: parseFloat(ship.longitude),
              })
            }
          >
            <Ionicons name="map-outline" size={28} color="#003d66" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <InfoRow icon="local-activity" label="Register No" value={ship.registerNo} />
          <InfoRow icon="business" label="Build Year" value={ship.buildYear} />
          <InfoRow
            icon="navigate-outline"
            label="Position"
            value={
              ship.latitude && ship.longitude
                ? `${parseFloat(ship.latitude).toFixed(5)}, ${parseFloat(ship.longitude).toFixed(5)}`
                : "Unknown"
            }
          />
          <InfoRow icon="person-outline" label="Captain ID" value={ship.captainId || "N/A"} />
          <InfoRow icon="calendar-outline" label="Created Date" value={formatDateTime(ship.createdDate)} />
          <InfoRow icon="time-outline" label="Last Modified" value={formatDateTime(ship.lastModifiedDate)} />
          <InfoRow icon="finger-print" label="Ship ID" value={ship.id} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    {["local-activity", "business"].includes(icon) ? (
      <MaterialIcons name={icon} size={20} color="#003d66" />
    ) : (
      <Ionicons name={icon} size={20} color="#003d66" />
    )}
    <Text style={styles.infoText}>
      {label}: {value}
    </Text>
  </View>
);

export default ShipDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: 18, fontWeight: "bold", color: "#1A202C" },
  subtitle: { fontSize: 13, color: "#718096", marginTop: 2 },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { marginLeft: 8, fontSize: 14, color: "#2D3748" },
});
