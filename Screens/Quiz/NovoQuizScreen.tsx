import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import FriendInvitePopup from '../../components/FriendInvitePopup';
import { createQuiz, updateQuiz, deleteQuiz } from '../../services/QuizService';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

// --- ESTRUTURA DE DADOS ---
interface QuizOption { id: string; text: string; }
interface QuizQuestion { id: number; questionText: string; options: QuizOption[]; correctOptionId: string; }
interface Quiz { id: string; title: string; questions: QuizQuestion[]; }

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
  const [qrModalMatchId, setQrModalMatchId] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<string>('');

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
  }, [route.params?.quizToEdit]);

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

  // ✅ CORRIGIDO - Funciona na web
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

    // Para web, usa window.confirm
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`Tem certeza de que deseja excluir a questão ${activeQuestionId}?`);
      
      if (!confirmar) {
        console.log('❌ Usuário cancelou a exclusão da questão');
        return;
      }

      console.log('🔴 Usuário confirmou exclusão da questão');

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
      // Para mobile, usa Alert.alert
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

  // ✅ CORRIGIDO - Funciona na web
  const handleDeleteQuiz = async () => {
    console.log('🗑️ handleDeleteQuiz chamado');
    console.log('   quizId:', quizId);
    console.log('   quizTitle:', quizTitle);

    // Para web, usa window.confirm
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
      // Para mobile, usa Alert.alert
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

  // ✅ CORRIGIDO COM LOGS DETALHADOS
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
    
    // Se o quiz ainda não foi salvo, salva primeiro
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
      
      // Criar partida de quiz
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

      // Adicionar host como participante
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

      // Preparar dados do convite
      const inviteData = {
        quiz_id: currentQuizId,
        quiz_title: quizTitle,
        match_id: matchData.id,
      };

      console.log('📤 Enviando convite via messages...');
      console.log('   sender_id:', session.user.id);
      console.log('   receiver_id:', friendId);
      console.log('   inviteData:', inviteData);

      // Enviar convite via messages
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
      
      // Navegar para sala de espera
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

    // garante quiz salvo
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
      // cria match caso ainda não exista (reaproveita se já tiver)
      // obs: evitamos criar duplicados criando sempre um novo match para o QR
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

      if (matchError || !matchData) {
        console.error('Erro ao criar match para QR:', matchError);
        throw matchError || new Error('No match data');
      }

      // garante que o host esteja na tabela de participantes
      const { error: participantError } = await supabase
        .from('quiz_participants')
        .upsert({
          match_id: matchData.id,
          user_id: session.user.id,
          is_ready: false,
        }, { onConflict: ['match_id', 'user_id'] });

      if (participantError) {
        console.error('Erro ao adicionar host aos participantes (QR):', participantError);
      }

      const payloadObj = {
        type: 'quiz_invite',
        matchId: matchData.id,
        quizId: currentQuizId,
        quizTitle,
      };
      const payloadStr = JSON.stringify(payloadObj);

      setQrModalMatchId(matchData.id);
      setQrPayload(payloadStr);
      setQrModalVisible(true);
    } catch (err) {
      console.error('Erro ao gerar QR:', err);
      if (Platform.OS === 'web') alert('Erro ao gerar QR.');
      else Alert.alert('Erro', 'Erro ao gerar QR.');
    }
  };

  // funçao para copiar payload/ link
  const handleCopyQrText = async () => {
    if (!qrPayload) return;
    await Clipboard.setStringAsync(qrPayload);
    if (Platform.OS === 'web') alert('QR payload copiado');
    else Alert.alert('Copiado', 'QR payload copiado para a área de transferência.');
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={styles.gradient}
      >
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

        <FriendInvitePopup
          isVisible={isInvitePopupVisible}
          onClose={() => setIsInvitePopupVisible(false)}
          onInvite={handleInviteFriend}
        />

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
              {qrPayload ? (
                <>
                  <QRCode value={qrPayload} size={220} />
                  <Text style={{ marginTop: 12, textAlign: 'center' }}>{quizTitle}</Text>
                  <TouchableOpacity style={[styles.playButton, { marginTop: 12 }]} onPress={handleCopyQrText}>
                    <Text style={styles.playButtonText}>Copiar código</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code" size={150} color="#333" />
                </View>
              )}
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
              <TouchableOpacity style={styles.socialButton} onPress={handleOpenQrModal}>
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
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
    color: '#ffffffff',
    flex: 1,
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
    backgroundColor: '#4d547cff',
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
    backgroundColor: '#e0dbc7ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 17,
  },
  socialButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  socialButton: {
    backgroundColor: '#D9D9D9',
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteModalContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#e0dbc7ff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  qrModalContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#e0dbc7ff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 20,
  },
  qrInstruction: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  questionNavItem: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  questionNavItemActive: {
    borderColor: 'black',
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
    borderRadius: 20,
    flex: 1,
  },
  editorBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8287a8ff',
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
    minHeight: 250,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  optionSelectorTextCorrect: {
    color: 'white',
  },
  inputOption: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  deleteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default QuizCreatorScreen;