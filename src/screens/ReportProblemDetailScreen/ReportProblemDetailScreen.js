import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet, apiDelete, apiPatch } from '../../ultis/api';
import { getUserData } from "../../auth/authStorage";

const COLORS = {
  bg: '#F8FAFC',
  white: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  primary: '#0A2540',
  secondary: '#00A8E8',
  border: '#E2E8F0',
  warning: '#F59E0B',
  success: '#10B981',
  danger: '#DC2626',
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  gradientStart: '#0A2540',
  gradientEnd: '#163E5C',
};

const STATUS_OPTIONS = ["Pending", "Accepted", "Resolved", "Rejected"];

const DetailRow = ({ icon, label, value, isMultiLine = false, iconLibrary = "Feather" }) => {
  const IconComponent = iconLibrary === "MaterialCommunityIcons" ? MaterialCommunityIcons : Feather;
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
      "Xóa báo cáo sự cố",
      "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?",
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
                Alert.alert("Đã xóa", "Báo cáo sự cố đã được xóa thành công.", [
                  { text: "OK", onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert("Lỗi", res.message || "Không thể xóa báo cáo.");
              }
            } catch (error) {
              console.log("Delete error:", error);
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
      const res = await apiPatch(`/report-problems/${id}`, { status: newStatus });

      if (res.status === 200) {
        Alert.alert("Thành công", "Cập nhật trạng thái thành công!");
        setReport(prev => ({ ...prev, status: newStatus }));
        setShowStatusModal(false);
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
      }
    } catch (error) {
      console.log("Update status error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { color: COLORS.warning, label: 'Chờ xử lý', icon: 'clock' };
      case 'Accepted': return { color: COLORS.success, label: 'Đã tiếp nhận', icon: 'check-circle' };
      case 'Rejected': return { color: COLORS.danger, label: 'Bị từ chối', icon: 'x-circle' };
      case 'Resolved': return { color: COLORS.success, label: 'Đã xử lý', icon: 'check' };
      default: return { color: COLORS.textSub, label: status, icon: 'help-circle' };
    }
  };

  if (loading || userRole === null) {
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
        <Text style={{ color: COLORS.textSub, marginTop: 10 }}>Không tìm thấy báo cáo.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(report.status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.gradientStart} />

      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết sự cố</Text>

            {userRole === "Captain" && (
              !deleting ? (
                <TouchableOpacity onPress={handleDelete} style={styles.deleteHeaderBtn}>
                  <Feather name="trash-2" size={20} color={COLORS.white} />
                </TouchableOpacity>
              ) : (
                <ActivityIndicator size="small" color={COLORS.white} />
              )
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.card, styles.statusCard, { borderTopColor: statusInfo.color }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIconBox, { backgroundColor: statusInfo.color + '15' }]}>
              <Feather name={statusInfo.icon} size={24} color={statusInfo.color} />
            </View>
            <View>
              <Text style={styles.statusLabel}>Trạng thái</Text>
              <Text style={[styles.statusValue, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.dateRow}>
             <Feather name="calendar" size={16} color={COLORS.textSub} style={{marginRight: 6}} />
             <Text style={styles.dateText}>
                Ngày tạo: <Text style={styles.dateValue}>{new Date(report.createdDate).toLocaleDateString('vi-VN')}</Text>
             </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin sự cố</Text>
          <View style={styles.divider} />
          
          <DetailRow icon="alert-triangle" label="Tiêu đề" value={report.title} />
          <DetailRow icon="file-text" label="Mô tả chi tiết" value={report.description} isMultiLine />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa điểm & Liên quan</Text>
          <View style={styles.divider} />
          
          <DetailRow icon="ship-wheel" label="Tàu gặp sự cố" value={report.shipName} iconLibrary="MaterialCommunityIcons" />
          <DetailRow icon="map-pin" label="Cảng ghi nhận" value={report.portName} />
          <DetailRow icon="user" label="Thuyền trưởng báo cáo" value={report.captainName} />
        </View>

        {userRole === "Captain" && (
          <TouchableOpacity 
            style={styles.deleteButtonLarge} 
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            {deleting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Feather name="trash-2" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Xóa báo cáo này</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {userRole === "User" && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setShowStatusModal(true)}
          >
            <Feather name="edit" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.updateButtonText}>Chỉnh sửa trạng thái</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {showStatusModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>

            {STATUS_OPTIONS.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.statusOption,
                  report.status === status && { backgroundColor: COLORS.secondary + "22" }
                ]}
                onPress={() => updateStatus(status)}
                disabled={updatingStatus}
              >
                <Text style={styles.statusOptionText}>{status}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
  
  headerGradient: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  deleteHeaderBtn: { padding: 8, backgroundColor: 'rgba(220, 38, 38, 0.8)', borderRadius: 12 },

  scrollViewContent: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textMain, marginBottom: 15 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 15 },
  statusCard: { borderTopWidth: 4 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  statusIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  statusLabel: { fontSize: 14, color: COLORS.textSub },
  statusValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, color: COLORS.textSub },
  dateValue: { color: COLORS.textMain, fontWeight: '600' },

  detailRow: { flexDirection: 'row', marginBottom: 20 },
  iconBox: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  detailContent: { flex: 1, justifyContent: 'center' },
  detailLabel: { fontSize: 13, color: COLORS.textSub, marginBottom: 4, fontWeight: '500' },
  detailValue: { fontSize: 16, color: COLORS.textMain, fontWeight: '600' },

  deleteButtonLarge: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 16, borderRadius: 16,
    marginTop: 10,
    shadowColor: COLORS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  deleteButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  updateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12
  },
  updateButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16
  },

  modalOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: "80%",
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center"
  },
  statusOption: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F1F5F9",
  },
  statusOptionText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.danger
  },
  modalCancelText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700"
  },

  errorButton: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: COLORS.secondary, borderRadius: 10 },
  errorButtonText: { color: COLORS.white, fontWeight: 'bold' }
});

export default ReportProblemDetailScreen;
