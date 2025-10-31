import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

// --- ALTERAÇÃO 1: O tipo agora corresponde à tabela do banco de dados ---
type Flashcard = {
  id: string;
  user_id: string;
  topic_id: string;
  question: string;
  answer: string;
  created_at: string;
  next_review_at: string;
  interval_days: number; // Usaremos 'interval_days' para consistência com o banco
};

const ReviewFlashcardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [card, setCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // --- ALTERAÇÃO 2: Estado de carregamento para feedback visual ---
  const [isLoading, setIsLoading] = useState(true);

  // --- ALTERAÇÃO 3: Função central para buscar o próximo card do Supabase ---
  const fetchNextCard = async () => {
    setIsLoading(true);
    setIsFlipped(false); // Garante que o novo card comece sem virar

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return; // Sai se não houver usuário
    }
    
    // Busca o próximo card pendente para este usuário
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id)
      .lte('next_review_at', new Date().toISOString()) // Onde a data de revisão é hoje ou no passado
      .order('next_review_at', { ascending: true }) // Pega o mais antigo primeiro
      .limit(1)
      .single(); // Esperamos apenas um resultado

    if (error && error.code !== 'PGRST116') { // Ignora erro "nenhuma linha encontrada"
      console.error('Erro ao buscar card:', error);
    }
    
    setCard(data); // `data` será o card ou `null` se não houver nenhum pendente
    setIsLoading(false);
  };

  // Efeito inicial para carregar o primeiro card
  useEffect(() => {
    fetchNextCard();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFlipCard = () => {
    setIsFlipped(true);
  };

  // --- ALTERAÇÃO 4: A função de avaliação agora atualiza o Supabase ---
  const handleRateDifficulty = async (difficulty: 'again' | 'hard' | 'medium' | 'easy') => {
    if (!card) return;

    let newIntervalDays = card.interval_days ?? 0;

    // Lógica de SRS aprimorada
    if (difficulty === 'again') {
      newIntervalDays = 0; // Reseta o intervalo, para revisar em breve (ex: no mesmo dia)
    } else if (difficulty === 'hard') {
      newIntervalDays = Math.max(1, Math.floor(newIntervalDays * 1.2)); // Aumenta pouco
    } else if (difficulty === 'medium') {
      newIntervalDays = Math.ceil(newIntervalDays * 2.5) + 1; // Aumenta significativamente
    } else if (difficulty === 'easy') {
      newIntervalDays = Math.ceil(newIntervalDays * 4) + 2; // Aumenta muito
    }

    const MAX_INTERVAL_DAYS = 120; // Aproximadamente 4 meses

    if (newIntervalDays >= MAX_INTERVAL_DAYS) {
      // Card Dominado: Deleta do banco
      const { error: deleteError } = await supabase.from('flashcards').delete().eq('id', card.id);
      if (deleteError) console.error('Erro ao deletar card:', deleteError);
      else console.log(`Card ${card.id} dominado e removido!`);

    } else {
      // Card a ser revisado novamente: Atualiza o banco
      const now = new Date();
      const nextReviewDate = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabase
        .from('flashcards')
        .update({ 
          next_review_at: nextReviewDate.toISOString(),
          interval_days: newIntervalDays,
        })
        .eq('id', card.id);

      if (updateError) console.error('Erro ao atualizar card:', updateError);
      else console.log(`Card ${card.id} atualizado. Próxima revisão em ${newIntervalDays} dias.`);
    }

    // Busca o próximo card
    fetchNextCard();
  };

  // --- ALTERAÇÃO 5: Tela de carregamento enquanto busca o primeiro card ---
  if (isLoading) {
    return (
      <LinearGradient colors={['#242948', '#5C6494']} style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.infoText}>Buscando cards para revisar...</Text>
      </LinearGradient>
    );
  }

  // Tela exibida quando não há mais cards pendentes
  if (!card) {
    return (
      <LinearGradient colors={['#242948', '#5C6494']} locations={[0.65, 0.30]} start={{ x: 1, y: 1 }} end={{ x: 0.85, y: 0.4 }} style={styles.centeredContainer}>
        <Text style={styles.infoText}>Sessão de revisão concluída!</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonAlone}>
            <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // O JSX principal permanece o mesmo, apenas consumindo os dados reais
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#242948', '#5C6494']} locations={[0.65, 0.30]} start={{ x: 1, y: 1 }} end={{ x: 0.85, y: 0.4 }} style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PERGUNTA</Text>
            <Text style={styles.cardContent}>{card.question}</Text>
            {isFlipped && (
              <>
                <View style={styles.divider} />
                <Text style={styles.cardLabel}>RESPOSTA</Text>
                <Text style={styles.cardContent}>{card.answer}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          {!isFlipped ? (
            <TouchableOpacity style={styles.showAnswerButton} onPress={handleFlipCard}>
              <Text style={styles.showAnswerButtonText}>Mostrar Resposta</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.difficultyButtonsContainer}>
              <TouchableOpacity style={[styles.difficultyButton, {backgroundColor: '#FF3B30'}]} onPress={() => handleRateDifficulty('again')}>
                <Text style={styles.difficultyButtonText}>Novamente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.difficultyButton, {backgroundColor: '#FF9500'}]} onPress={() => handleRateDifficulty('hard')}>
                <Text style={styles.difficultyButtonText}>Difícil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.difficultyButton, {backgroundColor: '#FFCC00'}]} onPress={() => handleRateDifficulty('medium')}>
                <Text style={styles.difficultyButtonText}>Médio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.difficultyButton, {backgroundColor: '#34C759'}]} onPress={() => handleRateDifficulty('easy')}>
                <Text style={styles.difficultyButtonText}>Fácil</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonAlone: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    marginLeft: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(44, 44, 46, 0.9)',
    borderRadius: 15,
    padding: 25,
    minHeight: Dimensions.get('window').height * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardContent: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 30,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 25,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  showAnswerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
  },
  showAnswerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  difficultyButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  difficultyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewFlashcardScreen;