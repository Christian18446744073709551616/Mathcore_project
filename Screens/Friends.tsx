import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AvatarView from '../components/AvatarView';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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

const isUserOnline = (lastActiveAt?: string): boolean => {
  if (!lastActiveAt) return false;
  const now = new Date();
  const diffInMinutes = (now.getTime() - new Date(lastActiveAt).getTime()) / (1000 * 60);
  return diffInMinutes < 2;
};

const Tab = createMaterialTopTabNavigator();

const FriendsTab = ({ friends, navigation }: { friends: UserProfile[], navigation: any }) => (
  <View style={{ flex: 1, backgroundColor: '#0d1117' }}>
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.friendItem}>
          <AvatarView size={50} url={item.avatar_url} />
          <Text style={styles.friendName}>{item.username}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: isUserOnline(item.last_active_at) ? 'green' : 'gray' }]} />
          <Button title="Ver Perfil" onPress={() => navigation.navigate('FriendDripRoast', { userId: item.id })} />
          <Button title="Iniciar Chat" onPress={() => navigation.navigate('ChatScreen', { friendId: item.id, friendName: item.username })} />
        </View>
      )}
    />
  </View>
);

const PendingRequestsTab = ({ pendingRequests, handleAcceptFriend }: { pendingRequests: UserProfile[], handleAcceptFriend: (id: string) => void }) => (
  <View style={{ flex: 1, backgroundColor: '#0d1117' }}>
    <FlatList
      data={pendingRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.friendItem}>
          <AvatarView size={50} url={item.avatar_url} />
          <Text style={styles.friendName}>{item.username}</Text>
          <Button title="Aceitar Pedido" onPress={() => handleAcceptFriend(item.id)} />
        </View>
      )}
    />
  </View>
);

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserProfile[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [searchActive, setSearchActive] = useState(false);
  const navigation = useNavigation();

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const fetchFriends = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        friend_id,
        profiles:friend_id (
          id,
          username,
          avatar_url,
          last_active_at
        )
      `)
      .eq('user_id', session.user.id)
      .eq('accepted', true);

    if (error) {
      console.error('Error fetching friends:', error.message);
      return;
    }

    const formattedData = data.map((friend: any) => ({
      id: friend.profiles.id,
      username: friend.profiles.username,
      avatar_url: friend.profiles.avatar_url,
      last_active_at: friend.profiles.last_active_at,
    }));

    setFriends(formattedData);
  };

  const fetchPendingRequests = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('friendships')
      .select('user_id, profiles:user_id (id, username, avatar_url)')
      .eq('friend_id', session.user.id)
      .eq('accepted', 'false');

    if (error) {
      console.error('Erro ao buscar pedidos de amizade pendentes:', error);
    } else {
      const pendingUsers = data.map((request: any) => request.profiles);
      setPendingRequests(pendingUsers);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .neq('id', session.user.id);

    if (error) {
      console.error('Erro ao buscar usuários:', error);
    } else {
      setRecentSearches(data);
      setSearchActive(true);
    }
  };

  const handleAcceptFriend = async (friendId: string) => {
    if (session?.user?.id) {
      try {
        await acceptFriendRequest(session.user.id, friendId);
        fetchPendingRequests();
        fetchFriends();
      } catch (error) {
        console.error('Erro ao aceitar pedido de amizade:', error);
      }
    }
  };

  const resetRecentSearches = () => {
    if (searchActive) {
      setRecentSearches([]);
      setSearchQuery('');
      setSearchActive(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchSession();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      updateLastActive(); // ✅ Atualiza imediatamente após carregar sessão
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      updateLastActive();
    }, 2 * 60 * 1000); // ✅ Atualiza a cada 2 minutos

    updateLastActive(); // ✅ Atualiza também na entrada

    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [session]);

  return (
    <View style={styles.container}>
      {searchActive && (
        <Button title="Fechar Pesquisa" onPress={resetRecentSearches} />
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuários..."
        placeholderTextColor="#00eeff"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearchUsers(text);
        }}
      />

      {searchActive && (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={recentSearches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <AvatarView size={50} url={item.avatar_url} />
              <Text style={styles.friendName}>{item.username}</Text>
              <Button title="Ver Perfil" onPress={() => navigation.navigate('FriendDripRoast', { userId: item.id })} />
            </View>
          )}
        />
      )}

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#0d1117', borderTopColor: '#1f2937' },
          tabBarActiveTintColor: '#00eeff',
          tabBarInactiveTintColor: '#6a5acd',
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="Amigos">
          {() => <FriendsTab friends={friends} navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen name="Pedidos Pendentes">
          {() => <PendingRequestsTab pendingRequests={pendingRequests} handleAcceptFriend={handleAcceptFriend} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14',
    padding: 20,
  },
  listContainer: {
    backgroundColor: '#0d1117',
    paddingBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#00eeff',
    backgroundColor: '#161b22',
    padding: 12,
    marginTop: 40,
    borderRadius: 10,
    color: '#00eeff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1b1e2a',
    marginVertical: 12,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#6a5acd',
  },
  friendName: {
    fontSize: 18,
    color: '#00eeff',
    textShadowColor: '#6a5acd',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
    backgroundColor: '#6a5acd',
  },
});

export default Friends;
