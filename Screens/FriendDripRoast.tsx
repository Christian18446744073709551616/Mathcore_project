import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AvatarView from '../components/AvatarView';
import { supabase } from '../lib/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { addFriend, removeFriend } from '../services/Friendzone';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
}

const FriendDripRoast = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as { userId: string };
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friendCount, setFriendCount] = useState(0);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [friendProgress, setFriendProgress] = useState<{ lessonTitle: string; progressPercentage: number }[]>([]);
  const [friendRequestStatus, setFriendRequestStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);

  const handleReturn = () => {
    navigation.goBack();
  };

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const fetchUserProfileAndProgress = async () => {
    try {
      setLoading(true);
      
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

      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_title, progress_percentage')
        .eq('user_id', profile.id);

      if (progressError) {
        console.error('Erro ao buscar progresso do amigo:', progressError);
      } else {
        const formattedProgress = progress.map(item => ({
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
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('user_id, friend_id, accepted')
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${viewedUserId}),and(user_id.eq.${viewedUserId},friend_id.eq.${currentUserId})`);
  
      if (error) {
        console.error('Erro ao verificar amizade:', error);
        return;
      }
  
      const isAlreadyFriend = friendships.some(f => f.accepted);
      const isPendingRequest = friendships.some(f => !f.accepted);
  
      setIsFriend(isAlreadyFriend);
      setRequestSent(isPendingRequest);
  
    } catch (err) {
      console.error('Erro inesperado ao verificar amizade:', err);
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
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          onPress: () => confirmRemoveFriend(),
        },
      ]
    );  
  };

  const confirmRemoveFriend = async () => {
    if (session && session.user) {
      try {
        const userId1 = session.user.id;
        const userId2 = userId;
  
        await removeFriend(userId1, userId2);
        await removeFriend(userId2, userId1);
  
        setIsFriend(false);
        setFriendCount((prevCount) => prevCount - 1);
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
      fetchUserProfileAndProgress();
      fetchFriendCount();
      checkIfFriend(session.user.id, userId);
  
      const channel = supabase
        .channel(`friendships:user=${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `user_id=eq.${session.user.id} OR friend_id=eq.${session.user.id}`,
          },
          async (payload) => {
            const { new: newFriendship, eventType } = payload;
  
            if (eventType === 'INSERT') {
              if (newFriendship.user_id === session.user.id) {
                setFriendRequestStatus('aguardando resposta');
              }
            } else if (eventType === 'UPDATE') {
              if (newFriendship.accepted) {
                setIsFriend(true);
                setFriendRequestStatus('');
              } else {
                setFriendRequestStatus('aguardando resposta');
              }
            }
            await fetchFriendCount();
            await checkIfFriend(session.user.id, userId);
          }
        )
        .subscribe();
  
      return () => {
        channel.unsubscribe();
      };
    }
  }, [userId, session]);
  
  if (loading || !userProfile) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#242948', '#5C6494']}
          locations={[0.65, 0.30]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.85, y: 0.4 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#00eeff" />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1 }}
      >
        <TouchableOpacity onPress={handleReturn} style={styles.returnButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={[styles.scrollView, { backgroundColor: 'transparent' }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { backgroundColor: 'transparent' }]}>
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
      </LinearGradient>
    </View>
   );
};

const styles = StyleSheet.create({
  returnButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(42, 46, 77, 0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0f14',
    padding: 20,
  },
  scrollView: {
    backgroundColor: '#0d0f14',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  infoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#00eeff',
  },
  friendCount: {
    fontSize: 18,
    color: '#888',
  },
  friendStatus: {
    fontSize: 16,
    color: 'lightgreen',
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