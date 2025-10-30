import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

// --- ATUALIZAÇÃO 1: Importando a fonte de dados dos tópicos ---
import { allTopics } from '../../data/topicsData'; // Garanta que o caminho esteja correto
import { Content } from './home.2';

const { width } = Dimensions.get('window');

type Deck = Content & {
  pendingCards: number;
};

const DeckItem = ({ item, onPress }: { item: Deck, onPress: () => void }) => (
  <TouchableOpacity style={styles.deckItemContainer} onPress={onPress}>
    <View style={styles.deckInfo}>
      <Text style={styles.deckTitle}>{item.name}</Text>
    </View>
    <View style={styles.pendingContainer}>
      <Text style={styles.pendingText}>{item.pendingCards}</Text>
    </View>
  </TouchableOpacity>
);

const FlashcardsScreen = () => {
  const navigation = useNavigation();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ATUALIZAÇÃO 2: A lógica de busca agora faz uma consulta real ao Supabase ---
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchDecksAndPending = async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            if (isActive) setDecks([]);
            return;
          }

          const contentsData: Content[] = [
            { id: '1', name: 'Geometria', color: '#731dca', icon_name: 'shapes', navigation_target: 'GeometryLessons' },
            { id: '2', name: 'Matemática Financeira', color: '#4b843d', icon_name: 'bar-graph', navigation_target: 'MathFincLessons' },
            { id: '3', name: 'Matemática Básica', color: '#5c1dcb', icon_name: 'division', navigation_target: 'MathBasicLessons' },
            { id: '4', name: 'Álgebra', color: '#2c3c92', icon_name: 'square-root-alt', navigation_target: 'AlgebraLessons' },
          ];

          if (contentsData) {
            const decksWithPending = await Promise.all(contentsData.map(async (content) => {
              const topicList = (allTopics as Record<string, { id: string; name: string }[]>)[content.id] ?? [];
              const topicIds = topicList.map(t => t.id);

              if (topicIds.length === 0) return { ...content, pendingCards: 0 };

              const { count, error } = await supabase
                .from('flashcards')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .lte('next_review_at', new Date().toISOString())
                .in('topic_id', topicIds);

              if (error) {
                console.error(`Erro ao contar cards para ${content.name}:`, error);
                return { ...content, pendingCards: 0 };
              }

              return { ...content, pendingCards: count ?? 0 };
            }));

            if (isActive) setDecks(decksWithPending);
          } else {
            if (isActive) setDecks([]);
          }
        } catch (err) {
          console.error('Erro ao buscar decks e pendências:', err);
          if (isActive) setDecks([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchDecksAndPending();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleNavigateToReview = (deckId: string) => {
    navigation.navigate('ReviewFlashcardScreen', { deckId: deckId });
  };

  const handleNavigateToAICreation = () => {
    navigation.navigate('CreateFlashcardScreen', { withAI: true, decks: decks });
  };

  const handleNavigateToManualCreation = () => {
    navigation.navigate('CreateFlashcardScreen', { withAI: false, decks: decks });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#242948', '#5C6494']} style={[styles.gradientBackground, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  // O resto do seu JSX permanece o mesmo
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.Subtitle}>Conteúdos</Text>
            <Text style={styles.Subtitle}>Pendentes</Text>
          </View>
        </View>

        <FlatList
          data={decks}
          renderItem={({ item }) => (
            <DeckItem
              item={item}
              onPress={() => handleNavigateToReview(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.aiButton} onPress={handleNavigateToAICreation}>
            <Feather name="cpu" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Criar com IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualButton} onPress={handleNavigateToManualCreation}>
            <Feather name="plus-circle" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Criar Manualmente</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

// Estilos permanecem os mesmos...
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  Subtitle: {
    fontSize: 30,
    color: '#CDCDCD',
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  deckItemContainer: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)', 
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#CDCDCD',
  },
  pendingContainer: {
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginLeft: 15,
  },
  pendingText: {
    color: '#CDCDCD',
    fontWeight: 'bold',
    fontSize: 22,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5856D6',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    flex: 1,
    justifyContent: 'center',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FlashcardsScreen;