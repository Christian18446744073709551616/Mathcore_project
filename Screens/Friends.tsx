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
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`friendships:user_id=eq.${session.user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'friendships',
        filter: `user_id=eq.${session.user.id} OR friend_id=eq.${session.user.id}`,
      }, async (payload) => {
        console.log('Alteração no pedido de amizade:', payload);
        await fetchFriends();  // Atualiza a lista de amigos
        await fetchPendingRequests();  // Atualiza os pedidos pendentes
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'friendships',
        filter: `user_id=eq.${session.user.id} OR friend_id=eq.${session.user.id}`,
      }, async (payload) => {
        console.log('Pedido de amizade atualizado:', payload);
        await fetchFriends();  // Atualiza a lista de amigos
        await fetchPendingRequests();  // Atualiza os pedidos pendentes
      })
      .subscribe();

    // Limpa o canal ao desmontar o componente
    return () => {
      channel.unsubscribe();
    };
  }, [session]);
  useEffect(() => {
    if (!session?.user?.id) return;
  
    const channel = supabase
      .channel(`friendships:user_id=eq.${session.user.id}`)
      .on('broadcast', { event: 'new_friend_request' }, async (payload) => {
        console.log('Novo pedido de amizade:', payload);
        // Atualize a UI conforme a lógica do app
        await fetchFriends();
        await fetchPendingRequests();
      })
      .on('broadcast', { event: 'updated_friend_request' }, async (payload) => {
        console.log('Pedido de amizade atualizado:', payload);
        // Atualize a UI conforme a lógica do app
        await fetchFriends();
        await fetchPendingRequests();
      })
      .subscribe();
  
    return () => {
      channel.unsubscribe();
    };
  }, [session]);

  
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
        placeholderTextColor="#00eeff" // Azul-violeta claro
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
    tabBarStyle: {
      backgroundColor: '#0d1117', // Fundo escuro futurista
      borderTopColor: '#1f2937', // Linha superior discreta
    },
    tabBarActiveTintColor: '#00eeff', // Cor ativa (ciano brilhante)
    tabBarInactiveTintColor: '#6a5acd', // Cor inativa (azul-violeta claro)
    tabBarLabelStyle: {
      fontSize: 14,
      fontWeight: 'bold',
    },
  }}>
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
    backgroundColor: '#0d0f14', // Fundo escuro azulado
    padding: 20,
   
  },
  listContainer: {
    backgroundColor: '#0d1117', // Fundo escuro futurista para toda a lista
    paddingBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#00eeff', // Azul-violeta frio
    backgroundColor: '#161b22', // Fundo escuro do input
    padding: 12,
    marginTop: 40,
    borderRadius: 10,
    color: '#00eeff', // Texto em azul neon
    fontSize: 16,
    fontFamily: 'monospace',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1b1e2a', // Cartão escuro azulado
    marginVertical: 12,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#6a5acd', // Sombra azul-violeta
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#6a5acd', // Borda azul-violeta
  },
  friendName: {
    fontSize: 18,
    color: '#00eeff', // Texto neon azul
    textShadowColor: '#6a5acd', // Sombra suave
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
    backgroundColor: '#6a5acd', // Indicador online azul-violeta
  },
});


export default Friends;
