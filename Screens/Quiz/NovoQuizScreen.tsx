import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import FriendInvitePopup from '../../components/FriendInvitePopup';
import { createQuiz, updateQuiz, deleteQuiz } from '../../services/QuizService';
import * as Clipboard from 'expo-clipboard';
import { generateQRCodeContent } from '../../utils/qrCodeUtils';

// --- ESTRUTURA DE DADOS ---
interface QuizOption { id: string; text: string; }
interface QuizQuestion { id: number; questionText: string; options: QuizOption[]; correctOptionId: string; }
interface Quiz { id: string; title: string; questions: QuizQuestion[]; }

// --- ESTILOS BASE ---
const baseStyles = StyleSheet.create({
  gradient: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: '700',
    color: '#ffffffff',
    flex: 1,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  workspace: {
    flex: 1,
  },
  sidebar: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#4d547cff',
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  saveButton: {
    minWidth: 58,
    minHeight: 44,
    backgroundColor: '#e0dbc7ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveButtonText: {
    color: 'black',
    fontWeight: '700',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialButton: {
    width: 46,
    height: 46,
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  playButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteModalContainer: {
    width: '86%',
    maxWidth: 560,
    backgroundColor: '#e0dbc7ff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  qrModalContainer: {
    width: '86%',
    maxWidth: 560,
    backgroundColor: '#e0dbc7ff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    marginBottom: 14,
  },
  questionNavItem: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  questionNavText: {
    fontWeight: '700',
    color: 'black',
  },
  addQuestionButton: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editorArea: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  editorBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8287a87c',
    borderRadius: 16,
  },
  editorContent: {
    padding: 14,
    gap: 12,
  },
  inputTitle: {
    fontWeight: '700',
    color: 'black',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.12)',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: 'black',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  inputQuestion: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionSelector: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  optionSelectorCorrect: {
    backgroundColor: '#4CAF50',
  },
  optionSelectorText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  optionSelectorTextCorrect: {
    color: 'white',
  },
  inputOption: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: 'black',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  deleteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteQuestionButton: {
    backgroundColor: '#f44336',
  },
  deleteQuizButton: {
    backgroundColor: '#b71c1c',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
  },
});

