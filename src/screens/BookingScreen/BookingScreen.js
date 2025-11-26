import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { apiPost } from "../../ultis/api";

const BookingScreen = ({ route, navigation }) => {
  const {
    boatyardId,
    boatyardName,
    selectedService,
    selectedSlot,
    selectedShip, // ⭐ ship gửi từ SelectShipDockScreen (nếu có)
  } = route.params;

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // ====== WHEN CLICK CONFIRM ======
  const handlePressConfirm = () => {
    if (!selectedShip) {
      // ⭐ Chưa chọn thuyền → chuyển sang màn hình chọn thuyền
      navigation.navigate("SelectShipDockScreen", {
        boatyardId,
        boatyardName,
        selectedService,
        selectedSlot,
        startTime,
        endTime,
      });
      return;
    }

    handleCreateBooking(); // ⭐ Nếu đã có thuyền → gọi API
  };

  // ====== CREATE BOOKING ======
  const handleCreateBooking = async () => {
    if (endTime <= startTime) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setLoading(true);

    const payload = {
      shipId: selectedShip.id, // ⭐ ship đã chọn
      dockSlotId: selectedSlot.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type: 0,
      services: Array.isArray(selectedService)
        ? selectedService.map((s) => s.id || s)
        : [selectedService.id || selectedService],
    };

    try {
      const res = await apiPost("/bookings", payload);

      Alert.alert("Thành công", "Đặt chỗ thành công!", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
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
        <Text style={styles.headerTitle}>Xác nhận đặt chỗ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Bến tàu</Text>
          <Text style={styles.infoText}>{boatyardName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Chỗ đậu</Text>
          <Text style={styles.infoText}>{selectedSlot.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thuyền</Text>
          <Text style={styles.infoText}>
            {selectedShip ? selectedShip.name : "Chưa chọn thuyền"}
          </Text>
        </View>

        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.pickerLabel}>Thời gian bắt đầu</Text>
          <Text style={styles.pickerValue}>{startTime.toLocaleString("vi-VN")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.pickerLabel}>Thời gian kết thúc</Text>
          <Text style={styles.pickerValue}>{endTime.toLocaleString("vi-VN")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={handlePressConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>
              {selectedShip ? "Xác nhận đặt chỗ" : "Chọn thuyền để tiếp tục"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="datetime"
          is24Hour={true}
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartTime(selectedDate);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="datetime"
          is24Hour={true}
          display="spinner"
          minimumDate={startTime}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndTime(selectedDate);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#003d66" },
  content: { padding: 16 },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFF2F7",
  },
  infoTitle: { fontSize: 14, color: "#8898AA", marginBottom: 4 },
  infoText: { fontSize: 16, fontWeight: "600", color: "#1C2A3A" },
  pickerBtn: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFF2F7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerLabel: { fontSize: 14, color: "#8898AA" },
  pickerValue: { fontSize: 16, color: "#1C2A3A", fontWeight: "500" },
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
