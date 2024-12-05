import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import AvatarView from '../components/AvatarView';
import FriendInvitePopup from '../components/FriendInvitePopup';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LobbyRouteProp = RouteProp<RootStackParamList, 'Lobby'>;
type LobbyNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lobby'>;

interface LobbyProps {
  route: LobbyRouteProp;
}

interface Player {
  id: string;
  username: string;
  avatar_url: string;
  is_ready: boolean;
  is_host: boolean;
}

const Lobby: React.FC<LobbyProps> = ({ route }) => {
  const navigation = useNavigation<LobbyNavigationProp>();
  const { lobbyId, lessonTitle, session } = route.params;
  const [players, setPlayers] = useState<Player[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const fetchPlayers = async () => {
    if (!lobbyId) {
      console.error('Lobby ID é indefinido');
      return;
    }

    const { data: playerData, error: playerError } = await supabase
      .from('lobby_players')
      .select('player_id, is_ready, is_host')
      .eq('lobby_id', lobbyId);

    if (playerError) {
      console.error('Erro ao buscar jogadores:', playerError);
      return;
    }

    const playerIds = playerData.map((player) => player.player_id);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', playerIds);

    if (profileError) {
      console.error('Erro ao buscar perfis:', profileError);
      return;
    }

    const playerList: Player[] = playerData.map((player) => {
      const profile = profileData?.find((p) => p.id === player.player_id);
      return {
        id: player.player_id,
        username: profile?.username || 'Desconhecido',
        avatar_url: profile?.avatar_url || '',
        is_ready: player.is_ready,
        is_host: player.is_host,
      };
    });

    setPlayers(playerList);
  console.log("perfis buscados")
  };

  const toggleReadyStatus = async () => {
    const newReadyStatus = !isReady;
    setIsReady(newReadyStatus);
  
    console.log('Atualizando status de pronto para:', newReadyStatus);
  
    // Atualiza o status 'is_ready' no banco de dados do Supabase
    const { error } = await supabase
      .from('lobby_players')
      .update({ is_ready: newReadyStatus })
      .eq('lobby_id', lobbyId)
      .eq('player_id', session.user.id);
  
    if (error) {
      console.error('Erro ao atualizar o status de pronto:', error);
    } else {
      console.log('Status de pronto atualizado no banco de dados');
    }
  
    // Envia o status 'pronto' para todos os jogadores via broadcast
    await supabase
      .channel(`lobby_players:lobby_id=eq.${lobbyId}`)
      .send({
        type: 'broadcast',
        event: 'ready-status-changed',
        payload: { user_id: session.user.id, is_ready: newReadyStatus },
      });
  
    console.log('Status de pronto enviado para todos os jogadores via broadcast');
  };
  
  useEffect(() => {
    // Função assíncrona interna para lidar com a lógica
    const fetchData = async () => {
      fetchPlayers();
      console.log('Buscando jogadores...');
  
      // Função para buscar o status de 'is_host' de 'lobby_players' para um jogador
      const fetchPlayerStatus = async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('lobby_players')
            .select('is_host')
            .eq('player_id', userId)
            .eq('lobby_id', lobbyId)
            .limit(1);  // Alterado para .limit(1)
      
          if (error) {
            console.error('Erro ao buscar status de jogador:', error);
            return { is_host: false }; // Retorna falso por padrão se houver erro
          }
      
          // Verifica se há dados válidos e retorna o status do host
          return data && data.length > 0 ? data[0] : { is_host: false };
        } catch (err) {
          console.error('Erro inesperado ao buscar status de jogador:', err);
          return { is_host: false }; // Retorna falso por padrão em erro
        }
      };
      
  
      // Criação do canal de lobby
      const lobbyChannel = supabase
        .channel(`lobby_players:lobby_id=eq.${lobbyId}`)
        .on('presence', { event: 'sync' }, async () => {
          console.log('Evento de sincronização de presença disparado');
          const newState = lobbyChannel.presenceState();
          console.log('Estado de presença inicial:', newState);
  
          if (Object.keys(newState).length === 0) {
            console.log("Sem jogadores presentes!");
          } else {
            // Atualizando a lista de jogadores com base nas presenças
            const allPresences = Object.values(newState)
              .flat()
              .map(async (presence: any) => {
                console.log('Presença recebida:', presence);
  
                // Buscar dados do perfil do jogador
                const profileData = await fetchProfileData(presence.user_id);
  
              
         
  
                // Agora sabemos se o jogador é o host com base no status
             
  
                const playerData = {
                  id: presence.user_id || '',
                  username: profileData.username || 'Desconhecido',
                  avatar_url: profileData.avatar_url || '',
                  is_ready: presence.is_ready || false, // Presumo que 'is_ready' seja parte de 'presence'
                  is_host: presence.is_host || false, 
                };
  
                console.log('Dados do jogador processado:', playerData);
                return playerData;
              });
  
            // Aguarda todas as promessas de perfil e status serem resolvidas antes de atualizar os jogadores
            const resolvedPlayers = await Promise.all(allPresences);
  
            console.log('Presenças atualizadas:', resolvedPlayers);
            setPlayers(prevPlayers => {
              // Atualiza a lista de jogadores com base nas presenças
              return resolvedPlayers;
            });
          }
        })
        .on('broadcast', { event: 'player_joined' }, ({ payload }: { payload: any }) => {
          console.log('Jogador entrou no lobby via broadcast:', payload);
          setPlayers(prevPlayers => {
            if (!prevPlayers.some(player => player.id === payload.user_id)) {
              return [
                ...prevPlayers,
                {
                  id: payload.user_id,
                  username: payload.username,
                  avatar_url: payload.avatar_url,
                  is_ready: payload.is_ready,
                  is_host: payload.is_host,
                },
              ];
            }
            return prevPlayers;
          });

          
        })
        .on('broadcast', { event: 'ready-status-changed' }, ({ payload }: { payload: any }) => {
    console.log('Status de pronto atualizado via broadcast:', payload);
    setPlayers(prevPlayers => {
      // Atualiza o status de pronto do jogador específico que alterou
      return prevPlayers.map(player =>
        player.id === payload.user_id
          ? { ...player, is_ready: payload.is_ready }
          : player
      );
    });
  })
  .on('broadcast', { event: 'ready-status-changed' }, ({ payload }: { payload: any }) => {
    console.log('Status de pronto atualizado via broadcast:', payload);
    setPlayers(prevPlayers => {
      // Atualiza o status de pronto do jogador específico que alterou
      return prevPlayers.map(player =>
        player.id === payload.user_id
          ? { ...player, is_ready: payload.is_ready }
          : player
      );
    });
  })
  .subscribe();
  
      // Função para buscar dados de perfil do usuário
      const fetchProfileData = async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', userId)
            .single();
  
          if (error) {
            console.error('Erro ao buscar perfil:', error);
            return { username: '', avatar_url: '' }; // Definindo valor padrão
          }
  
          return data || { username: '', avatar_url: '' }; // Garantindo o retorno correto
        } catch (err) {
          console.error('Erro inesperado ao buscar perfil:', err);
          return { username: '', avatar_url: '' }; // Garantindo valor padrão
        }

         




      };
  
      // Registra a presença do jogador com o avatar e username
      if (session?.user) {
        console.log("Dados do usuário:", session.user);
  
        // Verifica se o jogador atual é o host consultando a tabela de jogadores no lobby
        const playerStatus = await fetchPlayerStatus(session.user.id);
        const isHost = playerStatus.is_host;
  
        lobbyChannel.track({ 
          user_id: session.user.id,
          username: session.user.username || 'Desconhecido',
          avatar_url: session.user.avatar_url || '',
          is_ready: false,
          is_host: isHost
        });
      } else {
        console.error("Erro: usuário não autenticado ou session não disponível.");
      }
  
      // Verificação se o canal foi configurado corretamente
      console.log('Canal de lobby criado:', lobbyChannel);
  
      // Desinscreve o canal quando o componente for desmontado
      return () => {
        lobbyChannel.unsubscribe();
        console.log('Canal de lobby desconectado');
      };
    };
  
    // Chama a função assíncrona dentro do useEffect
    fetchData();
  
  }, [lobbyId, session.user]);
  

   // Não use 'players' aqui
  
  

  const startGame = async () => {
    const { error } = await supabase
      .from('lobbies')
      .update({ is_game_active: true })
      .eq('id', lobbyId);

    if (error) {
      console.error('Erro ao iniciar o jogo:', error);
    } else {
      setIsGameActive(true);
      handleStartGame();
    }
  };

  const inviteFriend = async (friendId: string) => {
    const { error } = await supabase.from('messages').insert([{
      sender_id: session.user.id,
      receiver_id: friendId,
      message_text: `Você foi convidado para o lobby!`,
      message_type: 'invitation',
      lobby_id: lobbyId,
    }]);

    if (error) {
      console.error('Erro ao enviar convite:', error);
    } else {
      console.log('Convite enviado com sucesso!');
    }
  };

  const handleStartGame = () => {
    navigation.navigate('GameScreen', {
      lobbyId,
      lessonTitle,
      session,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Lobby - {isGameActive ? 'Jogo em andamento' : 'Aguardando jogadores'}
      </Text>
      <FlatList
        data={players}
        keyExtractor={(player) => player.id}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <AvatarView size={50} url={item.avatar_url} />
            <Text style={styles.username}>{item.username}</Text>
            <Text>{item.is_ready ? '✔️ Pronto' : '❌ Aguardando'}</Text>
            {item.is_host && <Text style={styles.hostLabel}>(Host)</Text>}
          </View>
        )}
      />
      <Button title={isReady ? 'Cancelar Pronto' : 'Estou Pronto'} onPress={toggleReadyStatus} />
      <Button title="Iniciar Jogo" onPress={startGame} disabled={isGameActive} />
      <Button title="Convidar Amigo" onPress={() => setIsPopupVisible(true)} />
      <FriendInvitePopup
        isVisible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        onInvite={inviteFriend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#FFFFFF',
    marginVertical: 5,
  },
  username: {
    color: '#FFFFFF',
    marginLeft: 10,
  },
  hostLabel: {
    fontSize: 12,
    color: 'gold',
    marginLeft: 10,
  },
});

export default Lobby;
