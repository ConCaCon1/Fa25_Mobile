import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { apiPost } from "../../ultis/api";
import { SafeAreaView } from "react-native-safe-area-context";

const AddShipScreen = ({ navigation }) => {
  const [ship, setShip] = useState({
    name: "",
    imoNumber: "",
    registerNo: "",
    buildYear: "",
    latitude: "10.77653",
    longitude: "106.700981",
  });

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setShip({
      ...ship,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
  };

  const handleSave = async () => {
    if (
      !ship.name ||
      !ship.imoNumber ||
      !ship.registerNo ||
      !ship.buildYear ||
      !ship.latitude ||
      !ship.longitude
    ) {
      return Alert.alert("Validation", "Please fill in all fields.");
    }

    const payload = {
      name: ship.name,
      imoNumber: ship.imoNumber,
      registerNo: ship.registerNo,
      buildYear: parseInt(ship.buildYear), 
      latitude: ship.latitude, 
      longitude: ship.longitude, 
    };

    try {
      console.log("📦 Sending payload:", payload);
      
      const res = await apiPost("/ships", payload);
      Alert.alert("✅ Success", "Ship added successfully!");
      navigation.goBack();
    } catch (error) {
      console.log("❌ Error adding ship:", error);
      Alert.alert("Error", "Failed to add ship. Please check console.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add New Ship</Text>

        {["name", "imoNumber", "registerNo", "buildYear"].map((field) => (
          <TextInput
            key={field}
            placeholder={field.replace(/([A-Z])/g, " $1").toUpperCase()}
            value={ship[field]}
            onChangeText={(text) => setShip({ ...ship, [field]: text })}
            style={styles.input}
            keyboardType={field === "buildYear" ? "numeric" : "default"}
          />
        ))}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <TextInput
              placeholder="Latitude"
              value={ship.latitude}
              onChangeText={(text) => setShip({ ...ship, latitude: text })}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Longitude"
              value={ship.longitude}
              onChangeText={(text) => setShip({ ...ship, longitude: text })}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.mapLabel}>📍 Tap on map to set location:</Text>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: parseFloat(ship.latitude),
            longitude: parseFloat(ship.longitude),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={{
              latitude: parseFloat(ship.latitude),
              longitude: parseFloat(ship.longitude),
            }}
            title={ship.name || "Ship Location"}
            pinColor="blue"
          />
        </MapView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Save Ship</Text>
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
    backgroundColor: "#F0F4F8",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#003d66",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapLabel: {
    fontSize: 14,
    color: "#1C2A3A",
    marginBottom: 6,
  },
  map: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003d66",
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
