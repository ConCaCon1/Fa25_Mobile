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
const Header = ({ title, user }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <View style={styles.profileCircle}><Text style={styles.profileInitial}>{user}</Text></View>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
    <TouchableOpacity>
      <MaterialCommunityIcons name="bell-outline" size={24} color="#334155" />
    </TouchableOpacity>
  </View>
);

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
      <Header title="MaritimeHub" user="S" />
      
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#003d66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C2A3A',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#003d66',
  },
});