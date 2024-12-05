import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Button } from 'react-native';
import MathQuiz from '../components/MathQuiz';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import AvatarView from '../components/AvatarView';

type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { lobbyId, lessonTitle, session } = route.params;
  const [questions, setQuestions] = useState<any[]>([]);  // Declare as perguntas aqui
  const [userAnswer, setUserAnswer] = useState<string>(''); // Estado local no GameScreen
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);

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
  const [showIncorrectAnswers, setShowIncorrectAnswers] = useState(false); // Estado para controlar a visibilidade das respostas erradas
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
  
    const gameResults = {
      userId: session.user.id,
      username: session.user.user_metadata?.username || 'Jogador',
      score,
      ranking: players
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
          position: index + 1,
          username: player.username,
          score: player.score,
        })),
    };
  
    // Envia o status de término para o canal
    supabase.channel(`lobby_players:lobby_id=eq.${lobbyId}`).send({
      type: 'broadcast',
      event: 'player-finished',
      payload: { user_id: session.user.id, score },
    });
  
    console.log('Status de término enviado com a pontuação:', score);
  };
  
  const updateGameData = (isCorrect: boolean, answer: number, correctAnswer: number) => {
    const newCurrentQuestion = gameData.currentQuestion + 1; // Avança para a próxima questão
    const isFinished = newCurrentQuestion > totalQuestions; // Verifica se o quiz terminou
  
    // Atualiza o estado do jogo com as respostas dadas
    setGameData((prevData) => ({
      ...prevData,
      answers: [...prevData.answers, answer], // Adiciona a resposta dada ao histórico
      currentQuestion: newCurrentQuestion, // Atualiza o número da questão atual
      isFinished, // Atualiza o status de finalização do quiz
    }));
  
    // Atualiza a pontuação se a resposta estiver correta
    if (isCorrect) {
      setScore((prevScore) => prevScore + 100); // Adiciona pontos por resposta correta
    } else {
      // Adiciona ao histórico de respostas erradas
      setWrongAnswers((prevWrongAnswers) => [
        ...prevWrongAnswers,
        {
          question: questions[gameData.currentQuestion], // A questão que foi respondida
          wrongAnswer: answer, // Resposta errada fornecida
          correctAnswer, // Resposta correta
        },
      ]);
    }
  
    // Envia os dados de progresso do jogador pelo canal de broadcast
    supabase.channel(`lobby_players:lobby_id=eq.${lobbyId}`).send({
      type: 'broadcast',
      event: 'player-progress-updated',
      payload: { user_id: session.user.id, currentQuestion: newCurrentQuestion },
    });
  
    // Verifica se o jogo terminou e chama a função de finalização do jogo
    if (isFinished) {
      handleFinishGame();
    }
  
    console.log('Broadcast enviado:', { currentQuestion: newCurrentQuestion, user_id: session.user.id, isFinished });
  };
  


  const totalQuestions = 9;


  const getPlayerPosition = (currentQuestion: number) => {
    return (currentQuestion / totalQuestions) * 100;
  };
  const handleIncorrectAnswers = (question: any, wrongAnswer: number, correctAnswer: number) => {
    setWrongAnswers((prevWrongAnswers) => [
      ...prevWrongAnswers,
      { question, wrongAnswer, correctAnswer },
    ]);
  };
  
  const toggleIncorrectAnswers = () => {
    setShowIncorrectAnswers(!showIncorrectAnswers);
  };

  const allPlayersFinished = players.length > 0 && players.every((player) => player.isFinished);


  return (
    <View style={styles.container}>
      {!allPlayersFinished ? (
        <View>
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
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            setQuestionsToParent={setQuestions}
            sendIncorrectAnswers={handleIncorrectAnswers}
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
          {players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <View key={player.id} style={styles.playerScore}>
                <Text>{player.username}: {player.score}</Text>
                {index === 0 && <Text style={styles.rankText}>1º</Text>}
                {index === 1 && <Text style={styles.rankText}>2º</Text>}
                {index === 2 && <Text style={styles.rankText}>3º</Text>}
              </View>
            ))}
          {/* Botão para mostrar as respostas erradas */}
          <Button title="Mostrar Perguntas Erradas" onPress={toggleIncorrectAnswers} />
          {showIncorrectAnswers && (
            <View style={styles.incorrectAnswers}>
              {wrongAnswers.map((answer, index) => (
                <View key={index} style={styles.incorrectAnswer}>
                   <Text>{`Pergunta: ${answer.question?.text || answer.question || 'Pergunta indisponível'}`}</Text>
                  <Text>{`Sua resposta: ${answer.wrongAnswer}`}</Text>
                  <Text>{`Resposta correta: ${answer.correctAnswer}`}</Text>
                </View>
              ))}
            </View>
          )}
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
   noQuestionsText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
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
    marginBottom: 10,
    alignItems: 'center',
  },
  currentPlayer: {
    position: 'absolute',
    borderColor: 'blue', // Exemplo de borda amarela para o próprio jogador
    borderWidth: 2, // Adiciona uma borda ao redor do avatar
    borderRadius: 20,
    marginBottom: 5,
    width: 40,
    height: 40,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gold', // O destaque pode ser em dourado ou outra cor
    textAlign: 'center',
  }, incorrectAnswers: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  incorrectAnswer: {
    marginBottom: 10,
  },
});

export default GameScreen;
