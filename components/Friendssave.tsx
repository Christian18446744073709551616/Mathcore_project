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

const isUserOnline = (lastActiveAt: string): boolean => {
  const now = new Date();
  const diffInMinutes = (now.getTime() - new Date(lastActiveAt).getTime()) / (1000 * 60);
  return diffInMinutes < 5;
};

const Tab = createMaterialTopTabNavigator();

const FriendsTab = ({ friends, navigation }: { friends: UserProfile[], navigation: any }) => (
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
);

const PendingRequestsTab = ({ pendingRequests, handleAcceptFriend }: { pendingRequests: UserProfile[], handleAcceptFriend: (id: string) => void }) => (
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
);

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserProfile[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
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
      .select(`friend_username, profiles:friend_id (id, username, avatar_url)`)
      .eq('user_id', session.user.id)
      .eq('accepted', true);

    if (error) {
      console.error('Error fetching friends:', error.message);
      return null;
    }

    const formattedData = data.map((friend: any) => ({
      id: friend.profiles.id,
      username: friend.profiles.username,
      avatar_url: friend.profiles.avatar_url
    }));

    setFriends(formattedData);
  };

  const fetchPendingRequests = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from('friendships')
      .select('user_id, profiles!user_id (id, username, avatar_url)')
      .eq('friend_id', session.user.id)
      .eq('accepted', false);

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
    setRecentSearches([]);  // Clear recent searches
    setSearchQuery('');      // Reset search query
    setSearchActive(false);  // Deactivate search mode
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      await fetchSession();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (session) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [session]);

  return (
    <View style={styles.container}>
         {searchActive && (  // Exibe o botão apenas quando a busca estiver ativa
       <Button title="Fechar Pesquisa" onPress={resetRecentSearches} /> 
       )}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuários..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearchUsers(text);
        }}
        
      />

      {searchActive && (
        
        <FlatList
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

      <Tab.Navigator>
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
    padding: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});

export default Friends;
