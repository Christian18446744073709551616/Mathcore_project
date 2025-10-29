import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import AvatarView from '../../components/AvatarView';
import { RootStackParamList } from '../../types';

type QuizResultsScreenRouteProp = RouteProp<RootStackParamList, 'QuizResultsScreen'>;
type QuizResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuizResultsScreen'>;

interface PlayerResult {
  id: string;
  username: string;
  avatar_url: string;
  finished_at?: string | null;
  position?: number;
  score?: number;
  finished: boolean;
}

const QuizResultsScreen = () => {
  const navigation = useNavigation<QuizResultsScreenNavigationProp>();
  const route = useRoute<QuizResultsScreenRouteProp>();
  
  const { matchId, quizTitle, myFinishTime } = route.params;

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [allFinished, setAllFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [firstFinishTime, setFirstFinishTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const resp = await supabase.auth.getSession();
        const sessionData = (resp as any)?.data?.session ?? null;
        setSession(sessionData);
      } catch (err) {
        console.error('Erro ao obter sessão:', err);
        setSession(null);
      }
    };
    fetchSession();
  }, []);

  const fetchResults = async () => {
    if (!matchId) return;

    setLoading(true);
    try {
      console.log('📊 Buscando resultados do match:', matchId);

      const { data: participants, error: participantsError } = await supabase
        .from('quiz_participants')
        .select('user_id')
        .eq('match_id', matchId);

      if (participantsError) {
        console.error('❌ Erro ao buscar participantes:', participantsError);
        setLoading(false);
        return;
      }

      const { data: resultsDataRaw, error: resultsError } = await supabase
        .from('quiz_results')
        .select('user_id, finished_at, score, position')
        .eq('match_id', matchId)
        .order('finished_at', { ascending: true });

      if (resultsError) {
        console.error('❌ Erro ao buscar resultados:', resultsError);
        setLoading(false);
        return;
      }

      const resultsData = (resultsDataRaw as any[]) ?? [];
      console.log('📦 Resultados do banco:', resultsData);

      const userIds = (participants as any[]).map((p: any) => p.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        setLoading(false);
        return;
      }

      // montar lista completa com username/avatar e dados de resultado
      const participantsArr = (participants as any[]) ?? [];
      const profilesArr = (profiles as any[]) ?? [];

      const resultsList: PlayerResult[] = participantsArr.map((p: any) => {
        const userId = p.user_id;
        const resultEntry = resultsData.find((r) => r.user_id === userId);
        const profile = profilesArr.find((pr) => pr.id === userId) ?? {};

        return {
          id: userId,
          username: profile.username ?? 'Usuário',
          avatar_url: profile.avatar_url ?? '',
          finished_at: resultEntry?.finished_at ?? null,
          position: resultEntry?.position ?? undefined,
          score: resultEntry?.score ?? undefined,
          finished: !!resultEntry,
        };
      });

      // calcula o menor finished_at válido a partir da lista montada (mais consistente)
      const finishedTimes = resultsList
        .map((r) => r.finished_at)
        .filter((t) => t !== null && t !== undefined) as string[];
      let earliest: string | null = null;
      if (finishedTimes.length > 0) {
        earliest = finishedTimes.reduce((min, cur) => {
          return new Date(cur).getTime() < new Date(min).getTime() ? cur : min;
        }, finishedTimes[0]);
        setFirstFinishTime(earliest);
        console.log('⏱️ Primeiro a terminar (calculado de resultsList):', earliest);
      } else {
        setFirstFinishTime(null);
      }

      // ordenar: primeiro os que terminaram; entre os que terminaram, por position se existir, senão por finished_at
      resultsList.sort((a, b) => {
        if (a.finished && !b.finished) return -1;
        if (!a.finished && b.finished) return 1;
        if (a.finished && b.finished) {
          if (typeof a.position === 'number' && typeof b.position === 'number') {
            return a.position - b.position;
          }
          if (a.finished_at && b.finished_at) {
            return new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime();
          }
          return 0;
        }
        return 0;
      });

      // atribui posições sequenciais locais para os que terminaram (caso a tabela não tenha position)
      let posCounter = 1;
      for (let r of resultsList) {
        if (r.finished) {
          if (typeof r.position !== 'number') {
            r.position = posCounter;
          }
          posCounter++;
        }
      }

      const allPlayersFinished = resultsList.length > 0 && resultsList.every((r) => r.finished);

      setResults(resultsList);
      setAllFinished(allPlayersFinished);
      console.log('✅ Resultados carregados:', resultsList);
      console.log('🏁 Todos terminaram?', allPlayersFinished);
    } catch (err) {
      console.error('Erro em fetchResults:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let channel: any = null;
    let subscribed = false;

    const start = async () => {
      await fetchResults();

      if (!matchId) return;

      // subscribe uma vez
      channel = supabase
        .channel(`quiz_results:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quiz_results',
            filter: `match_id=eq.${matchId}`,
          },
          (payload: any) => {
            console.log('🔔 Realtime quiz_results payload:', payload);
            fetchResults();
          }
        )
        .subscribe();

      subscribed = true;

      // iniciar polling somente enquanto algum jogador não terminou
      if (!allFinished) {
        intervalId = setInterval(() => {
          fetchResults();
        }, 3000);
      }
    };

    start();

    return () => {
      if (intervalId) clearInterval(intervalId);
      try {
        if (subscribed && channel) channel.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
  }, [matchId, allFinished]);

  const getPodiumEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}º`;
  };

  const formatDuration = (finishedAt?: string | null) => {
    // se não tiver finishedAt, mostra placeholder
    if (!finishedAt) return '--:--';

    // se não há firstFinishTime, assume que este é o primeiro (único até agora) -> 0:00
    if (!firstFinishTime) {
      return '0:00';
    }

    try {
      const first = new Date(firstFinishTime).getTime();
      const current = new Date(finishedAt).getTime();
      const diffMs = current - first;
      if (isNaN(diffMs) || diffMs < 0) return '--:--';

      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (diffMs === 0) {
        return '0:00';
      }

      return `+${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('❌ Erro ao calcular duração:', error);
      return '--:--';
    }
  };

  // nova função: formata o horário absoluto de finished_at para exibir (HH:MM:SS)
  const formatFinishedTime = (finishedAt?: string | null) => {
    if (!finishedAt) return '--:--';
    try {
      const d = new Date(finishedAt);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#242948', '#5C6494']} style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#242948', '#5C6494']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {allFinished ? '🏆 Resultados Finais' : '⏳ Aguardando Jogadores'}
        </Text>
        <Text style={styles.subtitle}>{quizTitle}</Text>
      </View>

      <View style={styles.content}>
        {!allFinished && (
          <View style={styles.waitingBanner}>
            <Ionicons name="hourglass-outline" size={30} color="#333" />
            <Text style={styles.waitingText}>
              Aguardando outros jogadores terminarem...
            </Text>
          </View>
        )}

        {allFinished && results.length >= 3 && (
          <View style={styles.podiumContainer}>
            <View style={[styles.podiumPlace, styles.secondPlace]}>
              <AvatarView size={60} url={results[1]?.avatar_url} />
              <Text style={styles.podiumEmoji}>🥈</Text>
              <Text style={styles.podiumName}>{results[1]?.username}</Text>
              <Text style={styles.podiumTime}>{formatDuration(results[1]?.finished_at)} • {formatFinishedTime(results[1]?.finished_at)}</Text>
            </View>

            <View style={[styles.podiumPlace, styles.firstPlace]}>
              <AvatarView size={80} url={results[0]?.avatar_url} />
              <Text style={styles.podiumEmoji}>🥇</Text>
              <Text style={styles.podiumName}>{results[0]?.username}</Text>
              <Text style={styles.podiumTime}>{formatDuration(results[0]?.finished_at)} • {formatFinishedTime(results[0]?.finished_at)}</Text>
            </View>

            <View style={[styles.podiumPlace, styles.thirdPlace]}>
              <AvatarView size={60} url={results[2]?.avatar_url} />
              <Text style={styles.podiumEmoji}>🥉</Text>
              <Text style={styles.podiumName}>{results[2]?.username}</Text>
              <Text style={styles.podiumTime}>{formatDuration(results[2]?.finished_at)} • {formatFinishedTime(results[2]?.finished_at)}</Text>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>📊 Classificação Completa</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={[
                styles.resultItem,
                item.id === session?.user?.id && styles.resultItemHighlight,
              ]}>
                <Text style={styles.positionText}>
                  {item.finished ? getPodiumEmoji(item.position ?? (index + 1)) : '⏳'}
                </Text>
                <AvatarView size={40} url={item.avatar_url} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>
                    {item.username}
                    {item.id === session?.user?.id && ' (Você)'}
                  </Text>
                  <Text style={styles.resultTime}>
                    {item.finished ? `${formatDuration(item.finished_at)} • ${formatFinishedTime(item.finished_at)}` : 'Jogando...'}
                  </Text>
                </View>
                {item.finished && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </View>
            )}
          />
        </View>

        {allFinished && (
          <TouchableOpacity style={styles.finishButton} onPress={() => navigation.navigate('QuizScreen' as any)}>
            <Text style={styles.finishButtonText}>Voltar ao Menu</Text>
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
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#D3D3D3',
    marginTop: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE082',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
    height: 220,
  },
  podiumPlace: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
  },
  firstPlace: {
    backgroundColor: '#FFD700',
    height: 200,
    width: 110,
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
    height: 170,
    width: 100,
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
    height: 150,
    width: 100,
  },
  podiumEmoji: {
    fontSize: 30,
    marginTop: 5,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },
  podiumTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(112, 125, 203, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  resultItemHighlight: {
    borderColor: '#707DCB',
    backgroundColor: 'rgba(112, 125, 203, 0.2)',
  },
  positionText: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  finishButton: {
    backgroundColor: '#707DCB',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizResultsScreen;