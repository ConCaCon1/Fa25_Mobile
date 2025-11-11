import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const SupplierDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupplierDetail = async () => {
      try {
        setLoading(true);
        const json = await apiGet(`/suppliers/${id}`);
        if (json?.data) {
          setSupplier(json.data);
        }
      } catch (error) {
        console.log("Error fetching supplier detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierDetail();
  }, [id]);

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003d66" />
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#5A6A7D" }}>Không tìm thấy thông tin nhà cung cấp 😢</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1C2A3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhà cung cấp</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.center}>
          <Image
            source={{
              uri:
                supplier.avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/147/147144.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{supplier.name}</Text>
          <Text style={styles.fullName}>{supplier.fullName}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#003d66" />
            <Text style={styles.infoText}>{supplier.email || "Không có email"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#003d66" />
            <Text style={styles.infoText}>{supplier.phoneNumber || "Không có số điện thoại"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#003d66" />
            <Text style={styles.infoText}>
              {supplier.address || "Không có địa chỉ"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#003d66" />
            <Text style={styles.infoText}>
              Đăng ký:{" "}
              {new Date(supplier.createdDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#1E88E5" }]}
            onPress={() => handleCall(supplier.phoneNumber)}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.actionText}>Gọi điện</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#43A047" }]}
            onPress={() => handleEmail(supplier.email)}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.actionText}>Gửi email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupplierDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C2A3A",
    marginLeft: 16,
  },
  center: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E0E6ED",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C2A3A",
  },
  fullName: {
    fontSize: 16,
    color: "#5A6A7D",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E9EFF5",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#1C2A3A",
    marginLeft: 10,
    flexShrink: 1,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});
