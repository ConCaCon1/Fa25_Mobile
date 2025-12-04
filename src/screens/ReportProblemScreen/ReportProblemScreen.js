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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
// 1. Import thêm apiPost
import { apiGet, apiPost } from '../../ultis/api'; 

const ReportProblemScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States cho danh sách cảng
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [portsLoading, setPortsLoading] = useState(false);

  // Gọi API lấy danh sách cảng khi màn hình được load
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

  // 2. Hàm Xử Lý Gửi Báo Cáo (Call API POST)
  const handleSubmit = async () => {
    // Validate dữ liệu đầu vào
    if (!title.trim() || !description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và mô tả sự cố.");
      return;
    }
    
    // API yêu cầu portId, nên bắt buộc phải chọn cảng
    if (!selectedPort) { 
        Alert.alert("Chưa chọn cảng", "Vui lòng chọn cảng xảy ra sự cố."); 
        return; 
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu theo đúng Swagger: portId, title, description
      const payload = {
        portId: selectedPort.id,
        title: title,
        description: description
      };

      // Gọi API POST
      const response = await apiPost('/report-problems', payload);

      // Kiểm tra kết quả (Tùy backend trả về 200 hoặc 201)
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Thành công", "Báo cáo sự cố đã được gửi đi. Cảm ơn phản hồi của bạn.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Thất bại", response.message || "Gửi báo cáo không thành công.");
      }

    } catch (error) {
      console.error("Lỗi gửi báo cáo:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi kết nối đến máy chủ.");
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
      <Ionicons name="boat-outline" size={20} color="#555" style={{marginRight: 10}}/>
      <Text style={styles.portName}>{item.name}</Text>
      {/* Hiển thị thêm thành phố nếu có để dễ phân biệt */}
      {item.city && <Text style={styles.portCity}> - {item.city}</Text>}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo sự cố</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.content}>
          
          {/* Dropdown Chọn Cảng */}
          <Text style={styles.label}>Chọn cảng xảy ra sự cố <Text style={{color: 'red'}}>*</Text></Text>
          <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.dropdownText, !selectedPort && {color: '#999'}]}>
              {selectedPort ? selectedPort.name : "Chọn cảng..."}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Tiêu đề sự cố <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Cầu cảng bị hỏng..."
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Mô tả chi tiết <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal Chọn Cảng */}
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
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Danh sách Cảng</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  {portsLoading ? (
                    <ActivityIndicator size="large" color="#007BFF" style={{marginTop: 20}} />
                  ) : (
                    <FlatList
                      data={ports}
                      keyExtractor={(item) => item.id}
                      renderItem={renderPortItem}
                      style={{maxHeight: 300}}
                      ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color:'#999'}}>Không tìm thấy cảng nào</Text>}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 120,
  },
  
  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  dropdownText: { fontSize: 16, color: '#333' },

  submitButton: {
    backgroundColor: '#D32F2F', // Màu đỏ cho sự cố
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: { backgroundColor: '#E57373' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  portItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  portName: { fontSize: 16, color: '#333' },
  portCity: { fontSize: 14, color: '#777' }
});

export default ReportProblemScreen;