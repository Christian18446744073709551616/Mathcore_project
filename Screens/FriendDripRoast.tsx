import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AvatarView from '../components/AvatarView';
import { supabase } from '../lib/supabase';
import { useRoute } from '@react-navigation/native';
import { addFriend, removeFriend } from '../services/Friendzone';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
}

const FriendDripRoast = () => {
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friendCount, setFriendCount] = useState(0);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [friendProgress, setFriendProgress] = useState<{ lessonTitle: string; progressPercentage: number }[]>([]);
  const [friendRequestStatus, setFriendRequestStatus] = useState(''); // 'enviado' ou 'aguardando resposta'

 const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const fetchUserProfileAndProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return;
      }

      setUserProfile(profile);

      // Fetch do progresso do usuário
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_title, progress_percentage')
        .eq('user_id', profile.id);

      if (progressError) {
        console.error('Erro ao buscar progresso do amigo:', progressError);
      } else {
        // Mapeando o progresso para o formato correto
        const formattedProgress = (progress || []).map(item => ({
          lessonTitle: item.lesson_title,
          progressPercentage: item.progress_percentage,
        }));
        setFriendProgress(formattedProgress);
      }
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chamando a função ao carregar o componente
  useEffect(() => {
    if (userId) {
      fetchUserProfileAndProgress();
    }
  }, [userId]);


  const fetchFriendCount = async () => {
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('accepted', true);

      if (error) {
        console.error('Erro ao buscar quantidade de amigos:', error);
      } else {
        setFriendCount(count || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar amigos:', error);
    }
  };

  const checkIfFriend = async (currentUserId: string, viewedUserId: string) => {
    try {
      const { data: acceptedFriends, error: friendError } = await supabase
        .from('friendships')
        .select('friend_id, user_id, accepted')
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .or(`user_id.eq.${viewedUserId},friend_id.eq.${viewedUserId}`);
  
      if (friendError) {
        console.error('Erro ao verificar amizade:', friendError);
        return;
      }
  
      const isAlreadyFriend = acceptedFriends.some(
        (friend: { friend_id: string; user_id: string; accepted: boolean }) =>
          ((friend.friend_id === viewedUserId || friend.user_id === viewedUserId) &&
            friend.accepted)
      );
  
      const isPendingRequest = acceptedFriends.some(
        (friend: { friend_id: string; user_id: string; accepted: boolean }) =>
          (friend.friend_id === viewedUserId || friend.user_id === viewedUserId) &&
          !friend.accepted
      );
  
      setIsFriend(isAlreadyFriend);
      setRequestSent(isPendingRequest);
    } catch (error) {
      console.error('Erro ao verificar amizade:', error);
    }
  };
  

  const handleAddFriend = async () => {
    if (session && session.user && userProfile) {
      try {
        await addFriend(session.user.id, userId);
        await addFriend(userId, session.user.id);
        setIsFriend(false);
        setRequestSent(true);
        fetchFriendCount();
      } catch (error) {
        console.error('Erro ao enviar pedido de amizade:', error);
      }
    }
  };

  const handleRemoveFriend = () => {
    Alert.alert(
      "Remover Amigo",
      "Tem certeza de que deseja remover este amigo?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { text: "Remover", onPress: async () => await confirmRemoveFriend() }
      ]
    );
  };

  const confirmRemoveFriend = async () => {
    if (session && session.user) {
      try {
        const userId1 = session.user.id;
        const userId2 = userId; // O ID do amigo a ser removido
  
        // Chama a função para remover a amizade em ambas as direções
        await removeFriend(userId1, userId2); // Remove userId2 da lista de amigos de userId1
        await removeFriend(userId2, userId1); // Remove userId1 da lista de amigos de userId2
  
        // Atualiza o estado após a remoção
        setIsFriend(false);
        setFriendCount((prevCount) => prevCount - 1); // Atualiza o estado sem necessidade de re-fetch
        Alert.alert("Amigo Removido", "Você removeu este amigo com sucesso.");
      } catch (error) {
        console.error('Erro ao remover amigo:', error);
        Alert.alert("Erro", "Ocorreu um erro ao remover o amigo. Tente novamente mais tarde.");
      }
    }
  };




  useEffect(() => {
    fetchSession();
  }, []);



  useEffect(() => {
    if (userId && session) {
      // Carregar informações iniciais
      fetchUserProfileAndProgress();
      fetchFriendCount();
      checkIfFriend(session.user.id, userId);
  
      // Configurar o canal para escutar eventos de amizade
      const channel = supabase
        .channel(`friendships:user=${session.user.id}`) // Nome único do canal para evitar conflitos
        .on(
          'postgres_changes',
          {
            event: '*', // Captura INSERT e UPDATE
            schema: 'public',
            table: 'friendships',
            filter: `user_id=eq.${session.user.id} OR friend_id=eq.${session.user.id}`, // Filtrar para o usuário atual
          },
          async (payload) => {
            console.log('Mudança detectada em friendships:', payload);
            const { new: newFriendship, eventType } = payload;
  
            // Verificar o tipo de evento e atualizar os estados
            if (eventType === 'INSERT') {
              console.log('Novo pedido de amizade recebido:', newFriendship);
              // Se for uma solicitação de amizade enviada, marque como "aguardando resposta"
              if (newFriendship.user_id === session.user.id) {
                setFriendRequestStatus('aguardando resposta');
              }
            } else if (eventType === 'UPDATE') {
              console.log('Pedido de amizade atualizado:', newFriendship);
              if (newFriendship.accepted) {
                setIsFriend(true); // Se o pedido for aceito, marquem-se como amigos
                setFriendRequestStatus('');
              } else {
                setFriendRequestStatus('aguardando resposta');
              }
            }
            // Atualiza o contador de amigos
            await fetchFriendCount();
            // Verifica novamente se são amigos
            await checkIfFriend(session.user.id, userId);
          }
        )
        .subscribe();
  
      return () => {
        channel.unsubscribe(); // Desinscrever ao desmontar o componente
      };
    }
  }, [userId, session]);
  
  

  if (loading || !userProfile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView} // Adicionando o estilo diretamente no ScrollView
    >
      <View style={styles.container}>
        <AvatarView size={200} url={userProfile?.avatar_url} />
        <View style={styles.infoContainer}>
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.friendCount}>Amigos: {friendCount}</Text>
        </View>
        {!isFriend ? (
          requestSent ? (
            <Text style={styles.pendingStatus}>Aguardando resposta...</Text>
          ) : (
            <Button title="Adicionar como amigo" onPress={handleAddFriend} />
          )
        ) : (
          <View>
            <Text style={styles.friendStatus}>Vocês já são amigos!</Text>
            <TouchableOpacity 
              style={styles.friendStatusButton} 
              onPress={handleRemoveFriend}
            >
              <Text style={styles.friendStatusButtonText}>Remover amigo</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 20, width: '100%' }}>
              {friendProgress.length > 0 ? (
                friendProgress.map((item, index) => (
                  <View key={index} style={styles.progressItem}>
                    <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progress,
                          { width: `${item.progressPercentage}%`, backgroundColor: '#00ff00' },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {item.progressPercentage}%
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.pendingStatus}>Sem progresso registrado.</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0f14',
    padding: 20,
  },  scrollView: {
    backgroundColor: '#0d0f14', // Defina o fundo para evitar o branco ao redor
  }, scrollContainer: {
    flexGrow: 1, // Garante que o ScrollView ocupe todo o espaço disponível
    padding: 20, // Espaçamento ao redor de todos os itens
  },
  infoContainer: {
    marginTop: 20,
    alignItems: 'center',
    
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#00eeff', // Texto em azul neon
  },
  friendCount: {
    fontSize: 18,
    color: '#888',
  },
  friendStatus: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  pendingStatus: {
    fontSize: 16,
    color: 'orange',
    marginTop: 10,
  },
  friendStatusButton: {
    backgroundColor: '#ff5252',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  friendStatusButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  progressItem: {
    marginVertical: 10,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'white' ,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progress: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
  }, 

});

export default FriendDripRoast;
