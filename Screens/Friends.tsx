import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AvatarView from '../components/AvatarView';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { acceptFriendRequest } from '../services/Friendzone';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  last_active_at?: string;
}

interface Session {
  user: {
    id: string;
  };
}

const updateLastActive = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', session.user.id);
};



const getFontSize = (name: string) => {
  if (name.length > 15) return 12;
  if (name.length > 10) return 14;
  return 16;
};


const UserCard = ({
  user,
  navigation,
  showChatChallenge = false,
  onAccept,
}: {
  user: UserProfile;
  navigation: any;
  showChatChallenge?: boolean;
  onAccept?: () => void;
}) => {
  // Função para ajustar tamanho da fonte com base no comprimento do nome
  const getFontSize = (name: string) => {
    if (name.length > 18) return 12;
    if (name.length > 12) return 14;
    return 16;
  };

  return (
    <View style={styles.friendCard}>
      <View style={styles.friendLeft}>
        <AvatarView size={45} url={user.avatar_url} />

        <Text
          style={[
            styles.friendName,
            { fontSize: getFontSize(user.username) },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user.username}
        </Text>
      </View>

      {showChatChallenge ? (
        <View style={styles.friendButtons}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              navigation.navigate('ChatScreen', {
                friendId: user.id,
                friendName: user.username,
              })
            }
          >
            <Ionicons name="chatbubbles" size={16} color="#fff" />
            <Text style={styles.btnText}>Conversar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.challengeButton}
            onPress={() => console.log('Desafiar', user.username)}
          >
            <Ionicons name="flash" size={16} color="#fff" />
            <Text style={styles.btnText}>Desafiar</Text>
          </TouchableOpacity>
        </View>
      ) : onAccept ? (
        <TouchableOpacity style={styles.chatButton} onPress={onAccept}>
          <Text style={styles.btnText}>Aceitar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() =>
            navigation.navigate('FriendDripRoast', { userId: user.id })
          }
        >
          <Text style={styles.btnText}>Ver Perfil</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


const FriendsTab = ({ friends, navigation }: { friends: UserProfile[]; navigation: any }) => (
  <FlatList
    showsVerticalScrollIndicator={false}
    data={friends}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ paddingBottom: 30 }}
    renderItem={({ item }) => <UserCard user={item} navigation={navigation} showChatChallenge />}
  />
);

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserProfile[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const fetchFriends = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('friendships')
      .select(`friend_id, profiles:friend_id ( id, username, avatar_url, last_active_at )`)
      .eq('user_id', session.user.id)
      .eq('accepted', true);

    if (!error && data) {
      const formatted = data.map((f: any) => ({
        id: f.profiles.id,
        username: f.profiles.username,
        avatar_url: f.profiles.avatar_url,
        last_active_at: f.profiles.last_active_at,
      }));
      setFriends(formatted);
    }
  };

  const fetchPendingRequests = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('friendships')
      .select('user_id, profiles:user_id (id, username, avatar_url)')
      .eq('friend_id', session.user.id)
      .eq('accepted', false);

    if (!error && data) {
      setPendingRequests(data.map((r: any) => r.profiles));
    }
  };

  const handleAcceptFriend = async (friendId: string) => {
    if (session?.user?.id) {
      await acceptFriendRequest(session.user.id, friendId);
      fetchPendingRequests();
      fetchFriends();
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!session?.user?.id) return;
    if (!query || query.trim().length === 0) {
      setRecentSearches([]);
      setSearchActive(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .neq('id', session.user.id);

    setRecentSearches(data || []);
    setSearchActive(true);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchFriends();
      fetchPendingRequests();
      updateLastActive();
      const interval = setInterval(updateLastActive, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Social</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#fff" style={{ marginLeft: 10 }} />
        <TextInput
          style={[styles.searchInput, { borderWidth: 0, outlineStyle: 'none' }]}
          placeholder="Encontre seus amigos"
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={handleSearchUsers}
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingRequests.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {searchActive ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          data={recentSearches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserCard user={item} navigation={navigation} />}
        />
      ) : (
        <FriendsTab friends={friends} navigation={navigation} />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pedidos Pendentes</Text>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={pendingRequests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserCard user={item} navigation={navigation} onAccept={() => handleAcceptFriend(item.id)} />
              )}
              ListEmptyComponent={
                <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 20 }}>
                  Nenhum pedido pendente
                </Text>
              }
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d2033', padding: 20, paddingBottom: 90 },
  header: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2e4d',
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingHorizontal: 10 },
  iconButton: { padding: 10, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#00eeff',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 10 },
  friendCard: {
    backgroundColor: '#30345a',
    borderRadius: 20,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendLeft: { flexDirection: 'row', alignItems: 'center' },
  friendName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  friendButtons: { flexDirection: 'row' },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a4e78',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 5,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00bfae',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 5,
  },
  btnText: { color: '#fff', fontSize: 13, marginLeft: 6, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#2a2e4d',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  closeBtn: {
    backgroundColor: '#00eeff',
    borderRadius: 15,
    paddingVertical: 8,
    marginTop: 15,
  },
  closeBtnText: { color: '#000', textAlign: 'center', fontWeight: 'bold' },
});

export default Friends;