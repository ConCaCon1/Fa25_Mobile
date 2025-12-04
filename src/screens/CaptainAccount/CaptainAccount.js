import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from "expo-image-picker";
import { useIsFocused } from "@react-navigation/native";

import { getUserData, clearAllData, getToken } from "../../auth/authStorage";
import { apiGet } from "../../ultis/api";
import { API_BASE_URL } from "@env";

const COLORS = {
  primary: "#0A2540",
  secondary: "#00A8E8",
  accent: "#FF6B6B", 
  bg: "#F8FAFC",
  white: "#FFFFFF",
  textMain: "#1E293B",
  textSub: "#64748B",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
};

const ProfileOption = ({ iconName, title, onPress, iconColor = COLORS.textMain, textColor = COLORS.textMain, isLast = false }) => (
  <TouchableOpacity 
    style={[styles.optionContainer, isLast && { borderBottomWidth: 0 }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, { backgroundColor: iconColor + '15' }]}>
      <Feather name={iconName} size={20} color={iconColor} /> 
    </View>
    <Text style={[styles.optionText, { color: textColor }]}>{title}</Text>
    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
  </TouchableOpacity>
);

const CaptainAccount = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadData = async () => {
      const userData = await getUserData();
      if (userData?.role !== "Captain") {
        navigation.replace("Home");
        return;
      }

      try {
        const res = await apiGet("/auth/profile");
        if (res.status === 200 && res.data) {
          setProfile(res.data);
        }
      } catch (error) {
        console.log("Lỗi load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
        loadData();
    }
  }, [isFocused]);

  const handleUpdateAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });

    if (!result.canceled) {
      setUploadingAvatar(true);
      try {
        const asset = result.assets[0];
        const token = await getToken();
        const formData = new FormData();
        const fileName = asset.uri.split('/').pop();
        const type = /\.(\w+)$/.exec(fileName) ? `image/${/\.(\w+)$/.exec(fileName)[1]}` : `image`;

        formData.append("AvatarUrl", {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          name: fileName,
          type: type,
        });

        if (profile) {
            formData.append("FullName", profile.fullName || "");
            formData.append("PhoneNumber", profile.phoneNumber || "");
            formData.append("Address", profile.address || "");
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
           method: "PATCH",
           headers: { Authorization: `Bearer ${token}` },
           body: formData
        });

        if (response.ok) {
           const res = await apiGet("/auth/profile");
           if (res.data) setProfile(res.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleLogout = async () => {
    await clearAllData();
    navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <LinearGradient
        colors={[COLORS.primary, '#163E5C']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarWrapper}>
            <Image 
                source={{ uri: profile?.avatarUrl || "https://i.pravatar.cc/300" }} 
                style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleUpdateAvatar} disabled={uploadingAvatar}>
              {uploadingAvatar ? <ActivityIndicator size="small" color="#FFF"/> : <Feather name="camera" size={14} color="#FFF" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.fullName || "Thuyền Viên"}</Text>
 
            
            <TouchableOpacity 
                style={styles.editProfileBtn} 
                onPress={() => navigation.navigate("EditProfileScreen")}
            >
                <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.bodyContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Quản lý sự cố</Text>
        <View style={styles.card}>
            <ProfileOption 
                iconName="alert-triangle" 
                title="Báo cáo sự cố mới" 
                onPress={() => navigation.navigate("ReportProblem")} 
                iconColor={COLORS.accent} 
                textColor={COLORS.accent}
            />
            <ProfileOption 
                iconName="list" 
                title="Lịch sử báo cáo" 
                onPress={() => navigation.navigate("ProblemHistory")} 
                iconColor={COLORS.secondary} 
                isLast
            />
        </View>

       

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Support by MaritimeHub</Text>
        <View style={{height: 50}} /> 

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },

  /* HEADER */
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: { position: "relative" },
  avatar: { 
    width: 80, height: 80, borderRadius: 40, 
    borderWidth: 3, borderColor: "rgba(255,255,255,0.3)" 
  },
  editAvatarBtn: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: COLORS.secondary, padding: 6, borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.white
  },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 20, fontWeight: "bold", color: COLORS.white },
  userEmail: { fontSize: 13, color: "#94A3B8", marginTop: 2, marginBottom: 8 },
  editProfileBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, alignSelf: "flex-start"
  },
  editProfileText: { fontSize: 12, color: COLORS.white, fontWeight: "600" },

  /* BODY */
  bodyContainer: { flex: 1, paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { 
    fontSize: 16, fontWeight: "700", color: COLORS.textMain, 
    marginBottom: 10, marginLeft: 4 
  },
  
  /* CARD STYLE FOR OPTIONS */
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    elevation: 2,
  },
  optionContainer: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginRight: 12
  },
  optionText: { fontSize: 15, fontWeight: "500", flex: 1 },

  /* LOGOUT BUTTON */
  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.accent,
    paddingVertical: 14, borderRadius: 14,
    marginTop: 10,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    elevation: 4
  },
  logoutText: { color: COLORS.white, fontSize: 16, fontWeight: "bold", marginLeft: 8 },

  versionText: { 
    textAlign: "center", color: "#94A3B8", fontSize: 12, marginTop: 20 
  }
});

export default CaptainAccount;