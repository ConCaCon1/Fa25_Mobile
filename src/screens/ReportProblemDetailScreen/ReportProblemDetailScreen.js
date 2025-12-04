import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { apiGet, apiDelete, apiPatch } from "../../ultis/api";
import { getUserData } from "../../auth/authStorage";

const COLORS = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  primary: "#0A2540",
  secondary: "#00A8E8",
  border: "#E2E8F0",
  warning: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cardShadow: "rgba(15, 23, 42, 0.08)",
  gradientStart: "#0A2540",
  gradientEnd: "#163E5C",
  overlay: "rgba(0,0,0,0.5)",
};

const STATUS_OPTIONS = [
  { key: "Pending", label: "Chờ xử lý", icon: "clock", color: COLORS.warning },
  {
    key: "Accepted",
    label: "Đã tiếp nhận",
    icon: "check-circle",
    color: COLORS.secondary,
  },
  {
    key: "Resolved",
    label: "Đã giải quyết",
    icon: "check-square",
    color: COLORS.success,
  },
  { key: "Rejected", label: "Từ chối", icon: "x-circle", color: COLORS.danger },
];

const DetailRow = ({
  icon,
  label,
  value,
  isMultiLine = false,
  iconLibrary = "Feather",
}) => {
  const IconComponent =
    iconLibrary === "MaterialCommunityIcons" ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.detailRow}>
      <View style={styles.iconBox}>
        <IconComponent name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, isMultiLine && { lineHeight: 24 }]}>
          {value || "---"}
        </Text>
      </View>
    </View>
  );
};

const ReportProblemDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getUserData();
      setUserRole(user?.role);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiGet(`/report-problems/${id}`);
        if (res?.data) {
          setReport(res.data);
        }
      } catch (error) {
        console.log("Error fetching report detail:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin báo cáo.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Xóa báo cáo",
      "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa ngay",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              const res = await apiDelete(`/report-problems/${id}`);
              if (res.status === 200 || res.status === 204 || res.success) {
                Alert.alert("Đã xóa", "Báo cáo sự cố đã được xóa.", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa.");
              }
            } catch (error) {
              Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await apiPatch(`/report-problems/${id}`, {
        status: newStatus,
      });
      if (res.status === 200 || res.success) {
        setReport((prev) => ({ ...prev, status: newStatus }));
        setShowStatusModal(false);
        Alert.alert("Thành công", "Đã cập nhật trạng thái.");
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status) => {
    const found = STATUS_OPTIONS.find((opt) => opt.key === status);
    return (
      found || { color: COLORS.textSub, label: status, icon: "help-circle" }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={50} color={COLORS.textSub} />
        <Text style={{ color: COLORS.textSub, marginTop: 10 }}>
          Không tìm thấy báo cáo.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(report.status);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.gradientStart}
      />

      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Chi tiết sự cố
            </Text>

            {userRole === "Captain" ? (
              !deleting ? (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.iconBtn, styles.deleteHeaderBtn]}
                >
                  <Feather name="trash-2" size={20} color={COLORS.white} />
                </TouchableOpacity>
              ) : (
                <ActivityIndicator size="small" color={COLORS.white} />
              )
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            styles.statusCard,
            { borderTopColor: statusInfo.color },
          ]}
        >
          <View style={styles.statusHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[
                  styles.statusIconBox,
                  { backgroundColor: statusInfo.color + "15" },
                ]}
              >
                <Feather
                  name={statusInfo.icon}
                  size={24}
                  color={statusInfo.color}
                />
              </View>
              <View>
                <Text style={styles.statusLabel}>Trạng thái hiện tại</Text>
                <Text style={[styles.statusValue, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {userRole === "User" && (
              <TouchableOpacity
                style={styles.editStatusBtn}
                onPress={() => setShowStatusModal(true)}
              >
                <Feather name="edit-2" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.dateRow}>
            <Feather
              name="calendar"
              size={16}
              color={COLORS.textSub}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.dateText}>
              Ngày báo cáo:{" "}
              <Text style={styles.dateValue}>
                {new Date(report.createdDate).toLocaleDateString("vi-VN")}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin sự cố</Text>
          <View style={styles.divider} />
          <DetailRow
            icon="alert-triangle"
            label="Tiêu đề"
            value={report.title}
          />
          <DetailRow
            icon="file-text"
            label="Mô tả chi tiết"
            value={report.description}
            isMultiLine
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa điểm & Liên quan</Text>
          <View style={styles.divider} />
          <DetailRow
            icon="ship-wheel"
            label="Tàu gặp sự cố"
            value={report.shipName}
            iconLibrary="MaterialCommunityIcons"
          />
          <DetailRow
            icon="map-pin"
            label="Cảng ghi nhận"
            value={report.portName}
          />
          <DetailRow
            icon="user"
            label="Thuyền trưởng báo cáo"
            value={report.captainName}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showStatusModal}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>

                {STATUS_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.statusOption,
                      report.status === item.key && styles.statusOptionSelected,
                      {
                        borderColor:
                          report.status === item.key
                            ? item.color
                            : COLORS.border,
                      },
                    ]}
                    onPress={() => updateStatus(item.key)}
                    disabled={updatingStatus}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          { backgroundColor: item.color + "20" },
                        ]}
                      >
                        <Feather
                          name={item.icon}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.statusOptionText,
                          report.status === item.key && {
                            color: COLORS.textMain,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {report.status === item.key && (
                      <Feather name="check" size={20} color={item.color} />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setShowStatusModal(false)}
                >
                  <Text style={styles.closeModalText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },

  headerGradient: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteHeaderBtn: { backgroundColor: "rgba(239, 68, 68, 0.9)" },

  scrollViewContent: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 15,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 15 },

  statusCard: { borderTopWidth: 4 },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statusLabel: { fontSize: 13, color: COLORS.textSub, marginBottom: 2 },
  statusValue: { fontSize: 18, fontWeight: "800" },
  editStatusBtn: { padding: 10, backgroundColor: "#F1F5F9", borderRadius: 12 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 14, color: COLORS.textSub },
  dateValue: { color: COLORS.textMain, fontWeight: "600" },

  detailRow: { flexDirection: "row", marginBottom: 20 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: { flex: 1, justifyContent: "center" },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSub,
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: { fontSize: 16, color: COLORS.textMain, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 20,
    textAlign: "center",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusOptionSelected: { backgroundColor: "#F8FAFC", borderWidth: 2 },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusOptionText: { fontSize: 16, fontWeight: "500", color: COLORS.textSub },

  closeModalBtn: {
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  closeModalText: { fontSize: 16, fontWeight: "700", color: COLORS.textSub },

  errorButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
  },
  errorButtonText: { color: COLORS.white, fontWeight: "bold" },
});

export default ReportProblemDetailScreen;
