import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, Modal } from 'react-native'; // 🆕 Adicionado Modal
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, setupQuizMatchChannel } from '../../lib/supabase';
import AvatarView from '../../components/AvatarView';
import { RootStackParamList } from '../../types';
import QRCode from 'react-native-qrcode-svg'; // 🆕 NOVO IMPORT
import * as Clipboard from 'expo-clipboard'; // 🆕 NOVO IMPORT
import { generateQRCodeContent } from '../../utils/qrCodeUtils'; // 🆕 NOVO IMPORT

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

  const { matchId, quizId, quizTitle } = route.params;

  // Gerar código de sala de 6 dígitos numéricos baseado no matchId
  const roomCode = (() => {
    const hash = matchId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 1000000).toString().padStart(6, '0');
  })();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false); // 🆕 NOVO STATE
  const [qrUrl, setQrUrl] = useState<string>(''); // 🆕 NOVO STATE

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

            const { data: quizFromDb, error } = await supabase
              .from('quizzes')
              .select('*')
              .eq('id', quizId)
              .single();

            if (error) {
              console.error('❌ Erro ao buscar quiz:', error);
              return;
            }

            const finalQuizData = {
              id: (quizFromDb as any).id,
              title: (quizFromDb as any).title,
              questions: (quizFromDb as any).questions,
            };

            console.log('✅ Quiz carregado do banco:', finalQuizData);

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
  }, [matchId, quizId, navigation]);

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
      setIsReady(!newReadyStatus);
    } else {
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

    const { data: quizFromDb, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) {
      console.error('❌ Erro ao buscar quiz:', quizError);
      if (Platform.OS === 'web') {
        alert('Erro ao buscar quiz.');
      } else {
        Alert.alert('Erro', 'Não foi possível buscar o quiz.');
      }
      return;
    }

    const finalQuizData = {
      id: (quizFromDb as any).id,
      title: (quizFromDb as any).title,
      questions: (quizFromDb as any).questions,
    };

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
      quizData: finalQuizData,
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

  // 🆕 NOVA FUNÇÃO: Mostrar modal de QR Code
  const handleShowQRCode = () => {
    const url = generateQRCodeContent({
      type: 'quiz_invite',
      matchId: matchId,
      quizId: quizId,
      quizTitle: quizTitle,
    }) || '';
    setQrUrl(url);
    setShowQRModal(true);
  };

  // 🆕 NOVA FUNÇÃO: Copiar link do QR Code
  const handleCopyQRLink = async () => {
    if (!qrUrl) return;
    await Clipboard.setStringAsync(qrUrl);
    if (Platform.OS === 'web') {
      alert('Link copiado! Compartilhe com seus amigos.');
    } else {
      Alert.alert('Link Copiado', 'Compartilhe o link com seus amigos para entrarem no quiz!');
    }
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

        {/* 🆕 NOVO: Botão para mostrar QR Code */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={handleShowQRCode}
        >
          <Ionicons name="qr-code" size={24} color="white" />
          <Text style={styles.qrButtonText}>Mostrar QR Code</Text>
        </TouchableOpacity>

        {/* 🆕 NOVO: Exibir código da sala */}
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Código da Sala:</Text>
          <Text style={styles.roomCodeValue}>{roomCode}</Text>
        </View>

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

      {/* 🆕 NOVO: Modal do QR Code */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <TouchableOpacity 
              style={styles.qrCloseButton} 
              onPress={() => setShowQRModal(false)}
            >
              <Ionicons name="close-circle" size={32} color="#333" />
            </TouchableOpacity>

            <Text style={styles.qrModalTitle}>Convide seus amigos!</Text>
            
            {qrUrl ? (
              <>
                <View style={styles.qrCodeContainer}>
                  <QRCode value={qrUrl} size={240} />
                </View>
                
                <Text style={styles.qrQuizTitle}>{quizTitle || 'Quiz'}</Text>
                
                <Text style={styles.qrInstruction}>
                  Escaneie o QR Code ou copie o link para compartilhar
                </Text>

                <TouchableOpacity 
                  style={styles.copyLinkButton}
                  onPress={handleCopyQRLink}
                >
                  <Ionicons name="copy-outline" size={20} color="white" />
                  <Text style={styles.copyLinkButtonText}>Copiar Link</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>Gerando QR Code...</Text>
            )}
          </View>
        </View>
      </Modal>
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
  // 🆕 NOVOS ESTILOS: Botão de QR Code
  qrButton: {
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    gap: 10,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  // 🆕 NOVOS ESTILOS: Código da sala
  roomCodeContainer: {
    backgroundColor: 'rgba(112, 125, 203, 0.1)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#707DCB',
  },
  roomCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  roomCodeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  // 🆕 NOVOS ESTILOS: Modal de QR Code
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  qrCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  qrModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  qrQuizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  qrInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  copyLinkButton: {
    backgroundColor: '#707DCB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  copyLinkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizWaitingRoom;