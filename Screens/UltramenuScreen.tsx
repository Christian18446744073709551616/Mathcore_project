import React, { useEffect, useState } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../types';


// Define tipos para a navegação
type UltramenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ultramenu'>;
type UltramenuScreenRouteProp = RouteProp<RootStackParamList, 'Ultramenu'>;

const UltramenuScreen = ({ route }: { route: UltramenuScreenRouteProp }) => {
  const navigation = useNavigation<UltramenuScreenNavigationProp>();
  const { lessonTitle } = route.params; // Recebe o título da lição
  const [session, setSession] = useState<any | null>(null);
  
  useEffect(() => {
    // Obtém a sessão do usuário ao carregar o componente
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao obter sessão:', error);
      } else {
        setSession(session);
      }
    };

    fetchSession();
  }, []);

  const handleConceptMode = async () => {
  if (!session?.user) {
    console.error('Usuário não está autenticado');
    return;
  }

  try {
    // Verifica se o usuário já possui progresso registrado para a lição
    const { data: existingProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('current_index')
      .eq('user_id', session.user.id)
      .eq('lesson_title', lessonTitle)
      .limit(1); // Limita a consulta a um único resultado

    if (progressError) {
      console.error('Erro ao verificar progresso do usuário:', progressError.message);
      return;
    }

    if (!existingProgress || existingProgress.length === 0) {
      // Nenhum progresso existente; cria um novo registro de progresso
      const { error: insertProgressError } = await supabase
        .from('user_progress')
        .insert([{
          user_id: session.user.id,
          lesson_title: lessonTitle,
          current_index: 0, // Define o progresso inicial como 0
          max_index: 0,
          completed: false,
          progress_percentage: 0,
        }]);

      if (insertProgressError) {
        console.error('Erro ao registrar o progresso do usuário:', insertProgressError.message);
        return;
      }

      console.log('Novo progresso criado para a lição:', lessonTitle);

      // Redireciona para a lição com progresso inicial
      navigation.navigate('Lesson', { lessonTitle, session, currentIndex: 0 });
      return;
    }

    // Navega para a tela da lição, passando o progresso atual
    navigation.navigate('Lesson', { lessonTitle, session, currentIndex: existingProgress[0].current_index });
  } catch (error) {
    console.error('Erro inesperado:');
  }
};

  const handlePracticeMode = async () => {
    if (!session?.user) {
      console.error('Usuário não está autenticado');
      return;
    }

    // Cria o lobby no Supabase
    const { data: lobbyData, error: lobbyError } = await supabase
      .from('lobbies')
      .insert([{ lobby_name: lessonTitle, host_id: session.user.id }])
      .select()
      .single();

    if (lobbyError) {
      console.error('Erro ao criar lobby:', lobbyError);
      return;
    }

    // Adiciona o host à tabela lobby_players
    const { error: playerError } = await supabase
      .from('lobby_players')
      .insert([{ lobby_id: lobbyData.id, player_id: session.user.id, is_host: true, is_ready: false }]);

    if (playerError) {
      console.error('Erro ao adicionar host aos jogadores:', playerError);
    } else {
      // Navega para a tela Lobby com o ID do lobby criado
      navigation.navigate('Lobby', { lobbyId: lobbyData.id, lessonTitle, session });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o Modo - {lessonTitle}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handlePracticeMode}>
        <Text style={styles.buttonText}>Modo Prática</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleConceptMode}>
        <Text style={styles.buttonText}>Modo Conceito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05001f', // Violeta azulado escuro
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B2F2F2', // Verde água neon suave
    marginBottom: 20,
    alignItems: 'center',
    textShadowColor: '#00FFFF', // Sombra neon clara para dar um efeito suave
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: '#000000', // Botões pretos
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Contorno branco
  },
  buttonText: {
    color: '#FFFFFF', // Texto branco
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Adicionando o efeito de hover (apenas para web, mas pode ser simulado em dispositivos móveis com eventos de toque)
  buttonHover: {
    backgroundColor: '#333333', // Cor de fundo escura ao passar o mouse
    transform: [{ scale: 1.05 }], // Efeito de leve aumento no botão
  },
});

export default UltramenuScreen;
