import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiGet } from '../../ultis/api';

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
  danger: '#EF4444',  
  cardShadow: '#0F172A',
};

const ProblemHistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await apiGet("/report-problems?page=1&size=50&sort=createdDate,desc");
      if (res?.data?.items) {
        setReports(res.data.items);
      }
    } catch (error) {
      console.log("Error fetching reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { color: COLORS.warning, label: 'Chờ xử lý', icon: 'time-outline' };
      case 'Accepted': return { color: COLORS.success, label: 'Đã tiếp nhận', icon: 'checkmark-circle-outline' };
      case 'Rejected': return { color: COLORS.danger, label: 'Bị từ chối', icon: 'close-circle-outline' };
      default: return { color: COLORS.textSub, label: status, icon: 'help-circle-outline' };
    }
  };

  const renderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("ReportProblemDetail", { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.bg }]}>
                <Feather name="alert-triangle" size={18} color={COLORS.primary} />
            </View>
            <View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.dateText}>
                    {item.createdDate ? new Date(item.createdDate).toLocaleDateString('vi-VN') : ''}
                </Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.cardBody}>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.infoRow}>
                <View style={styles.locationContainer}>
                    <Ionicons name="location-sharp" size={14} color={COLORS.textSub} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {item.portName || "Không rõ vị trí"}
                    </Text>
                </View>
                <Text style={styles.shipName}>Tàu: {item.shipName}</Text>
            </View>
        </View>

        <View style={styles.cardFooter}>
            <Text style={styles.viewDetailText}>Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử sự cố</Text>
        <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate("ReportProblem")}
        >
           <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Image 
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png" }} 
                  style={styles.emptyImage}
               />
               <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
               <Text style={styles.emptySubText}>Các sự cố bạn báo cáo sẽ xuất hiện tại đây</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: COLORS.bg,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textMain },
  backButton: { 
      padding: 8, 
      borderRadius: 12, 
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.border
  },
  addButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4
  },
  
  listContent: { padding: 20, paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  card: {
    backgroundColor: COLORS.white, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: COLORS.cardShadow, 
    shadowOpacity: 0.05, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 10, 
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  iconBox: {
      width: 40, height: 40, borderRadius: 10,
      justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  dateText: { fontSize: 12, color: COLORS.textSub },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  
  cardBody: { marginBottom: 12 },
  cardDesc: { fontSize: 14, color: COLORS.textSub, marginBottom: 12, lineHeight: 20 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  locationText: { fontSize: 13, color: COLORS.textSub, marginLeft: 4, fontWeight: '500' },
  shipName: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  cardFooter: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'flex-end',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F8FAFC'
  },
  viewDetailText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary, marginRight: 4 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyImage: { width: 80, height: 80, opacity: 0.5, marginBottom: 16, tintColor: COLORS.textSub },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: COLORS.textSub }
});

export default ProblemHistoryScreen;