import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
  title: string;
  questions: QuizQuestion[];
}

// --- COMPONENTE PRINCIPAL ---
const QuizCreatorScreen = () => {
  const navigation = useNavigation();

  // --- ESTADO DO COMPONENTE ---
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 1,
      questionText: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
      ],
      correctOptionId: '', // Inicia sem nenhuma opção correta selecionada
    },
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState(1);

  // --- FUNÇÕES DE LÓGICA (HANDLERS) ---
  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: questions.length + 1,
      questionText: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' },
      ],
      correctOptionId: '',
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  }, [questions]);

  const handleSaveQuiz = () => {
    const finalQuiz: Quiz = {
      title: quizTitle,
      questions: questions,
    };
    console.log('--- QUIZ SALVO ---');
    console.log(JSON.stringify(finalQuiz, null, 2));
    navigation.goBack();
  };

  const handleUpdateQuestion = (questionId: number, field: 'questionText' | `option_${string}`, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          if (field === 'questionText') {
            return { ...q, questionText: value };
          }
          if (field.startsWith('option_')) {
            const optionId = field.split('_')[1];
            return {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId ? { ...opt, text: value } : opt
              ),
            };
          }
        }
        return q;
      })
    );
  };

  // Função para selecionar a alternativa correta
  const handleSelectCorrectOption = (questionId: number, correctId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, correctOptionId: correctId } : q
      )
    );
  };
  
  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  // --- RENDERIZAÇÃO (VISUAL) ---
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={styles.gradient}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Novo Quiz</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={50} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.workspace}>
          <View style={styles.sidebar}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuiz}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <FlatList
              data={questions}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.questionNavItem,
                    item.id === activeQuestionId && styles.questionNavItemActive, // Estilo da borda preta
                  ]}
                  onPress={() => setActiveQuestionId(item.id)}
                >
                  <Text style={styles.questionNavText}>{item.id}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
              <Text style={styles.addQuestionButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.editorArea}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editorBackground} />

            <View style={styles.editorContent}>
              {activeQuestion && (
                <>
                  <TextInput
                    style={styles.inputTitle}
                    placeholder="Nome do Quiz"
                    placeholderTextColor="#787878"
                    value={quizTitle}
                    onChangeText={setQuizTitle}
                  />
                  <TextInput
                    style={[styles.input, styles.inputQuestion]}
                    placeholder="Comece a digitar a pergunta..."
                    placeholderTextColor="#787878"
                    multiline
                    value={activeQuestion.questionText}
                    onChangeText={text => handleUpdateQuestion(activeQuestion.id, 'questionText', text)}
                  />
                  {activeQuestion.options.map((option) => {
                    const isCorrect = activeQuestion.correctOptionId === option.id;
                    return (
                      <View key={option.id} style={styles.optionContainer}>
                        {/* Botão de seleção da alternativa correta */}
                        <TouchableOpacity
                          style={[
                            styles.optionSelector,
                            isCorrect && styles.optionSelectorCorrect, // Estilo de preenchimento verde
                          ]}
                          onPress={() => handleSelectCorrectOption(activeQuestion.id, option.id)}
                        >
                          <Text style={[
                            styles.optionSelectorText,
                            isCorrect && styles.optionSelectorTextCorrect
                          ]}>
                            {option.id}
                          </Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.inputOption}
                          placeholder={`Alternativa ${option.id}`}
                          placeholderTextColor="#787878"
                          value={option.text}
                          onChangeText={text => handleUpdateQuestion(activeQuestion.id, `option_${option.id}`, text)}
                        />
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  backButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#707DCB',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  sidebar: {
    width: 80,
    marginRight: 20,
    alignItems: 'center',
  },
  saveButton: {
    width: 70,
    height: 70,
    paddingVertical: 10,
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 17,
  },
  questionNavItem: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#D9D9D9', // Sempre cinza
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'transparent', // Borda transparente por padrão
  },
  questionNavItemActive: {
    borderColor: 'black', // Borda preta quando ativo
  },
  questionNavText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  addQuestionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addQuestionButtonText: {
    fontSize: 40,
    color: 'black',
    fontWeight: 'bold',
    lineHeight: 40,
    textAlign: 'center',
  },
  editorArea: {
    flex: 1,
  },
  editorBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
  },
  editorContent: {
    padding: 20,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    marginBottom: 20,
    padding: 10,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'black',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  inputQuestion: {
    minHeight: 300,
    textAlignVertical: 'top',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionSelector: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4CAF50', // Borda verde
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent', // Sem preenchimento por padrão
  },
  optionSelectorCorrect: {
    backgroundColor: '#4CAF50',
  },
  optionSelectorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000ff', // Texto preto
  },
  optionSelectorTextCorrect: {
    color: 'white', // Texto branco quando correto
  },
  inputOption: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});

export default QuizCreatorScreen;