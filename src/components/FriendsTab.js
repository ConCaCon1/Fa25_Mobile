import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const friendsData = [
  { id: '1', name: 'Nguyễn Văn B', date: '16/07/2003', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Trần Văn B', date: '16/07/2003', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Trần Tấn B', date: '16/07/2003', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Võ Huyền B', date: '16/07/2003', avatar: 'https://i.pravatar.cc/150?img=4' },
];

const FriendsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#A0AEC0" style={styles.closeIcon} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.friendList}>
        {filteredFriends.map(friend => (
          <View key={friend.id} style={styles.friendRow}>
            <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendDate}>{friend.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  closeIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1C2A3A',
  },
  friendList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C2A3A',
  },
  friendDate: {
    fontSize: 14,
    color: '#5A6A7D',
    marginTop: 2,
  },
});

export default FriendsTab;