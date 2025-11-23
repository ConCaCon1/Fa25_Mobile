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
import * as Clipboard from "expo-clipboard";
import { apiGet, apiPost, apiDelete } from "../../ultis/api";

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const handleAddCaptain = async (shipId) => {
    try {
      const email = await new Promise((resolve) => {
        Alert.prompt(
          "Add Captain",
          "Nhập email Captain",
          [
            { text: "Cancel", style: "cancel" },
            { text: "OK", onPress: resolve },
          ],
          "plain-text"
        );
      });

      if (!email) return;

      setLoading(true);
      await apiPost(`/ships/${shipId}/captains`, { email });
      Alert.alert("Success", "Đã thêm Captain thành công");
      fetchShipDetail();
    } catch (error) {
      console.log("❌ Lỗi thêm Captain:", error);
      Alert.alert("Lỗi", "Không thể thêm Captain. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCaptain = async (shipId) => {
    Alert.alert(
      "Xóa Captain",
      "Bạn có chắc muốn xóa Captain khỏi tàu?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              setLoading(true);
              await apiDelete(`/ships/${shipId}/captains`);
              Alert.alert("Success", "Đã xóa Captain");
              fetchShipDetail();
            } catch (error) {
              console.log("❌ Lỗi xoá Captain:", error);
              Alert.alert("Lỗi", "Không thể xoá Captain. Thử lại sau.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Chi tiết tàu</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://png.pngtree.com/png-vector/20250728/ourlarge/pngtree-vintage-trawler-fishing-boat-vector-icon-element-png-image_16880913.webp",
            }}
            style={styles.avatar}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.name}>{ship.name}</Text>
            <Text style={styles.subtitle}>IMO: {ship.imoNumber || "N/A"}</Text>
          </View>

          <View style={styles.headerActions}>
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
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Thông tin tàu</Text>

          <InfoRow icon="local-activity" label="Register No" value={ship.registerNo} />
          <InfoRow icon="business" label="Build Year" value={ship.buildYear} />

          {/* ➕ SHIP ID + NÚT COPY */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowLabel}>
              <Ionicons name="pricetag-outline" size={20} color="#003d66" />
              <Text style={styles.infoLabelText}>Ship ID</Text>
            </View>

            <View style={styles.copyRow}>
              <Text style={styles.copyText}>{ship.id}</Text>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  Clipboard.setStringAsync(ship.id);
                  Alert.alert("Copied!", "Ship ID đã được copy.");
                }}
              >
                <Ionicons name="copy-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Trạng thái</Text>

          <InfoRow
            icon="navigate-outline"
            label="Position"
            value={
              ship.latitude && ship.longitude
                ? `${parseFloat(ship.latitude).toFixed(5)}, ${parseFloat(ship.longitude).toFixed(5)}`
                : "Unknown"
            }
          />

          {/* CAPTAIN */}
          <View style={styles.infoRow}>
            <View style={styles.infoRowLabel}>
              <Ionicons name="person-outline" size={20} color="#003d66" />
              <Text style={styles.infoLabelText}>Captain</Text>
            </View>

            {ship.captainId ? (
              <View style={styles.captainContainerFixed}>
                <Text style={styles.captainTextWrapped}>{ship.captainId}</Text>

                <TouchableOpacity
                  onPress={() => handleRemoveCaptain(ship.id)}
                  style={styles.removeCaptainButton}
                >
                  <Text style={styles.removeCaptainText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleAddCaptain(ship.id)}
                style={styles.addCaptainButton}
              >
                <Text style={styles.addCaptainText}>＋</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Hệ thống</Text>
          <InfoRow icon="calendar-outline" label="Created Date" value={formatDateTime(ship.createdDate)} />
          <InfoRow icon="time-outline" label="Last Modified" value={formatDateTime(ship.lastModifiedDate)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoRowLabel}>
      {["local-activity", "business"].includes(icon) ? (
        <MaterialIcons name={icon} size={20} color="#003d66" />
      ) : (
        <Ionicons name={icon} size={20} color="#003d66" />
      )}
      <Text style={styles.infoLabelText}>{label}</Text>
    </View>
    <Text style={styles.infoValueText}>{value}</Text>
  </View>
);

export default ShipDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  scrollContainer: { padding: 15 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#003d66",
    fontWeight: "bold",
    marginRight: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "bold", color: "#1A202C" },
  subtitle: { fontSize: 13, color: "#718096", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center" },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003d66",
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoRowLabel: { flexDirection: "row", alignItems: "center" },
  infoLabelText: { marginLeft: 10, fontSize: 14, color: "#4A5568" },
  infoValueText: {
    fontSize: 14,
    color: "#1A202C",
    fontWeight: "500",
    textAlign: "right",
  },

  /* COPY SHIP ID */
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyText: {
    maxWidth: 150,
    fontSize: 14,
    color: "#1A202C",
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: "#003d66",
    padding: 6,
    borderRadius: 8,
  },

  addCaptainButton: {
    backgroundColor: "#003d66",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addCaptainText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  captainContainerFixed: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "70%",
  },

  captainTextWrapped: {
    flexShrink: 1,
    flexWrap: "wrap",
    maxWidth: "85%",
    fontSize: 14,
    color: "#1A202C",
    fontWeight: "500",
    textAlign: "right",
    marginRight: 10,
  },

  removeCaptainButton: {
    backgroundColor: "#cc0000",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeCaptainText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
