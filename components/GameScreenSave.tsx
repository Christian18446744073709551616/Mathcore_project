import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MathQuiz from '../components/MathQuiz';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import AvatarView from '../components/AvatarView';

type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { lobbyId, lessonTitle, session } = route.params;

  const [gameData, setGameData] = useState({
    lobbyId,
    lessonTitle,
    session,
    answers: [] as number[],
    currentQuestion: 0,
    isFinished: false,
  });

  const [players, setPlayers] = useState<any[]>([]);
  const [hasFinished, setHasFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const gameChannel = supabase.channel(`lobby_players:lobby_id=eq.${lobbyId}`, {
      config: { presence: { key: session.user.id } },
    });

    const setupListeners = () => {
      gameChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = gameChannel.presenceState();
          const playersList = parsePresenceState(newState);
          setPlayers(playersList);
          console.log('Estado de presença atualizado:', playersList);
        })
        .on('broadcast', { event: 'player-progress-updated' }, (payload) => {
          setPlayers((prevPlayers) =>
            prevPlayers.map((player) =>
              player.id === payload.payload.user_id && player.currentQuestion !== payload.payload.currentQuestion
                ? { ...player, currentQuestion: payload.payload.currentQuestion }
                : player
            )
          );
          console.log('Progresso recebido via broadcast:', payload.payload);
        })
        .on('broadcast', { event: 'player-finished' }, (payload) => {
          setPlayers((prevPlayers) =>
            prevPlayers.map((player) =>
              player.id === payload.payload.user_id
                ? { ...player, isFinished: true, score: payload.payload.score } // Atualiza a pontuação do jogador
                : player
            )
          );
          console.log('Jogador terminou:', payload.payload.user_id);
        });
    };

    gameChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await gameChannel.track({
          user_id: session.user.id,
          username: session.user.user_metadata?.username || 'Jogador',
          avatar: session.user.user_metadata?.avatar_url || '',
          is_ready: false,
          currentQuestion: gameData.currentQuestion,
          isFinished: false,
          score: 0, // Inicializa com 0
        });
        console.log('Jogador adicionado ao estado de presença');
      }
    });

    setupListeners();

    return () => {
      gameChannel.unsubscribe();
    };
  }, [lobbyId]);

  const parsePresenceState = (state: any) => {
    return Object.values(state)
      .flat()
      .map((presence: any) => ({
        id: presence.user_id || '',
        username: presence.username || 'Jogador',
        avatar: presence.avatar || '',
        isReady: presence.is_ready || false,
        currentQuestion: presence.currentQuestion || 0,
        isFinished: presence.isFinished || false,
        score: presence.score || 0, // Adiciona o score ao estado do jogador
      }));
  };

  const handleFinishGame = () => {
    if (hasFinished) return;
    setHasFinished(true);

    supabase.channel(`lobby_players:lobby_id=eq.${lobbyId}`).send({
      type: 'broadcast',
      event: 'player-finished',
      payload: { user_id: session.user.id, score }, // Envia o score ao finalizar o jogo
    });

    console.log('Status de término enviado com a pontuação:', score);
  };

  const updateGameData = (isCorrect: boolean, answer: number) => {
    const newCurrentQuestion = gameData.currentQuestion + 1;
    const isFinished = newCurrentQuestion > totalQuestions;

    setGameData((prevData) => ({
      ...prevData,
      answers: [...prevData.answers, answer],
      currentQuestion: newCurrentQuestion,
      isFinished,
    }));

    // Atualiza o score se a resposta estiver correta
    if (isCorrect) {
      setScore((prevScore) => prevScore + 100); // Adiciona pontos por resposta correta
    }

    supabase.channel(`lobby_players:lobby_id=eq.${lobbyId}`).send({
      type: 'broadcast',
      event: 'player-progress-updated',
      payload: { user_id: session.user.id, currentQuestion: newCurrentQuestion },
    });

    if (isFinished) {
      handleFinishGame();
    }

    console.log('Broadcast enviado:', { currentQuestion: newCurrentQuestion, user_id: session.user.id, isFinished });
  };

  const totalQuestions = 9;

  const getPlayerPosition = (currentQuestion: number) => {
    return (currentQuestion / totalQuestions) * 100;
  };

  const allPlayersFinished = players.length > 0 && players.every((player) => player.isFinished);

  return (
    <View style={styles.container}>
    {!allPlayersFinished ? (
      <View>
        <Text style={styles.waitingText}>Esperando os outros jogadores terminarem...</Text>
        <View style={styles.finishLine}>
          {players.map((player, index) => {
            const isCurrentPlayer = player.id === session.user.id;
  
            return (
              <View
                key={index}
                style={[
                  styles.playerAvatar,
                  { left: `${getPlayerPosition(player.currentQuestion)}%` },
                  isCurrentPlayer ? styles.currentPlayer : {},
                ]}
              >
                <Image
                  source={{ uri: player.avatar || 'https://via.placeholder.com/50' }}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{player.username}</Text>
                <Text style={styles.statusText}>
                  {isCurrentPlayer ? 'Sua posição' : 'Progresso'}: {player.currentQuestion + 1}
                </Text>
              </View>
            );
          })}
        </View>
        <MathQuiz
          lessonTitle={lessonTitle}
          session={session}
          updateGameData={updateGameData}
          onQuizFinished={() => {
            if (!hasFinished) {
              handleFinishGame();
            }
          }}
        />
      </View>
    ) : (
      <View style={styles.scoreboard}>
        <Text style={styles.title}>Placar Final</Text>
        {players.map((player) => (
          <View key={player.id} style={styles.playerScore}>
            <Text>{player.username}: {player.score}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#010017',
  },
  finishLine: {
    position: 'relative',
    width: '90%',
    height: 10,
    backgroundColor: '#383C54',
    marginVertical: 90,
    borderRadius: 10,
    justifyContent: 'center',
  },
  playerScore: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  waitingText: {
    fontSize: 16,
    color: 'white',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreboard: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
  },
  
  playerAvatar: {
    position: 'absolute',
    bottom: 10, // Ajuste conforme necessário
    width: 50,
    height: 50,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },

  username: {
    position: 'absolute',
    top: 45,
    fontSize: 12,
    color: '#E0E0E0',
    fontWeight: 'bold',
  }, 
  statusText: {
    position: 'absolute',
    top: 30,
    fontSize: 10,
    color: '#E0E0E0',
  },
  currentPlayer: {
    position: 'absolute',
    borderColor: 'blue', // Exemplo de borda amarela para o próprio jogador
    borderWidth: 2, // Adiciona uma borda ao redor do avatar
  },
});

export default GameScreen;
