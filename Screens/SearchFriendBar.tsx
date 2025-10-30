import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

interface SearchFriendsBarProps {
  onSearchPress: () => void;
  onRequestsPress: () => void;
  pendingCount: number;
}

const SearchFriendsBar: React.FC<SearchFriendsBarProps> = ({
  onSearchPress,
  onRequestsPress,
  pendingCount,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconLeft}>
        <FontAwesome name="search" size={20} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.textContainer} onPress={onSearchPress}>
        <Text style={styles.text}>Encontre seus amigos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconRight} onPress={onRequestsPress}>
        <MaterialIcons name="person-add-alt" size={22} color="#000" />
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6861d1',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 25,
    marginBottom: 15,
  },
  iconLeft: {
    backgroundColor: '#dcdce6',
    padding: 8,
    borderRadius: 50,
    marginRight: 8,
  },
  iconRight: {
    backgroundColor: '#dcdce6',
    padding: 8,
    borderRadius: 50,
    marginLeft: 8,
    position: 'relative',
  },
  textContainer: {
    backgroundColor: '#dcdce6',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  text: {
    color: '#333',
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default SearchFriendsBar;
