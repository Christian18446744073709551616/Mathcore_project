import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// --- ESTRUTURAS DE DADOS ---
interface QuizOption { id: string; text: string; }
interface QuizQuestion { id: number; questionText: string; options: QuizOption[]; correctOptionId: string; }
interface Quiz { id: string; title: string; questions: QuizQuestion[]; }

const GameQuizScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { quizData } = route.params as { quizData: Quiz };

  // --- ESTADOS PARA CONTROLAR O JOGO ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const currentQuestion = quizData?.questions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= quizData.questions.length - 1) {
      setIsQuizFinished(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setFeedbackMessage(null);
    }
  };

  const handleOptionPress = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;

    if (isCorrect) {
      setFeedbackMessage('Parabéns, você acertou!');
    } else {
      setFeedbackMessage(`A alternativa correta era a ${currentQuestion.correctOptionId}.`);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };
  if (isQuizFinished) {
    return (
      <LinearGradient colors={['#4CAF50', '#81C784']} style={styles.container}>
        <View style={styles.finishedContainer}>
          <Ionicons name="checkmark-circle" size={100} color="white" />
          <Text style={styles.finishedTitle}>Quiz Finalizado!</Text>
          <Text style={styles.finishedSubtitle}>Você completou o quiz "{quizData.title}".</Text>
          <TouchableOpacity style={styles.finishButton} onPress={() => navigation.goBack()}>
            <Text style={styles.finishButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!currentQuestion) {
    return (
      <LinearGradient colors={['#242948', '#5C6494']} style={styles.container}>
        <Text style={styles.quizTitle}>Carregando Quiz...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#242948', '#5C6494']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.quizTitle}>{quizData.title}</Text>
        <Text style={styles.progressText}>
          Pergunta {currentQuestionIndex + 1} de {quizData.questions.length}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close-circle" size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.gameArea}>
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = currentQuestion.correctOptionId === option.id;
            
            const getOptionStyle = () => {
              if (!isAnswered) return styles.optionButton;
              if (isCorrect) return [styles.optionButton, styles.correctOption];
              if (isSelected && !isCorrect) return [styles.optionButton, styles.incorrectOption];
              return styles.optionButton;
            };

            return (
              <TouchableOpacity
                key={option.id}
                style={getOptionStyle()}
                onPress={() => handleOptionPress(option.id)}
                disabled={isAnswered}
              >
                <Text style={styles.optionText}>{option.id}. {option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {feedbackMessage && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60 
  },
  header: { 
    marginBottom: 20, 
    alignItems: 'center',
    position: 'relative', 
    width: '100%',
  },
  quizTitle: { 
    fontSize: 28, 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center', 
  },
  progressText: { 
    fontSize: 16, 
    color: '#D3D3D3', 
    marginTop: 5, },
  closeButton: { 
    position: 'absolute', 
    top: 0, 
    right: 0, 
  },
  gameArea: { 
    flex: 1, 
    backgroundColor: '#FFF9E0', 
    borderRadius: 20, 
    padding: 20, 
  },
  questionText: { 
    fontSize: 22, 
    fontWeight: '600', 
    color: 'black', 
    marginBottom: 30, 
    textAlign: 'center', 
  },
  optionsContainer: { 
    flex: 1, 
    justifyContent: 'center', 
  },
  optionButton: { 
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15, 
    borderWidth: 3, 
    borderColor: 'transparent', 
  },
  optionText: { 
    fontSize: 18, 
    color: 'black', 
    fontWeight: '500', 
  },
  correctOption: { 
    borderColor: '#4CAF50', 
    backgroundColor: '#E8F5E9', 
  },
  incorrectOption: { 
    borderColor: '#f44336', 
    backgroundColor: '#FFEBEE', 
  },
  feedbackContainer: { 
    padding: 15, 
    borderRadius: 10, 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
  },
  feedbackText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center', 
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishedTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  finishedSubtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  finishButton: {
    marginTop: 40,
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  finishButtonText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default GameQuizScreen;