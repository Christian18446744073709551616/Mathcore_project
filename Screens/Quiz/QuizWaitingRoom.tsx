import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
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
  const [hostId, setHostId] = useState<string | null>(null);

  // Buscar sessão do usuário
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const resp = await supabase.auth.getSession();
        const sessionFromResp = (resp as any)?.data?.session ?? null;
        setSession(sessionFromResp);
      } catch (err) {
        console.error('Erro ao obter sessão:', err);
        setSession(null);
      }
    };
    fetchSession();
  }, []);

  // Buscar participantes
  const fetchParticipants = async () => {
    if (!matchId) return;

    console.log('🔄 Buscando participantes do match:', matchId);

    const { data: participantData, error: participantError } = await supabase
      .from('quiz_participants')
      .select('user_id, is_ready')
      .eq('match_id', matchId);

    if (participantError) {
      console.error('❌ Erro ao buscar participantes:', participantError);
      return;
    }

    if (!participantData || participantData.length === 0) {
      setParticipants([]);
      return;
    }

    const { data: matchData, error: matchError } = await supabase
      .from('quiz_matches')
      .select('host_id')
      .eq('id', matchId)
      .single();

    if (matchError) {
      console.error('❌ Erro ao buscar match:', matchError);
    }

    const currentHostId = (matchData as any)?.host_id ?? null;
    setHostId(currentHostId);
    setIsHost(session?.user?.id === currentHostId);

    const userIds = participantData.map((p: any) => p.user_id);

    // Buscar perfis (se houver userIds)
    let profileData: any[] = [];
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profileError) {
        console.error('❌ Erro ao buscar perfis:', profileError);
      } else {
        profileData = profiles ?? [];
      }
    }

    const participantList: Participant[] = participantData.map((p: any) => {
      const profile = profileData.find((prof: any) => prof.id === p.user_id) ?? {};
      return {
        id: p.user_id,
        username: profile.username ?? 'Usuário',
        avatar_url: profile.avatar_url ?? '',
        is_ready: !!p.is_ready,
        is_host: p.user_id === currentHostId,
      };
    });

    console.log('✅ Participantes carregados:', participantList);
    setParticipants(participantList);

    // Atualiza isReady do usuário atual, se presente
    if (session?.user?.id) {
      const me = participantList.find((pt) => pt.id === session.user.id);
      setIsReady(!!me?.is_ready);
      setIsHost(session.user.id === currentHostId);
    }
  };

  // Listener para detectar quando o jogo inicia
  useEffect(() => {
    if (!matchId) return;

    console.log('🎮 Configurando listener para início do jogo...');
    console.log('📦 quizData disponível:', !!quizData);

    const matchChannel = supabase
      .channel(`quiz_match_status:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_matches',
          filter: `id=eq.${matchId}`,
        },
        async (payload: any) => {
          console.log('🔔 Match atualizado:', payload);
          
          if (payload?.new?.is_active === true) {
            console.log('🚀 Jogo iniciado! Navegando para GameQuizScreen...');
            
            // Buscar quizData se não tiver sido passado
            let finalQuizData = quizData;
            if (!finalQuizData) {
              console.log('⚠️ quizData não disponível, buscando do Supabase...');
              
              const { data: quizFromDb, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', quizId)
                .single();
              
              if (error) {
                console.error('❌ Erro ao buscar quiz:', error);
                return;
              }
              
              finalQuizData = {
                id: (quizFromDb as any).id,
                title: (quizFromDb as any).title,
                questions: (quizFromDb as any).questions,
              };
              
              console.log('✅ Quiz carregado do banco:', finalQuizData);
            }

            navigation.navigate('GameQuizScreen', {
              quizData: finalQuizData,
              mode: 'multiplayer',
              matchId: matchId,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Desconectando listener de início de jogo');
      try {
        matchChannel.unsubscribe();
      } catch (e) {
        // ignora erros de unsubscribe
      }
    };
  }, [matchId, quizData, quizId, navigation]);

  // Configurar canal de realtime para participantes
  useEffect(() => {
    fetchParticipants();

    if (!matchId) return;

    const channel = setupQuizMatchChannel(matchId, (payload: any) => {
      console.log('🔔 Atualização de participante:', payload);
      fetchParticipants();
    });

    return () => {
      try {
        channel.unsubscribe();
      } catch (e) {
        // ignora
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, session]);

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
      console.error('❌ Erro ao atualizar status de pronto:', error);
      // reverter estado local em caso de erro
      setIsReady(!newReadyStatus);
    } else {
      // atualizar lista local para refletir mudança imediata
      setParticipants((prev) =>
        prev.map((p) => (p.id === session.user.id ? { ...p, is_ready: newReadyStatus } : p))
      );
    }
  };

  const handleStartGame = async () => {
    if (!isHost) {
      if (Platform.OS === 'web') {
        alert('Apenas o host pode iniciar o jogo!');
      } else {
        Alert.alert('Atenção', 'Apenas o host pode iniciar o jogo!');
      }
      return;
    }

    if (participants.length < 2) {
      if (Platform.OS === 'web') {
        alert('É necessário pelo menos 2 jogadores para iniciar!');
      } else {
        Alert.alert('Atenção', 'É necessário pelo menos 2 jogadores para iniciar!');
      }
      return;
    }

    console.log('🚀 Host iniciando o jogo...');

    const { error } = await supabase
      .from('quiz_matches')
      .update({ is_active: true })
      .eq('id', matchId);

    if (error) {
      console.error('❌ Erro ao iniciar o jogo:', error);
      if (Platform.OS === 'web') {
        alert('Erro ao iniciar o jogo.');
      } else {
        Alert.alert('Erro', 'Não foi possível iniciar o jogo.');
      }
      return;
    }

    console.log('✅ Match atualizado para is_active=true');

    navigation.navigate('GameQuizScreen', {
      quizData: quizData,
      mode: 'multiplayer',
      matchId: matchId,
    });
  };

  const handleLeaveRoom = () => {
    if (!session?.user?.id) return;

    if (Platform.OS === 'web') {
      const confirmar = window.confirm('Tem certeza que deseja sair?');
      if (confirmar) {
        executarSaida();
      }
    } else {
      Alert.alert(
        'Sair da Sala',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: executarSaida },
        ]
      );
    }
  };

  const executarSaida = async () => {
    if (!session?.user?.id) return;

    await supabase
      .from('quiz_participants')
      .delete()
      .eq('match_id', matchId)
      .eq('user_id', session.user.id);

    if (isHost) {
      await supabase.from('quiz_matches').delete().eq('id', matchId);
    }

    navigation.goBack();
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
        <Text style={styles.subtitle}>
          Aguardando jogadores... ({participants.length} {participants.length === 1 ? 'jogador' : 'jogadores'})
        </Text>

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

        {!isHost && (
          <TouchableOpacity
            style={[styles.readyButton, isReady && styles.readyButtonActive]}
            onPress={toggleReadyStatus}
          >
            <Text style={styles.readyButtonText}>
              {isReady ? 'Cancelar Pronto' : 'Estou Pronto'}
            </Text>
          </TouchableOpacity>
        )}

        {isHost && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
          >
            <Text style={styles.startButtonText}>🚀 Iniciar Jogo</Text>
          </TouchableOpacity>
        )}
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
  startButton: {
    backgroundColor: '#707DCB',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 'auto',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizWaitingRoom;