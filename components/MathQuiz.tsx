import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

// Importar os arquivos JSON de acordo com o título da lição
import quadradosQuestions from '../Math/quadrados_questions.json';

interface MathQuizProps {
  lessonTitle: string;
  session: any; // ou o tipo correto para 'session'
  updateGameData: (isCorrect: boolean, answer: number, correctAnswer: number) => void;
  onQuizFinished: (finalScore: number) => void; // Callback para notificar quando o quiz termina
  setQuestionsToParent?: (questions: Question[]) => void; // Nova prop opcional
  userAnswer: string; // Adiciona userAnswer
  setUserAnswer: React.Dispatch<React.SetStateAction<string>>; // Adiciona setUserAnswer
  sendIncorrectAnswers: (question: any, wrongAnswer: number, correctAnswer: number) => void;
}
interface IncorrectAnswer {
  question: string;
  userAnswer: number;
  correctAnswer: number;
}
interface Question {
  question: string;
  answer: number;
  formulas: string[];
  formulaText: string;
}

const MathQuiz: React.FC<MathQuizProps> = ({
  lessonTitle,
  session,
  updateGameData,
  onQuizFinished,
  sendIncorrectAnswers,  // Adicione esta linha
}) => {
  const [questions, setQuestions] = useState<Question[]>([]); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);


  const [selectedFormula, setSelectedFormula] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [showFormulas, setShowFormulas] = useState<boolean>(true);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const setQuestionsToParent = (questions: Question[]) => {
    setQuestions(questions); // Atualiza o estado do pai
  };
  useEffect(() => {
  const loadQuestions = (data: any) => {
    const mappedQuestions = data.map((item: any) => ({
      question: item.question,
      answer: parseFloat(item.options.find((opt: any) => opt.correct)?.correct_answer || '0'),
      formulas: item.options.map((opt: any) => opt.formula),
      formulaText: item.options.find((opt: any) => opt.correct)?.formula_steps || '',
    }));

    setQuestions(mappedQuestions);
    if (setQuestionsToParent) setQuestionsToParent(mappedQuestions);
  };

  switch (lessonTitle) {
    case 'Quadrados':
      loadQuestions(quadradosQuestions);
      break;
    default:
      setQuestions([]);
  }
}, [lessonTitle, ]); // Certifique-se de adicionar a dependência corretamente

  
useEffect(() => {
  if (!isFinished) return;

  const sendAnswersOnce = () => {
    
    onQuizFinished(score); // Notifica o GameScreen quando o quiz termina
  };

  sendAnswersOnce();
}, [isFinished]); // Reduza dependências para evitar re-execuções desnecessárias

  

  const handleFormulaSelection = (formula: string) => {
    setSelectedFormula(formula);
    setShowFormulas(false);
    setShowInput(true);
  };

  const handleAnswerSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = parseFloat(userAnswer) === currentQuestion.answer;
  
    if (!isCorrect) {
      setIncorrectAnswers((prev) => {
        const alreadyExists = prev.some(
          (answer) => answer.question === currentQuestion.question && 
                      answer.userAnswer === parseFloat(userAnswer) &&
                      answer.correctAnswer === currentQuestion.answer
        );
      
        if (alreadyExists) {
          return prev; // Retorna o array atual, sem duplicar
        }
      
        return [
          ...prev,
          {
            question: currentQuestion.question,
            userAnswer: parseFloat(userAnswer),
            correctAnswer: currentQuestion.answer,
          },
        ];
      });
      
    }
  
    if (isCorrect) {
      setScore((prevScore) => prevScore + 100);
    }
  
    updateGameData(isCorrect, parseFloat(userAnswer), currentQuestion.answer);
    nextQuestion();
  };
  
  
  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      resetStates();
    } else {
      if (!isFinished) setIsFinished(true); // Evita atualizar repetidamente
    }
  };
  

  const resetStates = () => {
    setUserAnswer('');
    setSelectedFormula('');
    setShowFormulas(true);
    setShowInput(false);
  };

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando perguntas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFinished ? (
       <Text style={styles.waitingText}>Esperando os outros jogadores terminarem...</Text>
      ) : (
        <>
          <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>

          {showFormulas && (
            <View style={styles.formulasContainer}>
              {questions[currentQuestionIndex].formulas.map((formula, index) => (
                <Button
                  key={index}
                  title={`Escolher fórmula: ${formula}`}
                  onPress={() => handleFormulaSelection(formula)}
                />
              ))}
            </View>
          )}

          {showInput && (
            <>
              <Text style={styles.formulaText}>{questions[currentQuestionIndex].formulaText}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Digite sua resposta"
              />
              <Button title="Enviar Resposta" onPress={handleAnswerSubmit} />
            </>
          )}

          
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontSize: 24,
    marginBottom: 16,
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    width: '80%',
    textAlign: 'center',
    color: 'white',
  },
  formulasContainer: {
    marginBottom: 16,
  },
  formulaText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  score: {
    fontSize: 18,
    marginTop: 16,
    color: 'white',
  },
  finishedText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
  }, 
   waitingText: {
    fontSize: 16,
    color: 'white',
    marginVertical: 20,
  },
});

export default MathQuiz;

