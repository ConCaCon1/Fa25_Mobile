import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import GoongMapView from "../../components/GoongMapView";
import { SafeAreaView } from "react-native-safe-area-context";
const ShipMapScreen = ({ route }) => {
  const { name, latitude, longitude } = route.params;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
    <View style={styles.container}>
      <GoongMapView
        latitude={parseFloat(latitude)}
        longitude={parseFloat(longitude)}
        popupText={name || "Tàu không rõ tên"}
        icon="🛳"
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default ShipMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
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
