import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import FriendInvitePopup from '../../components/FriendInvitePopup';

// --- ESTRUTURA DE DADOS ---
interface QuizOption { id: string; text: string; }
interface QuizQuestion { id: number; questionText: string; options: QuizOption[]; correctOptionId: string; }
interface Quiz { id: string; title: string; questions: QuizQuestion[]; }
interface Friend { id: string; name: string; avatarUrl: string; }

// --- COMPONENTE PRINCIPAL ---
const QuizCreatorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [isEditMode, setIsEditMode] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [isInvitePopupVisible, setIsInvitePopupVisible] = useState(false);

  // Buscar sessão do usuário
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const quizToEdit = route.params?.quizToEdit as Quiz | null;
    if (quizToEdit) {
      setIsEditMode(true);
      setQuizId(quizToEdit.id);
      setQuizTitle(quizToEdit.title);
      setQuestions(quizToEdit.questions);
    } else {
      setIsEditMode(false);
      setQuizId(null);
      setQuestions([{
        id: 1, questionText: '',
        options: [{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }, { id: 'E', text: '' }],
        correctOptionId: '',
      }]);
      setActiveQuestionId(1);
    }
  }, [route.params?.quizToEdit]);

  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
      questionText: '',
      options: [{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }, { id: 'E', text: '' }],
      correctOptionId: '',
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  }, [questions]);

  // ✅ FUNÇÃO CORRIGIDA - SALVA NO SUPABASE
  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz.');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para salvar quizzes.');
      return;
    }

    try {
      const quizData = {
        user_id: session.user.id,
        title: quizTitle,
        questions: questions,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode && quizId) {
        // Atualizar quiz existente
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quizId);

        if (error) throw error;

        Alert.alert('Sucesso', 'Quiz atualizado!');
        navigation.navigate('QuizScreen', { 
          type: 'quizSaved', 
          quiz: { id: quizId, title: quizTitle, questions } 
        });
      } else {
        // Criar novo quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert([quizData])
          .select()
          .single();

        if (error) throw error;

        setQuizId(data.id);
        Alert.alert('Sucesso', 'Quiz salvo!');
        navigation.navigate('QuizScreen', { 
          type: 'quizSaved', 
          quiz: { id: data.id, title: quizTitle, questions } 
        });
      }
    } catch (error) {
      console.error('Erro ao salvar quiz:', error);
      Alert.alert('Erro', 'Não foi possível salvar o quiz. Verifique sua conexão.');
    }
  };

  const handleDeleteQuestion = () => {
    if (questions.length <= 1) {
      Alert.alert('Ação não permitida', 'Um quiz deve ter pelo menos uma questão.');
      return;
    }
    Alert.alert('Excluir Questão', `Tem certeza de que deseja excluir a questão ${activeQuestionId}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: () => {
          setQuestions(prevQuestions => {
            const remainingQuestions = prevQuestions.filter(q => q.id !== activeQuestionId);
            return remainingQuestions;
          });
        },
      },
    ]);
  };

  // ✅ FUNÇÃO CORRIGIDA - DELETA DO SUPABASE
  const handleDeleteQuiz = () => {
    Alert.alert(
      'Excluir Quiz', 
      `Tem certeza de que deseja excluir o quiz "${quizTitle}" permanentemente?`, 
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              if (!quizId) {
                navigation.goBack();
                return;
              }

              const { error } = await supabase
                .from('quizzes')
                .delete()
                .eq('id', quizId);

              if (error) throw error;

              Alert.alert('Sucesso', 'Quiz excluído!');
              navigation.navigate('QuizScreen', { type: 'quizDeleted', quizId: quizId });
            } catch (error) {
              console.error('Erro ao excluir quiz:', error);
              Alert.alert('Erro', 'Não foi possível excluir o quiz.');
            }
          }
        },
      ]
    );
  };

  const handleUpdateQuestion = (questionId: number, field: 'questionText' | `option_${string}`, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        if (field === 'questionText') { return { ...q, questionText: value }; }
        if (field.startsWith('option_')) {
          const optionId = field.split('_')[1];
          return { ...q, options: q.options.map(opt => opt.id === optionId ? { ...opt, text: value } : opt) };
        }
      }
      return q;
    }));
  };

  const handleSelectCorrectOption = (questionId: number, correctId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, correctOptionId: correctId } : q));
  };

  // ===== NOVA LÓGICA DE CONVITE =====
  const handleInviteFriend = async (friendId: string) => {
    if (!session?.user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para enviar convites.');
      return;
    }

    if (!quizTitle.trim()) {
      Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz antes de convidar amigos.');
      return;
    }

    try {
      // Criar partida de quiz
      const { data: matchData, error: matchError } = await supabase
        .from('quiz_matches')
        .insert({
          quiz_id: quizId,
          quiz_title: quizTitle,
          host_id: session.user.id,
          is_active: false,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Adicionar host como participante
      await supabase.from('quiz_participants').insert({
        match_id: matchData.id,
        user_id: session.user.id,
        is_ready: false,
      });

      // Enviar convite via messages
      const inviteData = {
        quiz_id: quizId,
        quiz_title: quizTitle,
        match_id: matchData.id,
      };

      await supabase.from('messages').insert({
        sender_id: session.user.id,
        receiver_id: friendId,
        message_text: JSON.stringify(inviteData),
        message_type: 'quiz_invitation',
      });

      Alert.alert('Sucesso', 'Convite enviado!');
      setInviteModalVisible(false);
      
      // Navegar para sala de espera
      navigation.navigate('QuizWaitingRoom', {
        matchId: matchData.id,
        quizId: quizId,
        quizTitle: quizTitle,
        quizData: { id: quizId, title: quizTitle, questions },
      });
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    }
  };

  // Jogar sozinho (modo solo)
  const handleStartGame = () => {
    if (!quizTitle.trim()) {
      Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz antes de jogar.');
      return;
    }

    setInviteModalVisible(false);
    navigation.navigate('GameQuizScreen', {
      quizData: { id: quizId, title: quizTitle, questions },
      mode: 'solo',
    });
  };
  
  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={styles.gradient}
      >
        {/* Modal de Convite - Agora usa FriendInvitePopup real */}
        <Modal
          transparent={true}
          visible={isInviteModalVisible}
          animationType="fade"
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.inviteModalContainer}>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setInviteModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Escolha uma opção</Text>
              
              <TouchableOpacity style={styles.playButton} onPress={handleStartGame}>
                <Text style={styles.playButtonText}>Jogar Solo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: '#707DCB' }]} 
                onPress={() => {
                  setInviteModalVisible(false);
                  // Abre o popup de amigos após fechar o modal
                  setTimeout(() => {
                    setIsInvitePopupVisible(true);
                  }, 300);
                }}
              >
                <Text style={styles.playButtonText}>Convidar Amigos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Popup de Convite de Amigos */}
        <FriendInvitePopup
          isVisible={isInvitePopupVisible}
          onClose={() => setIsInvitePopupVisible(false)}
          onInvite={handleInviteFriend}
        />

        {/* Modal QR Code */}
        <Modal
          transparent={true}
          visible={isQrModalVisible}
          animationType="fade"
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qrModalContainer}>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Código QR do Quiz</Text>
              <View style={styles.qrCodePlaceholder}>
                <Ionicons name="qr-code" size={150} color="#333" />
              </View>
              <Text style={styles.qrInstruction}>Peça para seu amigo escanear este código para entrar no quiz.</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {isEditMode ? quizTitle : 'Novo Quiz'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={50} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.workspace}>
          <View style={styles.sidebar}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuiz}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => setInviteModalVisible(true)}>
                <Ionicons name="play" size={30} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => setQrModalVisible(true)}>
                <Ionicons name="qr-code" size={30} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={questions}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.questionNavItem,
                    item.id === activeQuestionId && styles.questionNavItemActive,
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
                        <TouchableOpacity
                          style={[
                            styles.optionSelector,
                            isCorrect && styles.optionSelectorCorrect,
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
                  <View style={styles.deleteButtonsContainer}>
                    <TouchableOpacity style={[styles.deleteButton, styles.deleteQuestionButton]} onPress={handleDeleteQuestion}>
                      <Ionicons name="trash-bin-outline" size={24} color="white" />
                      <Text style={styles.deleteButtonText}>Excluir Questão</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.deleteButton, styles.deleteQuizButton]} onPress={handleDeleteQuiz}>
                      <Ionicons name="trash-outline" size={24} color="white" />
                      <Text style={styles.deleteButtonText}>Excluir Quiz</Text>
                    </TouchableOpacity>
                  </View>
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
  gradient: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#000000ff', flex: 1 },
  backButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#D9D9D9', justifyContent: 'center', alignItems: 'center' },
  workspace: { flex: 1, flexDirection: 'row', backgroundColor: '#707DCB', borderRadius: 20, padding: 20, overflow: 'hidden' },
  sidebar: { width: 80, marginRight: 20, alignItems: 'center' },
  saveButton: { width: 70, height: 70, paddingVertical: 10, backgroundColor: '#FFF9E0', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  saveButtonText: { color: 'black', fontWeight: 'bold', fontSize: 17 },
  socialButtonsContainer: { flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: 10 },
  socialButton: { backgroundColor: '#D9D9D9', width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  playButton: { marginTop: 20, backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 50, borderRadius: 25 },
  playButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  inviteModalContainer: { width: '80%', maxWidth: 400, backgroundColor: '#FFF9E0', borderRadius: 20, padding: 20, alignItems: 'center' },
  qrModalContainer: { width: '80%', maxWidth: 400, backgroundColor: '#FFF9E0', borderRadius: 20, padding: 20, alignItems: 'center' },
  closeModalButton: { position: 'absolute', top: 10, right: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: 'black', marginBottom: 20 },
  friendCard: { alignItems: 'center', margin: 10, width: 120 },
  friendAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#707DCB' },
  friendName: { marginTop: 8, fontSize: 16, fontWeight: '600', color: 'black' },
  qrCodePlaceholder: { width: 200, height: 200, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginVertical: 20 },
  qrInstruction: { fontSize: 14, color: '#333', textAlign: 'center' },
  questionNavItem: { width: 50, height: 50, borderRadius: 20, backgroundColor: '#D9D9D9', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 3, borderColor: 'transparent' },
  questionNavItemActive: { borderColor: 'black' },
  questionNavText: { fontSize: 20, fontWeight: 'bold', color: 'black' },
  addQuestionButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D9D9D9', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  addQuestionButtonText: { fontSize: 40, color: 'black', fontWeight: 'bold', lineHeight: 40, textAlign: 'center' },
  editorArea: { flex: 1 },
  editorBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF9E0', borderRadius: 20 },
  editorContent: { padding: 20 },
  inputTitle: { fontSize: 24, fontWeight: 'bold', color: 'black', borderBottomWidth: 2, borderBottomColor: 'black', marginBottom: 20, padding: 10 },
  input: { borderRadius: 10, padding: 15, fontSize: 16, color: 'black', marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.5)' },
  inputQuestion: { minHeight: 250, textAlignVertical: 'top' },
  optionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  optionSelector: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: 'transparent' },
  optionSelectorCorrect: { backgroundColor: '#4CAF50' },
  optionSelectorText: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  optionSelectorTextCorrect: { color: 'white' },
  inputOption: { flex: 1, borderRadius: 10, padding: 15, fontSize: 16, color: 'black', backgroundColor: 'rgba(255,255,255,0.5)' },
  deleteButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 20 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  deleteQuestionButton: { backgroundColor: '#f44336' },
  deleteQuizButton: { backgroundColor: '#b71c1c' },
  deleteButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});

export default QuizCreatorScreen;