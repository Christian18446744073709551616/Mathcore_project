import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import AvatarView from './AvatarView';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
}

interface FriendInvitePopupProps {
  isVisible: boolean;
  onClose: () => void;
  onInvite: (friendId: string) => void;
}

const FriendInvitePopup: React.FC<FriendInvitePopupProps> = ({ isVisible, onClose, onInvite }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    // Obtém a sessão do usuário ao carregar o componente
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao obter sessão:', error);
      } else {
        setSession(session);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('friendships')
      .select(`friend_username, profiles:friend_id (id, username, avatar_url)`)
        

      if (error) {
        console.error('Error fetching friends:', error.message);
        return null;
      }
  
      const formattedData = data.map((friend: any) => ({
        id: friend.profiles.id,
        username: friend.profiles.username,
        avatar_url: friend.profiles.avatar_url
        
      }))  
      .filter(friend => friend.id !== session.user.id);
  
      setFriends(formattedData);
      
    };

    if (isVisible) {
      fetchFriends();
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <Text style={styles.title}>Convide um amigo para o lobby</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendItem}
                onPress={() => onInvite(item.id)}
              >
                <Text style={styles.friendName}>{item.username}</Text>
            
                <AvatarView size={50} url={item.avatar_url} />
              </TouchableOpacity>
            )}
          />
          <Button title="Fechar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
});

export default FriendInvitePopup;