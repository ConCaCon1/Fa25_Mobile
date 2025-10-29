import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiPost } from "../../ultis/api";
import GoongMapViewClickable from "../../components/GoongMapViewClickable";
import { LinearGradient } from "expo-linear-gradient"; 

const AddShipScreen = ({ navigation }) => {
  const [ship, setShip] = useState({
    name: "",
    imoNumber: "",
    registerNo: "",
    buildYear: "",
    latitude: 10.77653,
    longitude: 106.700981,
  });

  const mapRef = useRef(null);

  const handleSave = async () => {
    if (
      !ship.name ||
      !ship.imoNumber ||
      !ship.registerNo ||
      !ship.buildYear
    ) {
      return Alert.alert("Validation", "Please fill in all fields.");
    }

    const payload = {
      name: ship.name,
      imoNumber: ship.imoNumber,
      registerNo: ship.registerNo,
      buildYear: parseInt(ship.buildYear),
      latitude: ship.latitude.toString(),
      longitude: ship.longitude.toString(),
    };

    try {
      console.log("📦 Sending payload:", payload);
      await apiPost("/ships", payload);
      Alert.alert("✅ Success", "Ship added successfully!");
      navigation.goBack(); 
    } catch (error) {
      console.log("❌ Error adding ship:", error);
      Alert.alert("Error", "Failed to add ship. Please check console.");
    }
  };

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MAP_CLICK") {
        setShip((prev) => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
      }
    } catch (err) {
      console.log("Error parsing map message:", err);
    }
  };

  const renderInput = (
    key,
    placeholder,
    iconName,
    keyboardType = "default"
  ) => (
    <View style={styles.inputContainer}>
      <Ionicons
        name={iconName}
        size={20}
        color="#5A6A7D"
        style={styles.inputIcon}
      />
      <TextInput
        placeholder={placeholder}
        value={ship[key]}
        onChangeText={(text) => setShip({ ...ship, [key]: text })}
        style={styles.input}
        keyboardType={keyboardType}
        placeholderTextColor="#8A9AAD"
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4F8" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#1C2A3A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Ship</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ship Details</Text>
            {renderInput("name", "Ship Name", "boat-outline")}
            {renderInput("imoNumber", "IMO Number", "barcode-outline")}
            {renderInput("registerNo", "Register No", "document-text-outline")}
            {renderInput(
              "buildYear",
              "Build Year (e.g., 2024)",
              "calendar-outline",
              "numeric"
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Set Initial Location</Text>
            <Text style={styles.mapLabel}>
              You can type coordinates or tap on map:
            </Text>

            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <MaterialCommunityIcons
                  name="latitude"
                  size={20}
                  color="#5A6A7D"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Latitude"
                  value={ship.latitude.toString()}
                  onChangeText={(text) =>
                    setShip({ ...ship, latitude: parseFloat(text) || 0 })
                  }
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor="#8A9AAD"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <MaterialCommunityIcons
                  name="longitude"
                  size={20}
                  color="#5A6A7D"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Longitude"
                  value={ship.longitude.toString()}
                  onChangeText={(text) =>
                    setShip({ ...ship, longitude: parseFloat(text) || 0 })
                  }
                  style={styles.input}
                  keyboardType="numeric"
                  placeholderTextColor="#8A9AAD"
                />
              </View>
            </View>

            <View style={styles.mapContainer}>
              <GoongMapViewClickable
                ref={mapRef}
                latitude={ship.latitude}
                longitude={ship.longitude}
                popupText={`📍 ${ship.name || "New Ship"}`}
                onMessage={handleMapMessage}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButtonShadow}
            onPress={handleSave}
          >
            <LinearGradient
              colors={["#005691", "#003d66"]} 
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveText}>Save Ship</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddShipScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#F0F4F8", 
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#003d66", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003d66", 
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EFF5",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FA", 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1C2A3A",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  mapLabel: {
    fontSize: 14,
    color: "#5A6A7D",
    marginBottom: 12,
  },
  mapContainer: {
    height: 250, 
    borderRadius: 12,
    overflow: "hidden", 
    borderWidth: 1,
    borderColor: "#E0E6ED",
  },
  saveButtonShadow: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#003d66",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  

});