// --- COMPONENTE PRINCIPAL (sem alteração de lógica) ---
const QuizCreatorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  // breakpoint simples para "PC"
  const isDesktop = width >= 900;
  const isTablet = width >= 600 && width < 900;

  // estados e lógica (sem alterações)
  const [isEditMode, setIsEditMode] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [isInvitePopupVisible, setIsInvitePopupVisible] = useState(false);
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [qrModalMatchId, setQrModalMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const quizToEdit = (route.params as { quizToEdit?: Quiz })?.quizToEdit;
    if (quizToEdit) {
      setIsEditMode(true);
      setQuizId(quizToEdit.id);
      setQuizTitle(quizToEdit.title);
      setQuestions(quizToEdit.questions);
      if (quizToEdit.questions.length > 0) {
        setActiveQuestionId(quizToEdit.questions[0].id);
      }
    } else {
      setIsEditMode(false);
      setQuizId(null);
      setQuestions([{
        id: 1,
        questionText: '',
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
          { id: 'E', text: '' }
        ],
        correctOptionId: '',
      }]);
      setActiveQuestionId(1);
    }
  }, [route.params]);

  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
      questionText: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' }
      ],
      correctOptionId: '',
    };
    setQuestions(prev => [...prev, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  }, [questions]);

  const handleSaveQuiz = async () => {
    if (!session?.user?.id) {
      if (Platform.OS === 'web') {
        alert('Você precisa estar logado para salvar quizzes.');
      } else {
        Alert.alert('Erro', 'Você precisa estar logado para salvar quizzes.');
      }
      return;
    }

    if (!quizTitle.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor, dê um nome ao seu quiz.');
      } else {
        Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz.');
      }
      return;
    }

    try {
      if (isEditMode && quizId) {
        const updatedQuiz = await updateQuiz(quizId, quizTitle, questions);
        if (updatedQuiz) {
          if (Platform.OS === 'web') {
            alert('Quiz atualizado!');
          } else {
            Alert.alert('Sucesso', 'Quiz atualizado!');
          }
          navigation.goBack();
        } else {
          if (Platform.OS === 'web') {
            alert('Não foi possível atualizar o quiz.');
          } else {
            Alert.alert('Erro', 'Não foi possível atualizar o quiz.');
          }
        }
      } else {
        const newQuiz = await createQuiz(session.user.id, quizTitle, questions);
        if (newQuiz) {
          if (Platform.OS === 'web') {
            alert('Quiz criado!');
          } else {
            Alert.alert('Sucesso', 'Quiz criado!');
          }
          navigation.goBack();
        } else {
          if (Platform.OS === 'web') {
            alert('Não foi possível criar o quiz.');
          } else {
            Alert.alert('Erro', 'Não foi possível criar o quiz.');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar quiz:', error);
      if (Platform.OS === 'web') {
        alert('Ocorreu um erro ao salvar o quiz.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao salvar o quiz.');
      }
    }
  };

  const handleDeleteQuestion = () => {
    console.log('🗑️ handleDeleteQuestion chamado');

    if (questions.length <= 1) {
      if (Platform.OS === 'web') {
        alert('Um quiz deve ter pelo menos uma questão.');
      } else {
        Alert.alert('Ação não permitida', 'Um quiz deve ter pelo menos uma questão.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`Tem certeza de que deseja excluir a questão ${activeQuestionId}?`);

      if (!confirmar) {
        console.log(' Usuário cancelou a exclusão da questão');
        return;
      }

      console.log(' Usuário confirmou exclusão da questão');

      setQuestions(prevQuestions => {
        const currentIndex = prevQuestions.findIndex(q => q.id === activeQuestionId);
        const remainingQuestions = prevQuestions.filter(q => q.id !== activeQuestionId);

        if (remainingQuestions.length > 0) {
          if (currentIndex > 0) {
            setActiveQuestionId(remainingQuestions[currentIndex - 1].id);
          } else {
            setActiveQuestionId(remainingQuestions[0].id);
          }
        }

        return remainingQuestions;
      });
    } else {
      Alert.alert(
        'Excluir Questão',
        `Tem certeza de que deseja excluir a questão ${activeQuestionId}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              setQuestions(prevQuestions => {
                const currentIndex = prevQuestions.findIndex(q => q.id === activeQuestionId);
                const remainingQuestions = prevQuestions.filter(q => q.id !== activeQuestionId);

                if (remainingQuestions.length > 0) {
                  if (currentIndex > 0) {
                    setActiveQuestionId(remainingQuestions[currentIndex - 1].id);
                  } else {
                    setActiveQuestionId(remainingQuestions[0].id);
                  }
                }

                return remainingQuestions;
              });
            }
          }
        ]
      );
    }
  };

  const handleDeleteQuiz = async () => {
    console.log('🗑️ handleDeleteQuiz chamado');
    console.log('   quizId:', quizId);
    console.log('   quizTitle:', quizTitle);

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`Tem certeza de que deseja excluir o quiz "${quizTitle}" permanentemente?`);

      if (!confirmar) {
        console.log('❌ Usuário cancelou a exclusão');
        return;
      }

      console.log('🔴 Usuário confirmou exclusão');

      if (quizId) {
        console.log('📤 Chamando deleteQuiz com ID:', quizId);
        const success = await deleteQuiz(quizId);
        console.log('📥 Resultado do deleteQuiz:', success);

        if (success) {
          console.log('✅ Quiz excluído com sucesso!');
          alert('Quiz excluído com sucesso!');
          navigation.goBack();
        } else {
          console.log('❌ Falha ao excluir quiz');
          alert('Não foi possível excluir o quiz.');
        }
      } else {
        console.log('⚠️ Quiz não tem ID, apenas voltando');
        navigation.goBack();
      }
    } else {
      Alert.alert(
        'Excluir Quiz',
        `Tem certeza de que deseja excluir o quiz "${quizTitle}" permanentemente?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              if (quizId) {
                const success = await deleteQuiz(quizId);
                if (success) {
                  Alert.alert('Sucesso', 'Quiz excluído!');
                  navigation.goBack();
                } else {
                  Alert.alert('Erro', 'Não foi possível excluir o quiz.');
                }
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
    }
  };

  const handleUpdateQuestion = useCallback((questionId: number, field: 'questionText' | `option_${string}`, value: string) => {
    setQuestions(prev => {
      return prev.map(q => {
        if (q.id !== questionId) {
          return q;
        }

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

        return q;
      });
    });
  }, []);

  const handleSelectCorrectOption = (questionId: number, correctId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, correctOptionId: correctId } : q));
  };

  const handleInviteFriend = async (friendId: string) => {
    console.log('👥 handleInviteFriend chamado para friendId:', friendId);

    if (!session?.user?.id) {
      if (Platform.OS === 'web') {
        alert('Você precisa estar logado para enviar convites.');
      } else {
        Alert.alert('Erro', 'Você precisa estar logado para enviar convites.');
      }
      return;
    }

    if (!quizTitle.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor, dê um nome ao seu quiz antes de convidar amigos.');
      } else {
        Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz antes de convidar amigos.');
      }
      return;
    }

    let currentQuizId = quizId;

    if (!currentQuizId) {
      console.log('💾 Quiz não salvo, salvando primeiro...');
      const newQuiz = await createQuiz(session.user.id, quizTitle, questions);
      if (!newQuiz) {
        if (Platform.OS === 'web') {
          alert('Não foi possível salvar o quiz.');
        } else {
          Alert.alert('Erro', 'Não foi possível salvar o quiz.');
        }
        return;
      }
      currentQuizId = newQuiz.id;
      setQuizId(currentQuizId);
      setIsEditMode(true);
      console.log('✅ Quiz salvo com ID:', currentQuizId);
    }

    try {
      console.log('📤 Criando quiz_match...');

      const { data: matchData, error: matchError } = await supabase
        .from('quiz_matches')
        .insert({
          quiz_id: currentQuizId,
          quiz_title: quizTitle,
          host_id: session.user.id,
          is_active: false,
        })
        .select()
        .single();

      if (matchError) {
        console.error('❌ Erro ao criar match:', matchError);
        throw matchError;
      }

      console.log('✅ Match criado:', matchData);

      console.log('📤 Adicionando host como participante...');
      const { error: participantError } = await supabase
        .from('quiz_participants')
        .insert({
          match_id: matchData.id,
          user_id: session.user.id,
          is_ready: false,
        });

      if (participantError) {
        console.error('❌ Erro ao adicionar participante:', participantError);
        throw participantError;
      }

      console.log('✅ Host adicionado como participante');

      const inviteData = {
        quiz_id: currentQuizId,
        quiz_title: quizTitle,
        match_id: matchData.id,
      };

      console.log('📤 Enviando convite via messages...');
      console.log('   sender_id:', session.user.id);
      console.log('   receiver_id:', friendId);
      console.log('   inviteData:', inviteData);

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          receiver_id: friendId,
          message_text: JSON.stringify(inviteData),
          message_type: 'invitation',
        })
        .select();

      if (messageError) {
        console.error('❌ Erro ao enviar convite:', messageError);
        throw messageError;
      }

      console.log('✅ Convite enviado com sucesso!', messageData);

      if (Platform.OS === 'web') {
        alert('Convite enviado!');
      } else {
        Alert.alert('Sucesso', 'Convite enviado!');
      }

      setIsInvitePopupVisible(false);

      (navigation as any).navigate('QuizWaitingRoom', {
        matchId: matchData.id,
        quizId: currentQuizId,
        quizTitle: quizTitle,
        quizData: { id: currentQuizId, title: quizTitle, questions },
      });
    } catch (error) {
      console.error('❌ Erro geral ao enviar convite:', error);
      if (Platform.OS === 'web') {
        alert('Não foi possível enviar o convite.');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o convite.');
      }
    }
  };

  const handleStartGame = async () => {
    if (!quizTitle.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor, dê um nome ao seu quiz antes de jogar.');
      } else {
        Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz antes de jogar.');
      }
      return;
    }

    let currentQuizId = quizId;
    if (!currentQuizId && session?.user?.id) {
      const newQuiz = await createQuiz(session.user.id, quizTitle, questions);
      if (newQuiz) {
        currentQuizId = newQuiz.id;
        setQuizId(currentQuizId);
        setIsEditMode(true);
      }
    }

    setInviteModalVisible(false);
    (navigation as any).navigate('GameQuizScreen', {
      quizData: { id: currentQuizId, title: quizTitle, questions },
      mode: 'solo',
    });
  };

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const handleOpenQrModal = async () => {
    if (!session?.user?.id) {
      if (Platform.OS === 'web') alert('Você precisa estar logado para gerar QR.');
      else Alert.alert('Erro', 'Você precisa estar logado para gerar QR.');
      return;
    }

    if (!quizTitle.trim()) {
      if (Platform.OS === 'web') alert('Por favor, dê um nome ao seu quiz antes de gerar o QR.');
      else Alert.alert('Atenção', 'Por favor, dê um nome ao seu quiz antes de gerar o QR.');
      return;
    }

    let currentQuizId = quizId;
    if (!currentQuizId) {
      const newQuiz = await createQuiz(session.user.id, quizTitle, questions);
      if (!newQuiz) {
        if (Platform.OS === 'web') alert('Não foi possível salvar o quiz.');
        else Alert.alert('Erro', 'Não foi possível salvar o quiz.');
        return;
      }
      currentQuizId = newQuiz.id;
      setQuizId(currentQuizId);
      setIsEditMode(true);
    }

    try {
      const { data: matchData, error: matchError } = await supabase
        .from('quiz_matches')
        .insert({
          quiz_id: currentQuizId,
          quiz_title: quizTitle,
          host_id: session.user.id,
          is_active: false,
        })
        .select()
        .single();

      if (matchError) {
        console.error('Erro ao criar match para QR:', matchError);
        throw matchError;
      }

      const { error: participantError } = await supabase
        .from('quiz_participants')
        .upsert({
          match_id: matchData.id,
          user_id: session.user.id,
          is_ready: false,
        }, { onConflict: 'match_id,user_id' });

      if (participantError) {
        console.error('Erro ao adicionar host aos participantes:', participantError);
      }

      const qrUrl = generateQRCodeContent({
        type: 'quiz_invite',
        matchId: matchData.id,
        quizId: currentQuizId,
        quizTitle: quizTitle,
      });

      setQrModalMatchId(matchData.id);
      setQrPayload(qrUrl);
      setQrModalVisible(true);

      setTimeout(() => {
        (navigation as any).navigate('QuizWaitingRoom', {
          matchId: matchData.id,
          quizId: currentQuizId,
          quizTitle: quizTitle,
          quizData: { id: currentQuizId, title: quizTitle, questions },
        });
      }, 500);

    } catch (err) {
      console.error('Erro ao gerar QR:', err);
      if (Platform.OS === 'web') alert('Erro ao gerar QR.');
      else Alert.alert('Erro', 'Erro ao gerar QR.');
    }
  };

  const handleCopyQrText = async () => {
    if (!qrPayload) return;
    await Clipboard.setStringAsync(qrPayload);
    if (Platform.OS === 'web') alert('Link copiado! Cole no navegador para entrar na sala.');
    else Alert.alert('Link Copiado', 'Cole o link no navegador para entrar na sala do quiz.');
  };

  // estilos dinâmicos com base na largura (apenas apresentação)
  const dynamic = {
    containerDirection: isDesktop ? 'row' : 'column',
    headerDirection: isDesktop ? 'row' : 'row',
    titleFontSize: isDesktop ? 36 : isTablet ? 30 : 28,
    titleAlign: isDesktop ? 'left' : 'left',
    sidebarWidth: isDesktop ? 260 : '100%',
    sidebarPadding: isDesktop ? 18 : 12,
    editorPadding: isDesktop ? 22 : 14,
    questionButtonSize: isDesktop ? 52 : 44,
    inputQuestionMinHeight: isDesktop ? 220 : 160,
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={[baseStyles.gradient]}
      >
        <Modal
          transparent={true}
          visible={isInviteModalVisible}
          animationType="fade"
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <View style={baseStyles.modalOverlay}>
            <View style={baseStyles.inviteModalContainer}>
              <TouchableOpacity style={baseStyles.closeModalButton} onPress={() => setInviteModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={baseStyles.modalTitle}>Escolha uma opção</Text>

              <TouchableOpacity style={baseStyles.playButton} onPress={handleStartGame}>
                <Text style={baseStyles.playButtonText}>Jogar Solo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[baseStyles.playButton, { backgroundColor: '#707DCB', marginTop: 12 }]}
                onPress={() => {
                  setInviteModalVisible(false);
                  setTimeout(() => {
                    setIsInvitePopupVisible(true);
                  }, 300);
                }}
              >
                <Text style={baseStyles.playButtonText}>Convidar Amigos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FriendInvitePopup
          isVisible={isInvitePopupVisible}
          onClose={() => setIsInvitePopupVisible(false)}
          onInvite={handleInviteFriend}
        />

        {/* Header */}
        <View style={[baseStyles.headerRow, { flexDirection: dynamic.headerDirection }]}>
          <Text
            style={[
              baseStyles.title,
              {
                fontSize: dynamic.titleFontSize,
                textAlign: dynamic.titleAlign,
                marginRight: 10,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isEditMode ? quizTitle || 'Quiz (sem título)' : 'Novo Quiz'}
          </Text>

          <TouchableOpacity style={baseStyles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={44} color="black" />
          </TouchableOpacity>
        </View>

        {/* Workspace: sidebar + editor */}
        <View style={[baseStyles.workspace, { flexDirection: dynamic.containerDirection, columnGap: 12 }]}>
          {/* Sidebar */}
          <View
            style={[
              baseStyles.sidebar,
              {
                width: dynamic.sidebarWidth,
                paddingHorizontal: dynamic.sidebarPadding,
                
                flexDirection: isDesktop ? 'column' : 'row',
                alignItems: isDesktop ? 'stretch' : 'center',
                justifyContent: isDesktop ? 'flex-start' : 'flex-start',
                marginRight: isDesktop ? 12 : 0,
                paddingVertical: isDesktop ? 12 : 4,
                   height: isDesktop ? 'auto' : 72,

              },
            ]}
          >
            <View style={{ flexDirection: isDesktop ? 'row' : 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: isDesktop ? 12 : 0 }}>
              <TouchableOpacity style={baseStyles.saveButton} onPress={handleSaveQuiz}>
                <Text style={baseStyles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>

              <View style={{ width: 8 }} />

              <View style={baseStyles.socialButtonsContainer}>
                <TouchableOpacity style={baseStyles.socialButton} onPress={() => setInviteModalVisible(true)}>
                  <Ionicons name="play" size={26} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={baseStyles.socialButton} onPress={handleOpenQrModal}>
                  <Ionicons name="qr-code" size={26} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Question navigator */}
            <View style={{ flex: 1, marginTop: isDesktop ? 6 : 0 }}>
              <ScrollView
                horizontal={!isDesktop}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 6,
                  alignItems: isDesktop ? 'flex-start' : 'center',
                  flexDirection: isDesktop ? 'row' : 'row',
                  flexWrap: isDesktop ? 'wrap' : 'nowrap',
                  width: isDesktop ? 220 : 'auto',
             

                  // opcional (mas deixa bonito)
                  columnGap: isDesktop ? 10 : 0,
                  rowGap: isDesktop ? 10 : 0,
                }}
              >
                {questions.map((question) => {
                  const active = question.id === activeQuestionId;
                  return (
                    <TouchableOpacity
                      key={question.id}
                      style={[
                        baseStyles.questionNavItem,
                        {
                          width: dynamic.questionButtonSize,
                          height: dynamic.questionButtonSize,
                          borderRadius: dynamic.questionButtonSize / 2,
                          backgroundColor: active ? '#007AFF' : '#EEE',
                          borderColor: active ? '#000' : 'transparent',
                        },
                      ]}
                      onPress={() => setActiveQuestionId(question.id)}
                    >
                      <Text style={[baseStyles.questionNavText, { color: active ? '#fff' : '#000' }]}>{question.id}</Text>
                    </TouchableOpacity>
                  );
                })}


              </ScrollView>
            </View>

            {/* On desktop, place add button also bottom */}

            <TouchableOpacity
              style={[
                baseStyles.addQuestionButton,
                {
                  marginTop: 12,
                  alignSelf: 'center',
                  width: dynamic.questionButtonSize,
                  height: dynamic.questionButtonSize,
                  borderRadius: dynamic.questionButtonSize / 2,
                  backgroundColor: 'rgba(220, 226, 220, 1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              ]}
              onPress={handleAddQuestion}
            >
              <Text
                style={{
                  color: '#000000ff',
                  fontSize: isDesktop ? 28 : 24,
                  fontWeight: '700',
                  textAlign: 'center'
                }}
              >
                +
              </Text>
            </TouchableOpacity>


          </View>

          {/* Editor area */}
          <ScrollView
            style={[baseStyles.editorArea, { flex: 1 }]}
            contentContainerStyle={{ flexGrow: 1, padding: dynamic.editorPadding }}
            showsVerticalScrollIndicator={false}
          >
            <View style={baseStyles.editorBackground} />
            <View style={[baseStyles.editorContent, { padding: dynamic.editorPadding }]}>
              {activeQuestion && (
                <>
                  <TextInput
                    style={[baseStyles.inputTitle, { outlineStyle: 'none', fontSize: isDesktop ? 20 : 18 }]}
                    placeholder="Nome do Quiz"
                    placeholderTextColor="rgba(0,0,0,0.45)"
                    value={quizTitle}
                    onChangeText={setQuizTitle}
                  />

                  <TextInput
                    style={[baseStyles.input, baseStyles.inputQuestion, { minHeight: dynamic.inputQuestionMinHeight, outlineStyle: 'none', }]}
                    placeholder="Comece a digitar a pergunta..."
                    placeholderTextColor="#787878"
                    multiline
                    value={activeQuestion.questionText}
                    onChangeText={text => handleUpdateQuestion(activeQuestion.id, 'questionText', text)}
                  />

                  {activeQuestion.options.map((option) => {
                    const isCorrect = activeQuestion.correctOptionId === option.id;
                    return (
                      <View key={option.id} style={baseStyles.optionContainer}>
                        <TouchableOpacity
                          style={[
                            baseStyles.optionSelector,
                            isCorrect && baseStyles.optionSelectorCorrect,
                            { width: isDesktop ? 48 : 40, height: isDesktop ? 48 : 40, borderRadius: isDesktop ? 24 : 20 },
                          ]}
                          onPress={() => handleSelectCorrectOption(activeQuestion.id, option.id)}
                        >
                          <Text style={[baseStyles.optionSelectorText, isCorrect && baseStyles.optionSelectorTextCorrect]}>
                            {option.id}
                          </Text>
                        </TouchableOpacity>

                        <TextInput
                          style={[baseStyles.inputOption, { fontSize: isDesktop ? 16 : 15, outlineStyle: 'none', }]}
                          placeholder={`Alternativa ${option.id}`}
                          placeholderTextColor="#787878"
                          value={option.text}
                          onChangeText={text => handleUpdateQuestion(activeQuestion.id, `option_${option.id}`, text)}
                        />
                      </View>
                    );
                  })}

                  <View style={baseStyles.deleteButtonsContainer}>
                    <TouchableOpacity style={[baseStyles.deleteButton, baseStyles.deleteQuestionButton]} onPress={handleDeleteQuestion}>
                      <Ionicons name="trash-bin-outline" size={18} color="white" />
                      <Text style={baseStyles.deleteButtonText}>Excluir Questão</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[baseStyles.deleteButton, baseStyles.deleteQuizButton]} onPress={handleDeleteQuiz}>
                      <Ionicons name="trash-outline" size={18} color="white" />
                      <Text style={baseStyles.deleteButtonText}>Excluir Quiz</Text>
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

export default QuizCreatorScreen;
