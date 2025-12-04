import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "@env";
import { getToken } from "../../auth/authStorage";
import { apiGet } from "../../ultis/api";

// Bảng màu đã điều chỉnh nhẹ để tạo chiều sâu
const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  bg: "#F5F7FA", // Màu nền xám nhạt hơn một chút
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  border: "#E2E8F0",
  inputBg: "#F8FAFC", // Nền input sáng hơn
  danger: "#FF4D4F",
  shadow: "rgba(10, 37, 64, 0.08)", // Màu bóng đổ nhẹ
};

const EditProfileScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // States cho đổi mật khẩu
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiGet("/auth/profile");
        if (res?.data) {
          setFullName(res.data.fullName || "");
          setPhoneNumber(res.data.phoneNumber || "");
          setAddress(res.data.address || "");
          setAvatar(res.data.avatarUrl || null);
        }
      } catch (error) {
        console.log("Lỗi load profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAvatar(asset.uri);
      const fileName = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image`;

      setAvatarFile({
        uri: asset.uri,
        name: fileName,
        type: type,
      });
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      
      formData.append("FullName", fullName);
      formData.append("PhoneNumber", phoneNumber);
      formData.append("Address", address);

      if (avatarFile) {
        formData.append("AvatarUrl", {
          uri: Platform.OS === 'ios' ? avatarFile.uri.replace('file://', '') : avatarFile.uri,
          name: avatarFile.name,
          type: avatarFile.type,
        });
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseJson = await response.json();

      if (response.ok) {
        Alert.alert("Thành công", "Cập nhật hồ sơ thành công!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Thất bại", responseJson.message || "Không thể cập nhật hồ sơ.");
      }

    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM ĐỔI MẬT KHẨU ---
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu cũ và mới.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = await getToken();
      // Gọi API PATCH /accounts/password
      const response = await fetch(`${API_BASE_URL}/accounts/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công!");
        setModalVisible(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        const data = await response.json();
        Alert.alert("Thất bại", data.message || "Mật khẩu cũ không đúng.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi đổi mật khẩu.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarShadow}>
            <Image
              source={{ uri: avatar || "https://i.pravatar.cc/300" }}
              style={styles.avatar}
            />
          </View>
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage} activeOpacity={0.8}>
            <Feather name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Chạm để thay đổi ảnh</Text>
        </View>

        {/* Card chứa thông tin chính */}
        <View style={styles.cardContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ tên"
                placeholderTextColor={COLORS.textSub}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={20} color={COLORS.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.textSub}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Địa chỉ</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingVertical: 12 }]}>
              <Feather name="map-pin" size={20} color={COLORS.secondary} style={[styles.inputIcon, { marginTop: 2 }]} />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ"
                placeholderTextColor={COLORS.textSub}
                multiline
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconBg}>
              <Feather name="lock" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Đổi mật khẩu</Text>
          <Feather name="chevron-right" size={20} color={COLORS.textSub} />
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleUpdateProfile}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>

  
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* 1. Thêm KeyboardAvoidingView ở đây */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* 2. TouchableWithoutFeedback để bấm ra ngoài ẩn bàn phím */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              
              {/* Vùng nội dung Modal */}
              {/* Thêm sự kiện onPress rỗng để chặn sự kiện click xuyên qua đóng bàn phím khi bấm vào chính modal */}
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Bảo mật tài khoản</Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeBtn}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={COLORS.textSub}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalSubtitle}>
                    Vui lòng nhập mật khẩu hiện tại để thiết lập mật khẩu mới.
                  </Text>

                  <View style={styles.modalBody}>
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.label}>Mật khẩu cũ</Text>
                      <View style={styles.inputWrapper}>
                        <Feather
                          name="lock"
                          size={20}
                          color={COLORS.textSub}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={oldPassword}
                          onChangeText={setOldPassword}
                          placeholder="••••••"
                          secureTextEntry={!showOldPass}
                        />
                        <TouchableOpacity
                          onPress={() => setShowOldPass(!showOldPass)}
                        >
                          <Feather
                            name={showOldPass ? "eye" : "eye-off"}
                            size={20}
                            color={COLORS.textSub}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.label}>Mật khẩu mới</Text>
                      <View style={styles.inputWrapper}>
                        <Feather
                          name="key"
                          size={20}
                          color={COLORS.textSub}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Tối thiểu 6 ký tự"
                          secureTextEntry={!showNewPass}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPass(!showNewPass)}
                        >
                          <Feather
                            name={showNewPass ? "eye" : "eye-off"}
                            size={20}
                            color={COLORS.textSub}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleChangePassword}
                      disabled={passwordLoading}
                      activeOpacity={0.8}
                    >
                      {passwordLoading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.confirmBtnText}>
                          Cập nhật mật khẩu
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: COLORS.bg,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textMain },
  backBtn: { padding: 8, marginLeft: -8, backgroundColor: COLORS.white, borderRadius: 12 },

  content: { padding: 20 },

  // --- AVATAR STYLES (Nâng cấp) ---
  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatarShadow: {
    borderRadius: 60,
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 12,
    backgroundColor: COLORS.white,
    padding: 4,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  cameraIcon: {
    position: "absolute", bottom: 20, right: "33%",
    backgroundColor: COLORS.secondary, padding: 10, borderRadius: 25,
    borderWidth: 3, borderColor: COLORS.white,
    elevation: 5,
  },
  avatarHint: { marginTop: 15, color: COLORS.textSub, fontSize: 14, fontWeight: '500' },

  // --- FORM STYLES (Dạng thẻ) ---
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  inputGroup: { 
    marginBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.bg, 
    paddingBottom: 15 
  },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textMain, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 15, color: COLORS.textMain, fontWeight: '500' },

  // --- ACTION BUTTON (Đổi mật khẩu) ---
  actionButton: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: COLORS.white,
      padding: 16, borderRadius: 16,
      marginBottom: 20,
      elevation: 2,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
  },
  actionIconBg: {
    width: 40, height: 40, backgroundColor: '#EDF2F7', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  actionText: { fontSize: 16, fontWeight: '600', color: COLORS.textMain, flex: 1 },

  // --- FOOTER ---
  footer: { 
    padding: 20, 
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, height: 56, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  saveBtnText: { color: COLORS.white, fontSize: 17, fontWeight: "bold" },

  // --- MODAL STYLES (Nâng cấp) ---
  modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  modalContainer: {
      width: '100%', backgroundColor: '#FFF', 
      borderTopLeftRadius: 30, borderTopRightRadius: 30,
      padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 50, height: 5, backgroundColor: COLORS.border, borderRadius: 10,
    alignSelf: 'center', marginBottom: 15,
  },
  modalHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
  },
  closeBtn: { padding: 5, backgroundColor: COLORS.bg, borderRadius: 50},
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
  modalSubtitle: { fontSize: 14, color: COLORS.textSub, marginBottom: 25 },
  modalBody: {},
  modalInputGroup: { marginBottom: 20 },
  confirmBtn: {
      backgroundColor: COLORS.secondary, height: 56, borderRadius: 16,
      justifyContent: 'center', alignItems: 'center', marginTop: 15,
      shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 17 }
});