import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiPost } from "../../ultis/api";

const ConfirmBookingScreen = ({ route, navigation }) => {
  const {
    boatyardName,
    selectedService,   
    selectedSlot,
    selectedShip,      
  } = route.params;

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000)
  ); 

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const getServiceName = (service) => {
    if (!service) return "";
    if (Array.isArray(service)) return service.map(s => s.typeService).join(", ");
    return service.typeService;
  };

  const handleCreateBooking = async () => {
    if (endTime <= startTime) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    setLoading(true);

    const payload = {
      shipId: selectedShip.id,
      dockSlotId: selectedSlot.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type: 0,
      services: Array.isArray(selectedService)
        ? selectedService.map((s) => s.id)
        : [selectedService.id],
    };

    try {
      const res = await apiPost("/bookings", payload);

      Alert.alert("Thành công", "Đặt chỗ thành công!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi xảy ra khi đặt chỗ";
      Alert.alert("Thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt lịch</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Bến tàu</Text>
          <Text style={styles.infoValue}>{boatyardName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Chỗ đậu</Text>
          <Text style={styles.infoValue}>{selectedSlot?.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Dịch vụ</Text>
          <Text style={styles.infoValue}>{getServiceName(selectedService)}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Thuyền</Text>
          <Text style={styles.infoValue}>
            {selectedShip?.name} 
          </Text>
        </View>

        <TouchableOpacity
          style={styles.timePickerBtn}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.infoLabel}>Thời gian bắt đầu</Text>
          <Text style={styles.infoValue}>
            {startTime.toLocaleString("vi-VN")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timePickerBtn}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.infoLabel}>Thời gian kết thúc</Text>
          <Text style={styles.infoValue}>
            {endTime.toLocaleString("vi-VN")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          disabled={loading}
          onPress={handleCreateBooking}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Xác nhận đặt lịch</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="datetime"
          display="spinner"
          is24Hour={true}
          onChange={(event, selected) => {
            setShowStartPicker(false);
            if (selected) setStartTime(selected);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="datetime"
          minimumDate={startTime}
          display="spinner"
          is24Hour={true}
          onChange={(event, selected) => {
            setShowEndPicker(false);
            if (selected) setEndTime(selected);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default ConfirmBookingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    padding: 8,
    backgroundColor: "#EEF2F7",
    borderRadius: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#003d66",
  },

  content: { padding: 16 },

  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },

  infoLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#003d66" },

  timePickerBtn: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },

  confirmBtn: {
    backgroundColor: "#003d66",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  confirmBtnDisabled: { opacity: 0.7 },

  confirmText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
