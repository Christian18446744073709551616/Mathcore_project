import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// --- DEFINIÇÃO DOS TEMAS ---
const themes = {
  padrao: {
    name: 'Padrão',
    gradient: ['#242948', '#5C6494'],
    title: '#ffffffff',
    container: '#4d547cff',
    button: '#e0dbc7ff',
    buttonBorder: '#000000',
    buttonText: '#000000',
  },
  roxo: {
    name: 'Roxo',
    gradient: ['#1d2033', '#30345a'],
    title: '#FFFFFF',
    container: '#8B5CF6',
    button: '#30345a',
    buttonBorder: '#8B5CF6',
    buttonText: '#FFFFFF',
  },
  azulClaro: {
    name: 'Azul Claro',
    gradient: ['#5b6b85', '#93a5c5'],
    title: '#1e293b',
    container: '#c5d0e6',
    button: '#e8ecf5',
    buttonBorder: '#3B82F6',
    buttonText: '#1e293b',
  },
  altoContraste: {
    name: 'Alto Contraste',
    gradient: ['#000000', '#1a1a1a'],
    title: '#FFFFFF',
    container: '#2a2a2a',
    button: '#FFFF00',
    buttonBorder: '#FFFFFF',
    buttonText: '#000000',
  },
  deuteranopia: {
    name: 'Deuteranopia',
    gradient: ['#e8e6e0', '#faf9f7'],
    title: '#2c2c2c',
    container: '#0077b6',
    button: '#ffffff',
    buttonBorder: '#0077b6',
    buttonText: '#2c2c2c',
  },
  protanopia: {
    name: 'Protanopia',
    gradient: ['#d9dce0', '#f8f9fa'],
    title: '#212529',
    container: '#0466c8',
    button: '#ffffff',
    buttonBorder: '#0466c8',
    buttonText: '#212529',
  },
  tritanopia: {
    name: 'Tritanopia',
    gradient: ['#f0f0f0', '#fefefe'],
    title: '#1e1e1e',
    container: '#e63946',
    button: '#ffffff',
    buttonBorder: '#e63946',
    buttonText: '#1e1e1e',
  },
};

const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('padrao');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Carregar tema salvo
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('quiz_theme');
        if (savedTheme && themes[savedTheme as keyof typeof themes]) {
          setCurrentTheme(savedTheme);
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (themeKey: string) => {
    setCurrentTheme(themeKey);
    setShowThemeModal(false);
    try {
      await AsyncStorage.setItem('quiz_theme', themeKey);
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
    }
  };

  const theme = themes[currentTheme as keyof typeof themes];

  // ✅ FUNÇÃO PARA BUSCAR QUIZZES DO SUPABASE
  const fetchQuizzes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.log('Usuário não autenticado');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuizzes: Quiz[] = data.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        questions: quiz.questions as QuizQuestion[],
      }));

      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Erro ao buscar quizzes:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus quizzes.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ BUSCAR QUIZZES AO MONTAR O COMPONENTE
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // ✅ CORRIGIDO - RECARREGA SEMPRE QUE VOLTAR PARA A TELA
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 QuizScreen focado - recarregando quizzes');
      fetchQuizzes();
    }, [])
  );

  const handleNewQuiz = () => {
    navigation.navigate('NovoQuizScreen', { quizToEdit: null });
  };

  const handleEditQuiz = (quiz: Quiz) => {
    navigation.navigate('NovoQuizScreen', { quizToEdit: quiz });
  };

  // ✅ INDICADOR DE CARREGAMENTO
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={theme.gradient}
          locations={[0.65, 0.30]} 
          start={{ x: 1, y: 1 }}
          end={{ x: 0.85, y: 0.4 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: theme.title, fontSize: 18 }}>Carregando quizzes...</Text>
        </LinearGradient>
      </View>
    );
  }

  // JSX (parte visual)
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1, padding: 20 }}
      >
        {/* Botão de tema */}
        <TouchableOpacity 
          style={styles.themeButton}
          onPress={() => setShowThemeModal(true)}
        >
          <Ionicons name="color-palette" size={28} color={theme.title} />
        </TouchableOpacity>

        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.title }]}>Quiz</Text>
          </View>

          {/* 🆕 NOVO: Botão para escanear QR Code */}
          <TouchableOpacity 
            style={[
              styles.scanQRButton,
              { 
                backgroundColor: theme.button,
                borderColor: theme.buttonBorder,
              }
            ]}
            onPress={() => (navigation as any).navigate('QRScanner')}
          >
            <Ionicons name="qr-code-outline" size={32} color={theme.buttonText} />
            <Text style={[styles.scanQRButtonText, { color: theme.buttonText }]}>
              📷 Escanear QR Code
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomContainer}>
            <View style={[styles.expandingRectangle, { backgroundColor: theme.container }]}>
              <FlatList
                data={[{ id: 'new_quiz_button' }, ...quizzes]}
                numColumns={2}
                keyExtractor={(item) => item.id}
                extraData={quizzes}
                renderItem={({ item }) => {
                  if (item.id === 'new_quiz_button') {
                    return (
                      <TouchableOpacity 
                        style={[
                          styles.newQuizButton,
                          { 
                            backgroundColor: theme.button,
                            borderColor: theme.buttonBorder,
                          }
                        ]}
                        onPress={handleNewQuiz}
                      >
                        <View style={styles.buttonContent}>
                          <Text style={[styles.novoText, { color: theme.buttonText }]}>Novo</Text>
                          <Text style={[styles.quizText, { color: theme.buttonText }]}>Quiz</Text>
                          <Text style={[styles.plusSymbol, { color: theme.buttonText }]}>+</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      style={[
                        styles.savedQuizButton,
                        { 
                          backgroundColor: theme.button,
                          borderColor: theme.buttonBorder,
                        }
                      ]}
                      onPress={() => handleEditQuiz(item as Quiz)}
                    >
                      <Text style={[styles.savedQuizTitle, { color: theme.buttonText }]}>
                        {(item as Quiz).title}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.quizListContainer}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modal de seleção de tema */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.container }]}>
            <Text style={[styles.modalTitle, { color: theme.buttonText }]}>Escolha um Tema</Text>
            
            <ScrollView style={styles.themeList}>
              {Object.entries(themes).map(([key, themeOption]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: themeOption.button,
                      borderColor: currentTheme === key ? themeOption.buttonBorder : 'transparent',
                    }
                  ]}
                  onPress={() => changeTheme(key)}
                >
                  <Text style={[styles.themeName, { color: themeOption.buttonText }]}>
                    {themeOption.name}
                  </Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.gradient[0] }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.container }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.button }]} />
                  </View>
                  {currentTheme === key && (
                    <Ionicons name="checkmark-circle" size={24} color={themeOption.buttonBorder} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.button, borderColor: theme.buttonBorder }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.buttonText }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    borderRadius: 20,
  },
  themeButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
    padding: 8,
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
  },
  // 🆕 NOVO: Estilos do botão de escanear QR
  scanQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    gap: 12,
  },
  scanQRButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  expandingRectangle: {
    borderRadius: 12,
    padding: 20,
    minHeight: 700,
    flexGrow: 1,
  },
  quizListContainer: {
    alignItems: 'flex-start',
  },
  newQuizButton: {
    borderWidth: 2,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  quizText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  plusSymbol: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  savedQuizButton: {
    borderWidth: 2,
    borderRadius: 8,
    width: 150,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 10,
  },
  savedQuizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeList: {
    maxHeight: 350,
  },
  themeOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default QuizScreen;