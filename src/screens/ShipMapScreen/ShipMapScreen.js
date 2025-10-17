import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ShipMapScreen = ({ route }) => {
  const { name, latitude, longitude } = route.params;
  const navigation = useNavigation();

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (!lat || !lon) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#333" }}>No coordinates available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude: lat, longitude: lon }} title={name}>
          <View style={{ alignItems: "center" }}>
            <FontAwesome5 name="ship" size={42} color="#1e90ff" />
            <View
              style={{
                width: 6,
                height: 6,
                backgroundColor: "#1e90ff",
                borderRadius: 3,
                marginTop: 2,
              }}
            />
          </View>
        </Marker>
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default ShipMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  backButton: {
    position: "absolute",
    top: 50, 
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
