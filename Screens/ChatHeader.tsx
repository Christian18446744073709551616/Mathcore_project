import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatHeaderProps {
  groupName: string;
  friendName: string;
  friendAvatar: string | number | null;
  onChallengePress: () => void;
  onBackPress: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  groupName,
  friendName,
  friendAvatar,
  onChallengePress,
  onBackPress,
}) => {
  // 🔥 Tratamento direto e seguro do avatar (base64, URL, ou imagem local)
  const avatarSource =
    typeof friendAvatar === 'string'
      ? friendAvatar.startsWith('data:image') || friendAvatar.startsWith('http')
        ? { uri: friendAvatar } // Base64 ou URL HTTP
        : require('../assets/IconDefault.jpg') // fallback
      : friendAvatar || require('../assets/IconDefault.jpg'); // imagem local fallback

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Image source={avatarSource} style={styles.avatar} />
        <View>
          <Text style={styles.friendName}>{friendName}</Text>
          <Text style={styles.groupName}>{groupName}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.challengeButton} onPress={onChallengePress}>
        <Ionicons name="flash" size={16} color="#fff" />
        <Text style={styles.challengeText}>Desafiar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#5C6494',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff44',
    marginRight: 8,
  },
  friendName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  groupName: {
    color: '#ddddff',
    fontSize: 12,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3F66',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 5,
    marginLeft: 'auto',
  },
  challengeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default ChatHeader;
