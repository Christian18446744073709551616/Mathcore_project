import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AvatarView from '../components/AvatarView';

interface FriendCardProps {
  name: string;
  avatarUrl: string;
  onChatPress: () => void;
  onChallengePress: () => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  name,
  avatarUrl,
  onChatPress,
  onChallengePress,
}) => {
  return (
    <View style={styles.cardContainer}>
      <AvatarView url={avatarUrl} size={50} />
      <Text style={styles.name}>{name}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
          <Text style={styles.buttonText}>💬 Conversar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.challengeButton} onPress={onChallengePress}>
          <Text style={styles.buttonText}>⚡ Desafiar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#6862c2ff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    gap: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 6,
  },
  chatButton: {
    backgroundColor: '#2f2b4a',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  challengeButton: {
    backgroundColor: '#2f2b4a',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
  },
});

export default FriendCard;