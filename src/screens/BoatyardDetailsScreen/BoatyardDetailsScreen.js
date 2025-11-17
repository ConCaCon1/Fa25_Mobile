import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";
import GoongMapView from "../../components/GoongMapView"; 

const DetailItem = ({ iconName, label, value }) => (
  <View style={styles.detailItemContainer}>
    <View style={styles.detailItemIconBg}>
      <Feather name={iconName} size={20} color="#007BFF" />
    </View>
    <View style={styles.detailItemTextContainer}>
      <Text style={styles.detailItemLabel}>{label}</Text>
      <Text style={styles.detailItemValue}>{value}</Text>
    </View>
  </View>
);

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

  const handlePressCall = () => {
    if (boatyard?.phoneNumber) Linking.openURL(`tel:${boatyard.phoneNumber}`);
  };

  const handlePressEmail = () => {
    if (boatyard?.email) Linking.openURL(`mailto:${boatyard.email}`);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              boatyard.avatarUrl ||
              "https://images.unsplash.com/photo-1556912173-356d73534346?q=80&w=2070&auto=format&fit=crop",
          }}
          style={styles.bannerImage}
        />

        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.boatyardName}>{boatyard.name}</Text>
            <View style={styles.ownerSection}>
              <Feather name="user" size={16} color="#607D8B" />
              <Text style={styles.boatyardOwner}>Chủ xưởng: {boatyard.fullName}</Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePressCall}
              activeOpacity={0.8}
            >
              <Feather name="phone-call" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Gọi điện</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.emailButton]}
              onPress={handlePressEmail}
              activeOpacity={0.8}
            >
              <Feather name="mail" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Gửi Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <DetailItem iconName="map-pin" label="Địa chỉ" value={boatyard.address} />
            <DetailItem
              iconName="clock"
              label="Ngày tham gia"
              value={new Date(boatyard.createdDate).toLocaleDateString("vi-VN")}
            />
          </View>
        </View>

        {/* ✅ Dùng GoongMapView thay cho MapView */}
        <View style={styles.mapCard}>
          <Text style={styles.sectionTitle}>🗺️ Vị trí trên bản đồ</Text>
          {boatyard.latitude && boatyard.longitude ? (
            <View style={styles.mapWrapper}>
              <GoongMapView
                latitude={parseFloat(boatyard.latitude)}
                longitude={parseFloat(boatyard.longitude)}
                popupText={boatyard.name}
                icon="🏭"
                zoom={14}
              />
            </View>
          ) : (
            <Text style={{ color: "#607D8B" }}>Không có thông tin vị trí</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BoatyardDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FC",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "android" ? 20 : 50,
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 8,
    borderRadius: 50,
  },
  bannerImage: {
    width: "100%",
    height: 250,
  },
  contentContainer: {
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: "#F4F7FC",
  },
  titleSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#9FB1C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  boatyardName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A2533",
    marginBottom: 8,
  },
  ownerSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  boatyardOwner: {
    fontSize: 15,
    color: "#607D8B",
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  emailButton: {
    backgroundColor: "#17A2B8",
    shadowColor: "#17A2B8",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#9FB1C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1A2533",
    marginBottom: 16,
  },
  detailItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailItemIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailItemTextContainer: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 13,
    color: "#607D8B",
    marginBottom: 4,
  },
  detailItemValue: {
    fontSize: 15,
    color: "#263238",
    lineHeight: 22,
  },
  mapCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#9FB1C8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  mapWrapper: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
});
