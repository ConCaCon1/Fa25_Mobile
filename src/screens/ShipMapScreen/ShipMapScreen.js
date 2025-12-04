import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoongMapViewShip from "../../components/GoongMapViewShip";

const ShipMapScreen = ({ route }) => {
  const { name, latitude, longitude } = route.params;
  const navigation = useNavigation();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const isValidLocation = !isNaN(lat) && !isNaN(lng);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
      <View style={styles.container}>
        
        {isValidLocation ? (
          <GoongMapViewShip
            latitude={lat}
            longitude={lng}
            popupText={name || "Tàu không tên"}
            icon="🚤" 
            zoom={15}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={50} color="#FF6B6B" />
            <Text style={styles.errorText}>Không có tọa độ tàu</Text>
          </View>
        )}

        {/* Nút Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Info Box (Tùy chọn) */}
        <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{name}</Text>
            <Text style={styles.infoSub}>Đang hoạt động • Radar View</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default ShipMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  infoBox: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(10, 37, 64, 0.85)", // Màu xanh navy trong suốt
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 168, 232, 0.3)",
  },
  infoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoSub: {
    color: "#00A8E8",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  }
});