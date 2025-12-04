import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Image,
  TouchableOpacity 
} from 'react-native';
import { Ionicons, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiGet } from '../../ultis/api';
import { useFocusEffect } from "@react-navigation/native";

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
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  gradientStart: '#0A2540',
  gradientEnd: '#163E5C',
};

const ShipProblemScreen = ({ route, navigation }) => {
  const { shipId, shipName } = route.params; 
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await apiGet(`/ships/${shipId}/report-problems?page=1&size=50&sort=createdDate,desc`);
      if (res?.data?.items) {
        setReports(res.data.items);
      }
    } catch (error) {
      console.log("Error fetching ship problems:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();     
    }, [shipId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { color: COLORS.warning, label: 'Chờ xử lý', icon: 'clock' };
      case 'Accepted': return { color: COLORS.secondary, label: 'Đã tiếp nhận', icon: 'check-circle' };
      case 'Resolved': return { color: COLORS.success, label: 'Đã giải quyết', icon: 'check-square' };
      case 'Rejected': return { color: COLORS.danger, label: 'Từ chối', icon: 'x-circle' };
      default: return { color: COLORS.textSub, label: status, icon: 'help-circle' };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' • ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  };

  const renderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity style={styles.card}
          onPress={() => navigation.navigate("ReportProblemDetail", { id: item.id })}>
        <View style={[styles.statusStrip, { backgroundColor: statusInfo.color }]} />
        
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.dateRow}>
                        <Feather name="calendar" size={12} color={COLORS.textSub} style={{marginRight: 4}} />
                        <Text style={styles.dateText}>{formatDateTime(item.createdDate)}</Text>
                    </View>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                    <Feather name={statusInfo.icon} size={14} color={statusInfo.color} style={{marginRight: 4}} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bodySection}>
                <Text style={styles.cardDesc}>{item.description}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View style={styles.footerRow}>
                    <View style={styles.footerItem}>
                        <FontAwesome5 name="user-tie" size={12} color={COLORS.textSub} style={{marginRight: 6}} />
                        <Text style={styles.footerLabel}>Báo cáo bởi: </Text>
                        <Text style={styles.footerValue} numberOfLines={1}>{item.captainName}</Text>
                    </View>
                    <View style={[styles.footerItem, {marginTop: 4}]}>
                        <Ionicons name="location-sharp" size={14} color={COLORS.secondary} style={{marginRight: 4}} />
                        <Text style={styles.footerValue} numberOfLines={1}>{item.portName}</Text>
                    </View>
                </View>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

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
                <View style={{flex: 1, marginLeft: 15}}>
                    <Text style={styles.headerTitle}>Sự cố tàu {shipName}</Text>
                    <Text style={styles.headerSub}>Danh sách sự cố đã ghi nhận</Text>
                </View>
                <View style={{width: 40}} /> 
            </View>
        </SafeAreaView>
      </LinearGradient>

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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png" }} 
                    style={styles.emptyImage}
                />
                <Text style={styles.emptyText}>Tàu này chưa có báo cáo sự cố nào.</Text>
                <Text style={styles.emptySubText}>Tất cả hệ thống đang hoạt động bình thường.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  
  headerGradient: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  backBtn: { 
      padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  listContent: { padding: 20, paddingBottom: 50 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row', 
    overflow: 'hidden'
  },
  statusStrip: { width: 6, height: '100%' },
  cardContent: { flex: 1, padding: 16 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 6, lineHeight: 22 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: COLORS.textSub },
  
  statusBadge: { 
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
      marginLeft: 10
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },

  bodySection: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 },
  cardDesc: { fontSize: 14, color: COLORS.textMain, lineHeight: 22 },

  cardFooter: { marginTop: 4 },
  footerRow: { justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerLabel: { fontSize: 12, color: COLORS.textSub },
  footerValue: { fontSize: 13, color: COLORS.textMain, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyImage: { width: 100, height: 100, opacity: 0.5, marginBottom: 20, tintColor: COLORS.textSub },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: COLORS.textSub, textAlign: 'center', width: '80%' }
});

export default ShipProblemScreen;