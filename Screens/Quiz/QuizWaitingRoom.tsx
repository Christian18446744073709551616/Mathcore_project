import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, setupQuizMatchChannel } from '../../lib/supabase';
import AvatarView from '../../components/AvatarView';
import { RootStackParamList } from '../../types';

type QuizWaitingRoomRouteProp = RouteProp<RootStackParamList, 'QuizWaitingRoom'>;
type QuizWaitingRoomNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuizWaitingRoom'>;

interface Participant {
  id: string;
  username: string;
  avatar_url: string;
  is_ready: boolean;
  is_host: boolean;
}

const QuizWaitingRoom = () => {
  const navigation = useNavigation<QuizWaitingRoomNavigationProp>();
  const route = useRoute<QuizWaitingRoomRouteProp>();
  
  const { matchId, quizId, quizTitle, quizData } = route.params;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  // Buscar sessão do usuário
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  // Buscar participantes
  const fetchParticipants = async () => {
    if (!matchId) return;

    const { data: participantData, error: participantError } = await supabase
      .from('quiz_participants')
      .select('user_id, is_ready')
      .eq('match_id', matchId);

    if (participantError) {
      console.error('Erro ao buscar participantes:', participantError);
      return;
    }

    // Buscar dados do host
    const { data: matchData } = await supabase
      .from('quiz_matches')
      .select('host_id')
      .eq('id', matchId)
      .single();

    const hostId = matchData?.host_id;

    const userIds = participantData.map((p) => p.user_id);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    if (profileError) {
      console.error('Erro ao buscar perfis:', profileError);
      return;
    }

    const participantList: Participant[] = participantData.map((p) => {
      const profile = profileData?.find((prof) => prof.id === p.user_id);
      return {
        id: p.user_id,
        is_ready: p.is_ready,
        is_host: p.user_id === hostId,
      };
    });

    setParticipants(participantList);

    // Verificar se o usuário atual é o host
    if (session?.user?.id === hostId) {
      setIsHost(true);
    }
  };

  // Configurar canal de realtime
  useEffect(() => {

    fetchParticipants();

    const channel = setupQuizMatchChannel(matchId, (payload) => {
      console.log('Atualização de participante:', payload);
      fetchParticipants();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [matchId, session]);

  // Alternar status "pronto"
  const toggleReadyStatus = async () => {
    if (!session?.user?.id) return;

    const newReadyStatus = !isReady;
    setIsReady(newReadyStatus);

    const { error } = await supabase
      .from('quiz_participants')
      .update({ is_ready: newReadyStatus })
      .eq('match_id', matchId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao atualizar status de pronto:', error);
    }
  };

  // Verificar se todos estão prontos
  const checkAllReady = () => {
    return participants.length > 1 && participants.every((p) => p.is_ready);
  };

  // Iniciar contagem regressiva quando todos estiverem prontos
  useEffect(() => {
    if (checkAllReady() && timer === null) {
      setTimer(5);
    } else if (!checkAllReady()) {
      setTimer(null);
    }
  }, [participants]);

  // Contagem regressiva
  useEffect(() => {

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          startGame();
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  // Iniciar o jogo
  const startGame = async () => {
    if (!isHost) return;

    const { error } = await supabase
      .from('quiz_matches')
      .update({ is_active: true })
      .eq('id', matchId);

    if (error) {
      console.error('Erro ao iniciar o jogo:', error);
      return;
    }

    handleStartGame();
  };

  const handleStartGame = () => {
    navigation.navigate('GameQuizScreen', {
      mode: 'multiplayer',
      matchId: matchId,
    });
  };

  // Sair da sala
  const handleLeaveRoom = async () => {
    if (!session?.user?.id) return;

    Alert.alert(
      'Sair da Sala',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            // Remover participante
            await supabase
              .from('quiz_participants')
              .delete()
              .eq('match_id', matchId)
              .eq('user_id', session.user.id);

            // Se for o host, deletar a partida
            if (isHost) {
              await supabase.from('quiz_matches').delete().eq('id', matchId);
            }

            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#242948', '#5C6494']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{quizTitle}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleLeaveRoom}>
          <Ionicons name="close-circle" size={40} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Aguardando jogadores...</Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.participantItem}>
              <AvatarView size={60} url={item.avatar_url} />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {item.username}
                  {item.is_host && ' 👑'}
                </Text>
                <Text style={styles.participantStatus}>
                  {item.is_ready ? '✅ Pronto' : '⏳ Aguardando'}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.participantList}
        />

        {timer !== null && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Iniciando em: {timer}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.readyButton, isReady && styles.readyButtonActive]}
          onPress={toggleReadyStatus}
        >
          <Text style={styles.readyButtonText}>
            {isReady ? 'Cancelar Pronto' : 'Estou Pronto'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  participantList: {
    paddingBottom: 20,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(112, 125, 203, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#707DCB',
  },
  participantInfo: {
    marginLeft: 15,
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  participantStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  timerContainer: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  readyButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 'auto',
  },
  readyButtonActive: {
    backgroundColor: '#f44336',
  },
  readyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizWaitingRoom;