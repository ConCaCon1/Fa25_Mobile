import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNavBar from "../../components/BottomNavBar";

const mockBookings = [
  {
    id: 1,
    name: "Nam Hai Shipyard",
    date: "18/11/2025",
    time: "08:00 - 17:00",
    dock: "Dock A1",
    status: "paid",
    price: "92,000,000 VND",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 2,
    name: "Bien Dong Mechanics",
    date: "18/11/2025",
    time: "09:00 - 17:00",
    dock: "Dock B2",
    status: "unpaid",
    price: "120,000,000 VND",
    image:
      "https://images.unsplash.com/photo-1603366615917-1fa6dad5c4b0?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Hoa Binh Ship Repair",
    date: "19/11/2025",
    time: "07:30 - 16:30",
    dock: "Dock C4",
    status: "canceled",
    price: "92,000,000 VND",
    image:
      "https://images.unsplash.com/photo-1501549538845-6c9ad7e9e273?auto=format&fit=crop&w=800&q=60",
  },
];

const HistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Completed");

  const filteredBookings =
    activeTab === "Completed"
      ? mockBookings.filter((b) => b.status === "paid" || b.status === "canceled")
      : mockBookings.filter((b) => b.status === "unpaid");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Booking History</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Completed" && styles.tabButtonActive]}
          onPress={() => setActiveTab("Completed")}
        >
          <Text style={[styles.tabText, activeTab === "Completed" && styles.tabTextActive]}>
            COMPLETED
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Pending" && styles.tabButtonActive]}
          onPress={() => setActiveTab("Pending")}
        >
          <Text style={[styles.tabText, activeTab === "Pending" && styles.tabTextActive]}>
            PENDING
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredBookings.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#5A6A7D" />
                <Text style={styles.detailText}>{item.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#5A6A7D" />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="anchor" size={14} color="#5A6A7D" />
                <Text style={styles.detailText}>{item.dock}</Text>
              </View>
              
              <Text style={[
                  styles.statusText,
                  item.status === 'paid' && styles.paid,
                  item.status === 'unpaid' && styles.unpaid,
                  item.status === 'canceled' && styles.canceled,
                ]}>
                {item.status === 'paid' ? `Paid: ${item.price}`
                : item.status === 'unpaid' ? `Unpaid: ${item.price}`
                : 'Canceled'}
              </Text>

              <View style={styles.actionRow}>
                {item.status === 'paid' && (
                  <TouchableOpacity style={styles.reviewBtn}>
                    <Text style={styles.reviewBtnText}>Review</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'unpaid' && (
                  <>
                    <TouchableOpacity style={styles.rejectBtn}>
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptBtn}>
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                  </>
                )}
                {item.status === 'canceled' && (
                  <TouchableOpacity style={[styles.reviewBtn, {backgroundColor: '#5A6A7D'}]}>
                    <Text style={styles.reviewBtnText}>Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <BottomNavBar activeScreen="History" navigation={navigation} />
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  tabButtonActive: {
    backgroundColor: "#003d66",
    borderColor: "#003d66",
  },
  tabText: {
    color: "#5A6A7D",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80, // Space for bottom nav
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 90,
    height: '100%',
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    color: "#1C2A3A",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    color: "#5A6A7D",
    fontSize: 13,
    marginLeft: 6,
  },
  statusText: {
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 14,
  },
  paid: { color: "#28a745" }, // Green
  unpaid: { color: "#ffc107" }, // Orange
  canceled: { color: "#dc3545" }, // Red
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  reviewBtn: {
    backgroundColor: "#003d66",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: "#dc3545",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  rejectBtnText: {
    color: "#dc3545",
    fontWeight: "600",
    fontSize: 12,
  },
  acceptBtn: {
    backgroundColor: "#28a745",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
});