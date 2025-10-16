import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { apiGet } from  "../../ultis/api" ;

const BoatyardDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [boatyard, setBoatyard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoatyardDetail();
  }, [id]);

  const fetchBoatyardDetail = async () => {
    try {
      const json = await apiGet(`/boatyards/${id}`);
      if (json?.data) setBoatyard(json.data);
    } catch (error) {
      console.log("❌ Error fetching boatyard detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#003d66" />
      </View>
    );
  }

  if (!boatyard) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#5A6A7D" }}>Không tìm thấy thông tin xưởng</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4F8" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết xưởng</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              boatyard.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/147/147144.png",
          }}
          style={styles.bannerImage}
        />

        <View style={styles.infoCard}>
          <Text style={styles.boatyardName}>{boatyard.name}</Text>
          <Text style={styles.boatyardOwner}>👷 Chủ xưởng: {boatyard.fullName}</Text>
          <Text style={styles.boatyardText}>📍 Địa chỉ: {boatyard.address}</Text>
          <Text style={styles.boatyardText}>📞 Số điện thoại: {boatyard.phoneNumber}</Text>
          <Text style={styles.boatyardText}>📧 Email: {boatyard.email}</Text>
          <Text style={styles.boatyardText}>
            🕒 Ngày tạo: {new Date(boatyard.createdDate).toLocaleString("vi-VN")}
          </Text>
        </View>

        {boatyard.latitude && boatyard.longitude ? (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>🗺️ Vị trí xưởng</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(boatyard.latitude),
                longitude: parseFloat(boatyard.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(boatyard.latitude),
                  longitude: parseFloat(boatyard.longitude),
                }}
                title={boatyard.name}
                description={boatyard.address}
              />
            </MapView>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <Text style={{ color: "#5A6A7D" }}>Không có thông tin vị trí</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BoatyardDetailsScreen;

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  backBtn: {
    padding: 6,
    borderRadius: 50,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003d66",
  },
  bannerImage: {
    width: "100%",
    height: 220,
  },
  infoCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: -20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  boatyardName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C2A3A",
    marginBottom: 6,
  },
  boatyardOwner: {
    fontSize: 15,
    color: "#003d66",
    marginBottom: 8,
  },
  boatyardText: {
    color: "#5A6A7D",
    fontSize: 14,
    marginTop: 4,
  },
  mapContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    paddingBottom: 16,
  },
  mapTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1C2A3A",
    padding: 12,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
});
