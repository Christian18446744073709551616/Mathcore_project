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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// --- DEFINIÇÃO DOS TEMAS ---
const themes = {
  padrao: {
    name: 'Padrão',
    background: '#1d2033',
    card: '#30345a',
    searchBar: '#2a2e4d',
    text: '#fff',
    textSecondary: '#ccc',
    button: '#4a4e78',
    buttonPrimary: '#00bfae',
    badge: '#00eeff',
    modal: '#2a2e4d',
  },
  roxo: {
    name: 'Roxo',
    background: '#1d2033',
    card: '#30345a',
    searchBar: '#252850',
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    button: '#8B5CF6',
    buttonPrimary: '#9333EA',
    badge: '#A855F7',
    modal: '#30345a',
  },
  azulClaro: {
    name: 'Azul Claro',
    background: '#5b6b85',
    card: '#c5d0e6',
    searchBar: '#93a5c5',
    text: '#1e293b',
    textSecondary: '#475569',
    button: '#3B82F6',
    buttonPrimary: '#06B6D4',
    badge: '#0EA5E9',
    modal: '#c5d0e6',
  },
  altoContraste: {
    name: 'Alto Contraste',
    background: '#000000',
    card: '#1a1a1a',
    searchBar: '#2a2a2a',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    button: '#FFFF00',
    buttonPrimary: '#00FF00',
    badge: '#FF00FF',
    modal: '#1a1a1a',
  },
  deuteranopia: {
    name: 'Deuteranopia',
    background: '#faf9f7',
    card: '#f0ede6',
    searchBar: '#e8e6e0',
    text: '#2c2c2c',
    textSecondary: '#666666',
    button: '#0077b6',
    buttonPrimary: '#9d4edd',
    badge: '#ff9500',
    modal: '#f0ede6',
  },
  protanopia: {
    name: 'Protanopia',
    background: '#f8f9fa',
    card: '#e9ecef',
    searchBar: '#d9dce0',
    text: '#212529',
    textSecondary: '#6c757d',
    button: '#0466c8',
    buttonPrimary: '#7209b7',
    badge: '#fb8500',
    modal: '#e9ecef',
  },
  tritanopia: {
    name: 'Tritanopia',
    background: '#fefefe',
    card: '#f5f5f5',
    searchBar: '#f0f0f0',
    text: '#1e1e1e',
    textSecondary: '#666666',
    button: '#e63946',
    buttonPrimary: '#06ffa5',
    badge: '#ff006e',
    modal: '#f5f5f5',
  },
};

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
  theme,
}: {
  user: UserProfile;
  navigation: any;
  showChatChallenge?: boolean;
  onAccept?: () => void;
  theme: any;
}) => (
  <View style={[styles.friendCard, { backgroundColor: theme.card }]}>
    <View style={styles.friendLeft}>
      <AvatarView size={45} url={user.avatar_url} />
      <Text style={[styles.friendName, { color: theme.text }]}>{user.username}</Text>
    </View>

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
          style={[styles.chatButton, { backgroundColor: theme.button }]}
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


        <TouchableOpacity
          style={[styles.challengeButton, { backgroundColor: theme.buttonPrimary }]}
          onPress={() => console.log('Desafiar', user.username)}
        >
          <Ionicons name="flash" size={16} color="#fff" />
          <Text style={styles.btnText}>Desafiar</Text>
        </TouchableOpacity>
      </View>
    ) : onAccept ? (
      <TouchableOpacity style={[styles.chatButton, { backgroundColor: theme.button }]} onPress={onAccept}>
        <Text style={styles.btnText}>Aceitar</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: theme.button }]}
        onPress={() => navigation.navigate('FriendDripRoast', { userId: user.id })}
      >
        <Text style={styles.btnText}>Ver Perfil</Text>
      </TouchableOpacity>
    )}
  </View>
);


const FriendsTab = ({ friends, navigation, theme }: { friends: UserProfile[]; navigation: any; theme: any }) => (
  <FlatList
    showsVerticalScrollIndicator={false}
    data={friends}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ paddingBottom: 30 }}
    renderItem={({ item }) => <UserCard user={item} navigation={navigation} showChatChallenge theme={theme} />}
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

  // Estados do tema
  const [currentTheme, setCurrentTheme] = useState('padrao');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Carregar tema salvo
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('friends_theme');
        if (savedTheme && themes[savedTheme as keyof typeof themes]) {
          setCurrentTheme(savedTheme);
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (themeKey: string) => {
    setCurrentTheme(themeKey);
    setShowThemeModal(false);
    try {
      await AsyncStorage.setItem('friends_theme', themeKey);
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
    }
  };

  const theme = themes[currentTheme as keyof typeof themes];

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Botão de tema */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Social</Text>
        <TouchableOpacity 
          style={styles.themeButton}
          onPress={() => setShowThemeModal(true)}
        >
          <Ionicons name="color-palette" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.searchBar }]}>
        <Ionicons name="search" size={20} color={theme.text} style={{ marginLeft: 10 }} />
        <TextInput

          style={[styles.searchInput, { borderWidth: 0, outlineStyle: 'none', color: theme.text }]}


          placeholder="Encontre seus amigos"
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchUsers}
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add" size={20} color={theme.text} />
          <View style={[styles.badge, { backgroundColor: theme.badge }]}>
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
          renderItem={({ item }) => <UserCard user={item} navigation={navigation} theme={theme} />}
        />
      ) : (
        <FriendsTab friends={friends} navigation={navigation} theme={theme} />
      )}

      {/* Modal de pedidos pendentes */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Pedidos Pendentes</Text>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={pendingRequests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserCard user={item} navigation={navigation} onAccept={() => handleAcceptFriend(item.id)} theme={theme} />
              )}
              ListEmptyComponent={
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>
                  Nenhum pedido pendente
                </Text>
              }
            />
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.badge }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de tema */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.themeModalContent, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha um Tema</Text>
            
            <FlatList
              data={Object.entries(themes)}
              keyExtractor={([key]) => key}
              renderItem={({ item: [key, themeOption] }) => (
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: themeOption.card,
                      borderColor: currentTheme === key ? themeOption.buttonPrimary : 'transparent',
                    }
                  ]}
                  onPress={() => changeTheme(key)}
                >
                  <Text style={[styles.themeName, { color: themeOption.text }]}>
                    {themeOption.name}
                  </Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.background }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.card }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.buttonPrimary }]} />
                  </View>
                  {currentTheme === key && (
                    <Ionicons name="checkmark-circle" size={24} color={themeOption.buttonPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.badge }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({

  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  header: { fontSize: 24, fontWeight: '900' },
  themeButton: { padding: 8 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 16, paddingHorizontal: 10 },
  iconButton: { padding: 10, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 10 },
  friendCard: {
    borderRadius: 20,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendLeft: { flexDirection: 'row', alignItems: 'center' },
  friendName: { fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  friendButtons: { flexDirection: 'row' },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 5,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  closeBtn: {
    borderRadius: 15,
    paddingVertical: 8,
    marginTop: 15,
  },
  closeBtnText: { color: '#000', textAlign: 'center', fontWeight: 'bold' },
  themeModalContent: { width: '100%', maxHeight: '70%', borderRadius: 20, padding: 20 },
  themeOption: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeName: { fontSize: 16, fontWeight: '600', flex: 1 },
  colorPreview: { flexDirection: 'row', gap: 6, marginRight: 10 },
  colorSwatch: { width: 20, height: 20, borderRadius: 4 },
});

export default Friends;