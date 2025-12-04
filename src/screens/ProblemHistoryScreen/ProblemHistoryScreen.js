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
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
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

  // --- CẬP NHẬT LOGIC TRẠNG THÁI MỚI ---
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': 
        return { color: COLORS.warning, label: 'Chờ xử lý', icon: 'clock' };
      case 'Accepted': 
        return { color: COLORS.secondary, label: 'Đã tiếp nhận', icon: 'check-circle' };
      case 'Resolved': 
        return { color: COLORS.success, label: 'Đã giải quyết', icon: 'check-square' };
      case 'Rejected': 
        return { color: COLORS.danger, label: 'Từ chối', icon: 'x-circle' };
      default: 
        return { color: COLORS.textSub, label: status, icon: 'help-circle' };
    }
  };

  const formatDateTime = (dateString) => {
    if(!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' • ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  };

  const renderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("ReportProblemDetail", { id: item.id })}
      >
        {/* HEADER CARD */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.dateContainer}>
               <Feather name="calendar" size={12} color={COLORS.textSub} style={{marginRight: 4}} />
               <Text style={styles.dateText}>{formatDateTime(item.createdDate)}</Text>
            </View>
          </View>
          
          {/* BADGE TRẠNG THÁI CÓ ICON */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15', borderColor: statusInfo.color }]}>
            <Feather name={statusInfo.icon} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />

        {/* BODY CARD */}
        <View style={styles.cardBody}>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* FOOTER CARD */}
        <View style={styles.cardFooter}>
            
            <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                    <Ionicons name="boat" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.infoLabel}>Tàu:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{item.shipName || "---"}</Text>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                    <Ionicons name="location-sharp" size={14} color={COLORS.secondary} />
                </View>
                <Text style={styles.infoLabel}>Cảng:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{item.portName || "---"}</Text>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                    <FontAwesome5 name="user-tie" size={12} color={COLORS.textSub} />
                </View>
                <Text style={styles.infoLabel}>Người báo:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{item.captainName || "---"}</Text>
            </View>

        </View>

        {/* Action Link */}
        <View style={styles.actionRow}>
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
  
  /* CARD STYLES */
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
  
  // Header Card
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerLeft: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 4, lineHeight: 22 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: COLORS.textSub, marginLeft: 4 },
  
  statusBadge: { 
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 8, paddingVertical: 4, 
      borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start'
  },
  statusText: { fontSize: 11, fontWeight: '700', marginLeft: 2 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  
  // Body Card
  cardBody: { marginBottom: 10 },
  cardDesc: { fontSize: 14, color: COLORS.textMain, lineHeight: 20 },
  
  // Footer Card
  cardFooter: { flexDirection: 'column', gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
      width: 24, height: 24, borderRadius: 6, backgroundColor: '#F1F5F9',
      justifyContent: 'center', alignItems: 'center', marginRight: 8
  },
  infoLabel: { fontSize: 13, color: COLORS.textSub, marginRight: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.textMain, flex: 1 },

  // Action Row
  actionRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
      marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F8FAFC'
  },
  viewDetailText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary, marginRight: 4 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyImage: { width: 80, height: 80, opacity: 0.5, marginBottom: 16, tintColor: COLORS.textSub },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: COLORS.textSub }
});

export default ProblemHistoryScreen;