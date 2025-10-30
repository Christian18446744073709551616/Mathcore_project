import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { allTopics } from '../../data/topicsData';

// Tipos para os dados e para a rota
type Deck = { id: string; name: string };
type Topic = { id: string; name: string };
type CreateFlashcardRouteParams = {
  decks: Deck[];
};

const CustomPicker: React.FC<{
  label: string;
  value?: string | null;
  onPress: () => void;
  placeholder?: string;
  
}> = ({ label, value, onPress, placeholder = '' }) => (
  <View style={styles.pickerContainer}>
    <Text style={styles.pickerLabel}>{label}</Text>
    <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
      <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>
        {value ?? placeholder}
      </Text>
      <Feather name="chevron-down" size={20} color="#A0A0A0" />
    </TouchableOpacity>
  </View>
);

const CreateFlashcardScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: CreateFlashcardRouteParams }, 'params'>>();

  const availableDecks: Deck[] = route.params?.decks ?? [];

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [isDeckPickerVisible, setDeckPickerVisible] = useState(false);
  const [isTopicPickerVisible, setTopicPickerVisible] = useState(false);

  // --- ALTERAÇÃO 1: Novo estado para feedback de carregamento no botão ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (selectedDeck) {
      const fetchTopics = () => { // Não precisa de async para dados locais
        setLoadingTopics(true);
        setSelectedTopic(null);
        setAvailableTopics(allTopics[selectedDeck.id] ?? []);
        setLoadingTopics(false);
      };
      fetchTopics();
    }
  }, [selectedDeck]);

  const handleGoBack = () => navigation.goBack();
  const handleOpenDeckPicker = () => setDeckPickerVisible(true);

  const handleOpenTopicPicker = () => {
    if (!selectedDeck) {
      alert('Por favor, selecione um baralho primeiro.');
      return;
    }
    setTopicPickerVisible(true);
  };

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setDeckPickerVisible(false);
  };

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setTopicPickerVisible(false);
  };

  // --- ALTERAÇÃO 2: A função agora é 'async' e se comunica com o Supabase ---
  const handleGenerateCard = async () => {
    // validação básica
    if (!selectedDeck || !selectedTopic || !question.trim() || !answer.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true); // Inicia o loading

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado. Por favor, faça login novamente.');
        return;
      }

      const newFlashcard = {
        user_id: user.id,
        topic_id: selectedTopic.id,
        question,
        answer,
      };

      const { error } = await supabase.from('flashcards').insert([newFlashcard]);

      if (error) {
        console.error('Erro ao salvar flashcard:', error);
        alert('Ocorreu um erro ao salvar seu flashcard. Tente novamente.');
        return;
      }

      console.log('Flashcard salvo com sucesso!');
      navigation.goBack();

    } catch (error) {
      console.error('Erro inesperado ao gerar flashcard:', error);
      // opcional: alert('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false); // Finaliza o loading, independente de sucesso ou falha
    }
  };

   return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#242948', '#5C6494']} locations={[0.65, 0.30]} start={{ x: 1, y: 1 }} end={{ x: 0.85, y: 0.4 }} style={styles.gradientBackground}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <CustomPicker label="Baralho" value={selectedDeck?.name} onPress={handleOpenDeckPicker} placeholder="Selecione o conteúdo" />
            
            {loadingTopics ? <ActivityIndicator color="#FFFFFF" style={{ marginTop: 20 }}/> : (
              <CustomPicker label="Tópico" value={selectedTopic?.name} onPress={handleOpenTopicPicker} placeholder="Selecione o tópico da aula" />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pergunta</Text>
              <TextInput style={[styles.textInput, styles.questionInput]} placeholder="Digite a pergunta..." placeholderTextColor="#A0A0A0" multiline value={question} onChangeText={setQuestion} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Resposta</Text>
              <TextInput style={[styles.textInput, styles.answerInput]} placeholder="Digite a resposta..." placeholderTextColor="#A0A0A0" multiline value={answer} onChangeText={setAnswer} />
            </View>
          </ScrollView>

          {/* --- ALTERAÇÃO 3: O botão agora tem feedback de carregamento --- */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.generateButton, isSubmitting && styles.generateButtonDisabled]} 
              onPress={handleGenerateCard}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.generateButtonText}>Gerar Card</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal animationType="slide" transparent={true} visible={isDeckPickerVisible} onRequestClose={() => setDeckPickerVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione um Baralho</Text>
              <FlatList
                data={availableDecks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectDeck(item)}>
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setDeckPickerVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal animationType="slide" transparent={true} visible={isTopicPickerVisible} onRequestClose={() => setTopicPickerVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione um Tópico</Text>
              <FlatList
                data={availableTopics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectTopic(item)}>
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.modalEmptyText}>Nenhum tópico encontrado.</Text>}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setTopicPickerVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Estilos existentes)
  gradientBackground: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { color: '#FFFFFF', fontSize: 17, marginLeft: 4 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  pickerContainer: { marginBottom: 25 },
  pickerLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  pickerButton: { backgroundColor: 'rgba(44, 44, 46, 0.8)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerButtonText: { color: '#FFFFFF', fontSize: 16 },
  placeholderText: { color: '#A0A0A0' },
  inputGroup: { marginBottom: 25 },
  inputLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  textInput: { backgroundColor: 'rgba(44, 44, 46, 0.8)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10, padding: 15, fontSize: 16, color: '#FFFFFF', textAlignVertical: 'top' },
  questionInput: { minHeight: 120 },
  answerInput: { minHeight: 150 },
  footer: { padding: 20, paddingBottom: 40 },
  generateButton: { backgroundColor: '#34C759', borderRadius: 15, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  generateButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  
  // --- ALTERAÇÃO 4: Novo estilo para o botão desativado/em carregamento ---
  generateButtonDisabled: {
    backgroundColor: '#34C75980', // Verde com 50% de opacidade
  },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  modalContent: { backgroundColor: '#2C2C2E', borderRadius: 14, padding: 20, width: '85%', maxHeight: '70%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  modalItemText: { color: '#FFFFFF', fontSize: 18, textAlign: 'center' },
  modalEmptyText: { color: '#A0A0A0', fontSize: 16, textAlign: 'center', marginTop: 20 },
  modalCloseButton: { marginTop: 20, backgroundColor: '#007AFF', borderRadius: 14, padding: 15 },
  modalCloseButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', textAlign: 'center' },
});

export default CreateFlashcardScreen;