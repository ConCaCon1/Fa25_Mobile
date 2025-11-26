import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGet } from "../../ultis/api";

const SelectDockSlotScreen = ({ route, navigation }) => {
  const { boatyardId, boatyardName, selectedService } = route.params;
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDockSlots();
  }, [boatyardId]);

  const fetchDockSlots = async () => {
    try {
      const res = await apiGet(`/boatyards/${boatyardId}/dock-slots?page=1&size=30`);
      if (res?.data?.items) setSlots(res.data.items);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    navigation.navigate("BookingScreen", {
      boatyardId,
      boatyardName,
      selectedService,
      selectedSlot: slot,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn chỗ đậu thuyền</Text>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#003d66" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {slots.length === 0 ? (
            <Text style={styles.noSlotText}>Không có chỗ đậu thuyền khả dụng.</Text>
          ) : (
            slots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={styles.slotCard}
                onPress={() => handleSelectSlot(slot)}
              >
                <View style={styles.slotInfo}>
                  <Ionicons name="boat" size={28} color="#007BFF" style={{ marginRight: 12 }} />
                  <View>
                    <Text style={styles.slotName}>{slot.name}</Text>
                    <Text style={styles.slotDate}>
                      {slot.assignedFrom ? `Từ: ${new Date(slot.assignedFrom).toLocaleDateString('vi-VN')}` : ""}
                    </Text>
                    <Text style={styles.slotDate}>
                      {slot.assignedUntil ? `Đến: ${new Date(slot.assignedUntil).toLocaleDateString('vi-VN')}` : ""}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#C7C7CC" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SelectDockSlotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    marginRight: 10,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003d66",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  noSlotText: {
    fontSize: 16,
    color: "#8898AA",
    textAlign: "center",
    marginTop: 40,
  },
  slotCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EFF2F7",
  },
  slotInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  slotName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C2A3A",
    marginBottom: 4,
  },
  slotDate: {
    fontSize: 13,
    color: "#8898AA",
  },
});
