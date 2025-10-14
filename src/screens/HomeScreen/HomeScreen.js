import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  Platform, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNavBar from "../../components/BottomNavBar";
import Header from "../../components/Header"; 

const services = [
  { title: "Marine Freight", icon: require("../../assets/marine.jpg") },
  { title: "Ocean Freight", icon: require("../../assets/ocean.jpg") },
  { title: "Land Transport", icon: require("../../assets/land.png") },
  { title: "Cargo Storage", icon: require("../../assets/cargo.jpg") },
];

const HomeScreen = ({navigation}) => {
  const [trackingId, setTrackingId] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="MaritimeHub" user="S" navigation={navigation} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome back, Samantha</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Marine Tracking</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="magnify" size={22} color="#A0AEC0" style={styles.inputIcon}/>
              <TextInput
                style={styles.input}
                placeholder="Enter Tracking ID"
                placeholderTextColor="#A0AEC0"
                value={trackingId}
                onChangeText={setTrackingId}
              />
            </View>
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Now</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <TouchableOpacity key={index} style={styles.serviceCard}>
                <Image source={service.icon} style={styles.serviceIcon} />
                <Text style={styles.serviceText}>{service.title}</Text>
              </TouchableOpacity>
            ))}
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
    backgroundColor: '#F0F4F8',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C2A3A',
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C2A3A',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#1C2A3A',
  },
  trackButton: {
    backgroundColor: '#003d66',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C2A3A',
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
  },
  serviceText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
  },
});