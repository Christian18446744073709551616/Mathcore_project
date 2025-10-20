import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

// --- ESTRUTURA DE DADOS ---
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.type === 'quizDeleted' && route.params?.quizId) {
        const quizIdToDelete = route.params.quizId as string;
        setQuizzes(prevQuizzes => {
          const newQuizzesList = prevQuizzes.filter(q => q.id !== quizIdToDelete);
          return [...newQuizzesList]; // Retorna uma nova referência de array
        });
        navigation.setParams({ type: undefined, quizId: undefined });
      } 
      else if (route.params?.type === 'quizSaved' && route.params?.quiz) {
        const savedQuiz = route.params.quiz as Quiz;
        setQuizzes(prevQuizzes => {
          const existingQuizIndex = prevQuizzes.findIndex(q => q.id === savedQuiz.id);
          if (existingQuizIndex > -1) {
            // Edição: Cria um novo array com o quiz atualizado
            const updatedQuizzes = [...prevQuizzes];
            updatedQuizzes[existingQuizIndex] = savedQuiz;
            return updatedQuizzes;
          } else {
            // Criação: Retorna um novo array com o novo quiz adicionado
            return [...prevQuizzes, savedQuiz];
          }
        });
        navigation.setParams({ type: undefined, quiz: undefined });
      }
    }, [route.params])
  );

  const handleNewQuiz = () => {
    navigation.navigate('NovoQuizScreen', { quizToEdit: null });
  };

  const handleEditQuiz = (quiz: Quiz) => {
    navigation.navigate('NovoQuizScreen', { quizToEdit: quiz });
  };

  // JSX (parte visual)
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1, padding: 20 }}
      >
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Quiz</Text>
          </View>
          <View style={styles.bottomContainer}>
            <View style={styles.expandingRectangle}>
              <FlatList
                data={[{ id: 'new_quiz_button' }, ...quizzes]}
                numColumns={2}
                keyExtractor={(item) => item.id}
                extraData={quizzes}
                renderItem={({ item }) => {
                  if (item.id === 'new_quiz_button') {
                    return (
                      <TouchableOpacity 
                        style={styles.newQuizButton}
                        onPress={handleNewQuiz}
                      >
                        <View style={styles.buttonContent}>
                          <Text style={styles.novoText}>Novo</Text>
                          <Text style={styles.quizText}>Quiz</Text>
                          <Text style={styles.plusSymbol}>+</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      style={styles.savedQuizButton}
                      onPress={() => handleEditQuiz(item as Quiz)}
                    >
                      <Text style={styles.savedQuizTitle}>{(item as Quiz).title}</Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.quizListContainer}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  expandingRectangle: {
    backgroundColor: '#707DCB',
    borderRadius: 12,
    padding: 20,
    minHeight: 700,
    flexGrow: 1,
  },
  quizListContainer: {
    alignItems: 'flex-start',
  },
  newQuizButton: {
    backgroundColor: '#FFF9E0',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    width: 150,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  novoText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quizText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  plusSymbol: {
    color: '#000000',
    fontSize: 48,
    fontWeight: 'bold',
  },
  savedQuizButton: {
    backgroundColor: '#FFF9E0',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    width: 150,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 10,
  },
  savedQuizTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default QuizScreen;