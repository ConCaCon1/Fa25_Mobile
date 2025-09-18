import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Header from "../components/Header"; 
const services = [
  { title: "Marine Freight", icon: require("../assets/marine.jpg") },
  { title: "Ocean Freight", icon: require("../assets/ocean.jpg") },
  { title: "Land Transport", icon: require("../assets/land.png") },
  { title: "Cargo Storage", icon: require("../assets/cargo.jpg") },
];

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="HomeScreen" user="S" />

      <Text style={styles.welcome}>Welcome, Samantha</Text>
      <Text style={styles.title}>Marine Tracking</Text>

      <TextInput
        style={styles.input}
        placeholder="Tracking ID"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.trackButton}>
        <Text style={styles.trackButtonText}>Tracking Now</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.servicesGrid}>
        {services.map((s, idx) => (
          <View key={idx} style={styles.serviceCard}>
            <Image source={s.icon} style={styles.serviceIcon} />
            <Text style={styles.serviceText}>{s.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/home.png")} style={[styles.navIcon, { tintColor: "#FF3B30" }]} />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/history.png")} style={styles.navIcon} />
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image source={require("../assets/account.png")} style={styles.navIcon} />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 20,          
    paddingBottom: 80,       
    paddingHorizontal: 20,   
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },
  welcome: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 2,
    marginTop: 10,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    marginHorizontal: 4,
  },
  input: {
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
    color: "#fff",
    marginHorizontal: 4,
  },
  trackButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 4,
  },
  trackButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#fff",
    marginHorizontal: 4,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "47%",
    height: 120,
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    marginBottom: 8,
    borderRadius: 8,
  },
  serviceText: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    color: "#fff",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1E1E1E",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    tintColor: "#888",
  },
  navText: {
    fontSize: 12,
    color: "#888",
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF3B30",
  },
});

