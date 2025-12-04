import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet, apiPost } from '../../ultis/api'; 

const COLORS = {
  bg: '#F8FAFC',
  white: '#FFFFFF',
  textMain: '#1E293B',
  textSub: '#64748B',
  primary: '#0A2540',
  secondary: '#00A8E8',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  danger: '#DC2626',
  gradientStart: '#0A2540',
  gradientEnd: '#163E5C',
  overlay: 'rgba(0,0,0,0.5)',
};

const ReportProblemScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [portsLoading, setPortsLoading] = useState(false);

  useEffect(() => {
    const fetchPorts = async () => {
      setPortsLoading(true);
      try {
        const response = await apiGet('/ports?page=1&size=100');
        if (response?.data?.items) {
          setPorts(response.data.items);
        }
      } catch (error) {
        console.log("Lỗi lấy danh sách cảng:", error);
      } finally {
        setPortsLoading(false);
      }
    };

    fetchPorts();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và mô tả sự cố.");
      return;
    }
    
    if (!selectedPort) { 
        Alert.alert("Chưa chọn cảng", "Vui lòng chọn cảng xảy ra sự cố."); 
        return; 
    }

    setLoading(true);

    try {
      const payload = {
        portId: selectedPort.id,
        title: title,
        description: description
      };

      const response = await apiPost('/report-problems', payload);

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Thành công", "Báo cáo sự cố đã được gửi đi.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Thất bại", response.message || "Gửi báo cáo không thành công.");
      }

    } catch (error) {
      console.error("Lỗi gửi báo cáo:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  const renderPortItem = ({ item }) => (
    <TouchableOpacity
      style={styles.portItem}
      onPress={() => {
        setSelectedPort(item);
        setModalVisible(false);
      }}
    >
      <View style={styles.portIconBox}>
        <Ionicons name="boat" size={20} color={COLORS.secondary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.portName}>{item.name}</Text>
        {item.city && <Text style={styles.portCity}>{item.city}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSub} />
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.gradientStart} />
        
        {/* --- HEADER GRADIENT --- */}
        <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            style={styles.headerGradient}
        >
            <SafeAreaView edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Báo cáo sự cố</Text>
                    <View style={{ width: 40 }} /> 
                </View>
            </SafeAreaView>
        </LinearGradient>

        <View style={styles.contentContainer}>
            <View style={styles.card}>
                
                {/* 1. Chọn Cảng */}
                <Text style={styles.label}>Cảng xảy ra sự cố <Text style={{color: COLORS.danger}}>*</Text></Text>
                <TouchableOpacity 
                    style={styles.dropdownButton} 
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Feather name="anchor" size={20} color={COLORS.textSub} style={{marginRight: 10}} />
                        <Text style={[styles.dropdownText, !selectedPort && {color: '#94A3B8'}]}>
                            {selectedPort ? selectedPort.name : "Chọn cảng..."}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color={COLORS.textSub} />
                </TouchableOpacity>

                {/* 2. Tiêu đề */}
                <Text style={styles.label}>Tiêu đề sự cố <Text style={{color: COLORS.danger}}>*</Text></Text>
                <View style={styles.inputWrapper}>
                    <Feather name="alert-circle" size={20} color={COLORS.textSub} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: Hỏng chân vịt..."
                        placeholderTextColor="#94A3B8"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* 3. Mô tả */}
                <Text style={styles.label}>Mô tả chi tiết <Text style={{color: COLORS.danger}}>*</Text></Text>
                <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                    <Feather name="file-text" size={20} color={COLORS.textSub} style={[styles.inputIcon, { marginTop: 2 }]} />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                        placeholderTextColor="#94A3B8"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        numberOfLines={5}
                        textAlignVertical="top"
                    />
                </View>

            </View>

            {/* Submit Button */}
            <TouchableOpacity 
                style={[styles.submitButton, loading && styles.disabledButton]} 
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Feather name="send" size={20} color="#FFF" style={{marginRight: 8}} />
                        <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        {/* --- MODAL CHỌN CẢNG (Bottom Sheet Style) --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chọn Cảng</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                      <Ionicons name="close" size={24} color={COLORS.textSub} />
                    </TouchableOpacity>
                  </View>
                  
                  {portsLoading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 20}} />
                  ) : (
                    <FlatList
                      data={ports}
                      keyExtractor={(item) => item.id}
                      renderItem={renderPortItem}
                      style={{maxHeight: 400}}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                          <View style={{alignItems: 'center', marginTop: 20}}>
                              <Text style={{color: COLORS.textSub}}>Không tìm thấy dữ liệu cảng</Text>
                          </View>
                      }
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  /* HEADER */
  headerGradient: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

  /* BODY CONTENT */
  contentContainer: { padding: 20, marginTop: -20 }, // Đẩy lên đè lên header một chút nếu muốn, hoặc bỏ marginTop
  
  card: {
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
      marginBottom: 20
  },

  label: { fontSize: 14, fontWeight: '600', color: COLORS.textMain, marginBottom: 8, marginTop: 12 },
  // Fix margin top for first label
  labelFirst: { marginTop: 0 },

  /* INPUT STYLES */
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'transparent'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textMain, height: 50 },
  textArea: { height: 120, textAlignVertical: 'top' },
  
  /* DROPDOWN STYLE */
  dropdownButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: 'transparent'
  },
  dropdownText: { fontSize: 15, color: COLORS.textMain },

  /* SUBMIT BUTTON */
  submitButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  disabledButton: { backgroundColor: '#FCA5A5' },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  /* MODAL STYLES */
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    maxHeight: '80%'
  },
  modalHandle: { width: 40, height: 5, backgroundColor: COLORS.border, borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 15
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  closeBtn: { padding: 4, backgroundColor: '#F1F5F9', borderRadius: 8 },

  portItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC'
  },
  portIconBox: {
      width: 40, height: 40, borderRadius: 12, backgroundColor: '#E0F2FE',
      justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  portName: { fontSize: 16, fontWeight: '600', color: COLORS.textMain },
  portCity: { fontSize: 13, color: COLORS.textSub, marginTop: 2 }
});

export default ReportProblemScreen;