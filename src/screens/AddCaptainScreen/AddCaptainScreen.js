import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { apiPostFormData } from "../../ultis/api";

const AddCaptainScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập bị từ chối", "Vui lòng cấp quyền truy cập ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };


const handleCreateCaptain = async () => {
  if (!fullName || !username || !email || !password || !address || !phoneNumber) {
    Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường.");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("FullName", fullName);
    formData.append("Username", username);
    formData.append("Email", email);
    formData.append("Password", password);
    formData.append("Address", address);
    formData.append("PhoneNumber", phoneNumber);

    if (avatar) {
      formData.append("Avatar", {
        uri: avatar.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      });
    }

    const res = await apiPostFormData("/captains", formData);

    // ✅ res.data có dạng:
    // {
    //   accountId, username, email, accessToken, role
    // }

    console.log("🚀 Created captain:", res.data);
    Alert.alert("Thành công", `Đã tạo thuyền trưởng: ${res.data.username}`);
    navigation.goBack();
  } catch (error) {
    console.error("❌ Lỗi tạo captain:", error);
    Alert.alert("Thất bại", "Không thể tạo thuyền trưởng, vui lòng thử lại!");
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#003d66" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Thuyền Trưởng</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ tên..."
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập username..."
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email..."
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu..."
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ..."
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại..."
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Text style={styles.label}>Ảnh đại diện</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera" size={26} color="#555" />
              <Text style={{ color: "#555", marginTop: 5 }}>Chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreateCaptain}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo Thuyền Trưởng</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCaptainScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#003d66" },
  content: { padding: 20 },
  label: { color: "#003d66", fontWeight: "600", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  placeholder: { justifyContent: "center", alignItems: "center" },
  avatarPreview: { width: "100%", height: "100%", borderRadius: 10 },
  button: {
    backgroundColor: "#005691",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
