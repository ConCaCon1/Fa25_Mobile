import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNavBar from "../../components/BottomNavBar";
import Header from "../../components/Header";

const factories = [
  { id: 1, name: "Xưởng", image: require("../../assets/boatyard.png") },
];

const suppliers = [
  { id: 1, name: "Nhà Cung Cấp", image: require("../../assets/supplier.jpg") },
];

const HomeScreen = ({ navigation }) => {
  const [trackingId] = React.useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="MaritimeHub" user="S" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome back, Samantha</Text>

          <View style={styles.trackingCard}>
            <Text style={styles.cardTitle}>Marine Tracking</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="#A0AEC0"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Tracking ID"
                placeholderTextColor="#A0AEC0"
                value={trackingId}
              />
            </View>
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featureSection}>
            {/* ----------- Cột XƯỞNG ----------- */}
            <View style={styles.featureColumn}>
              <View style={styles.featureBox}>
                <View style={styles.boxHeader}>
                  <Text style={styles.boxTitle}>TÌM XƯỞNG SẢN XUẤT</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BoatyardsList")}
                  >
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="#005f73"
                    />
                  </TouchableOpacity>
                </View>

                {factories.map((item, index) => (
                  <TouchableOpacity
                    key={`factory-item-${item.id}-${index}`}
                    style={[
                      styles.itemCard,
                      index === factories.length - 1 && { marginBottom: 0 },
                    ]}
                    onPress={() => navigation.navigate("BoatyardsList")}
                  >
                    <Image source={item.image} style={styles.itemImage} />
                    <View style={styles.itemOverlay} />
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ----------- Cột NHÀ CUNG CẤP ----------- */}
            <View style={styles.featureColumn}>
              <View style={styles.featureBox}>
                <View style={styles.boxHeader}>
                  <Text style={styles.boxTitle}>TÌM NHÀ CUNG CẤP</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("SupplierList")}
                  >
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="#005f73"
                    />
                  </TouchableOpacity>
                </View>

                {suppliers.map((item, index) => (
                  <TouchableOpacity
                    key={`supplier-item-${item.id}-${index}`}
                    style={[
                      styles.itemCard,
                      index === suppliers.length - 1 && { marginBottom: 0 },
                    ]}
                    onPress={() => navigation.navigate("SupplierList")}
                  >
                    <Image source={item.image} style={styles.itemImage} />
                    <View style={styles.itemOverlay} />
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.placeholderCard}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={32}
              color="#A0AEC0"
            />
            <View style={styles.placeholderTextBox}>
              <Text style={styles.placeholderText}>Tìm kiếm Sản phẩm</Text>
              <Text style={styles.placeholderSubText}>
                Tính năng sắp ra mắt
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar activeScreen="Home" navigation={navigation} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A202C",
    marginTop: 10,
    marginBottom: 20,
  },
  trackingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 15,
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#1C2A3A",
  },
  trackButton: {
    backgroundColor: "#003d66",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  featureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    alignItems: "flex-start",
  },
  featureColumn: {
    width: "48.5%",
  },
  featureBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  boxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  boxTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2D3748",
  },
  itemCard: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  itemImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  itemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  itemText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
    margin: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  placeholderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderTextBox: {
    marginLeft: 15,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A5568",
  },
  placeholderSubText: {
    fontSize: 13,
    color: "#A0AEC0",
    marginTop: 2,
  },
});
