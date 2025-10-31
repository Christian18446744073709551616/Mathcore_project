import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  Pressable,
  Alert,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Clipboard from 'expo-clipboard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { allTopics } from '../../data/topicsData'
import { ScrollView } from 'react-native-gesture-handler'

type Deck = { id: string; name: string }
type Topic = { id: string; name: string }
type AICreateFlashcardParams = { decks: Deck[] }

export default function AICreateFlashcardScreen() {
  const [previousPrompts, setPreviousPrompts] = useState<string[]>([])
  const navigation = useNavigation()
  const route = useRoute<RouteProp<{ params: AICreateFlashcardParams }, 'params'>>()
  const availableDecks: Deck[] = route.params?.decks ?? []

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [flashcard, setFlashcard] = useState<{ front: string; back: string } | null>(null)
  const [loadingIA, setLoadingIA] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(0))
  const [isDeckPickerVisible, setDeckPickerVisible] = useState(false)
  const [isTopicPickerVisible, setTopicPickerVisible] = useState(false)
  const [favoriteCards, setFavoriteCards] = useState<string[]>([])

  useEffect(() => {
    if (selectedDeck) {
      setAvailableTopics(allTopics[selectedDeck.id] ?? [])
      setSelectedTopic(null)
    }
  }, [selectedDeck])

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    const favs = await AsyncStorage.getItem('favoriteFlashcards')
    setFavoriteCards(favs ? JSON.parse(favs) : [])
  }

  const toggleFavorite = async () => {
    if (!flashcard) return
    const id = flashcard.front
    let updated: string[]
    if (favoriteCards.includes(id)) {
      updated = favoriteCards.filter((f) => f !== id)
    } else {
      updated = [...favoriteCards, id]
    }
    setFavoriteCards(updated)
    await AsyncStorage.setItem('favoriteFlashcards', JSON.stringify(updated))
    Alert.alert('⭐ Favorito', favoriteCards.includes(id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
  }

  const handleGenerateWithAI = async () => {
    if (!selectedTopic?.name) {
      alert('Selecione um tópico antes de gerar.')
      return
    }

    try {
      setLoadingIA(true)
      setFlashcard(null)

      const avoided = previousPrompts.join(', ')
      const prompt = `
Você é um gerador de flashcards educativos criativos.

Crie **um único flashcard original** sobre o tema "${selectedTopic.name}".

Evite repetir ou reformular flashcards que tratem de:
${avoided || 'nenhum ainda'}

Diretrizes:
- A frente ("front") deve ser uma pergunta ou afirmação instigante, variando o foco (conceito, aplicação, curiosidade, comparação, exemplo, causa e efeito etc.).
- A parte de trás ("back") deve trazer uma explicação clara, concisa e útil.
- Não repita ideias nem reformule as anteriores.
- Linguagem didática, voltada para estudantes.
- Responda APENAS com JSON puro:
{
  "front": "texto da frente",
  "back": "texto do verso"
}
      `

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          input: prompt,
          temperature: 0.8,
        }),
      })

      const data = await response.json()
      let text = data?.output?.[0]?.content?.[0]?.text || '{}'
      text = text.replace(/```json|```/g, '').trim()

      const parsed = JSON.parse(text)
      setFlashcard(parsed)
      setPreviousPrompts((prev) => [...prev, parsed.front])
      fadeIn()
    } catch (error) {
      console.error('Erro IA:', error)
      alert('Erro ao gerar flashcard. Tente novamente.')
    } finally {
      setLoadingIA(false)
    }
  }

  const handleSaveFlashcard = async () => {
    if (!flashcard) return
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase.from('flashcards').insert({
        user_id: user.id,
        topic_id: selectedTopic?.id,
        question: flashcard.front,
        answer: flashcard.back,
      })

      if (error) throw error
      alert('✅ Flashcard salvo com sucesso!')
      navigation.goBack()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar o flashcard.')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyFlashcard = async () => {
    if (!flashcard) return
    await Clipboard.setStringAsync(`🧠 Frente:\n${flashcard.front}\n\n💭 Verso:\n${flashcard.back}`)
    alert('📋 Flashcard copiado para a área de transferência!')
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.3]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={styles.gradientBackground}
      >

        <ScrollView
    contentContainerStyle={{ padding: 30, paddingBottom: 40 }}
    showsVerticalScrollIndicator={false}
  >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#FFF" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Gerar Flashcard com IA</Text>

        {/* Modal Deck */}
        <Modal visible={isDeckPickerVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Selecione um Baralho</Text>
              <FlatList
                data={availableDecks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalItem,
                      pressed && { backgroundColor: 'rgba(255,255,255,0.15)' },
                    ]}
                    onPress={() => {
                      setSelectedDeck(item)
                      setDeckPickerVisible(false)
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </Pressable>
                )}
              />
              <Pressable style={styles.modalClose} onPress={() => setDeckPickerVisible(false)}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal Topic */}
        <Modal visible={isTopicPickerVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Selecione um Tópico</Text>
              <FlatList
                data={availableTopics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalItem,
                      pressed && { backgroundColor: 'rgba(255,255,255,0.15)' },
                    ]}
                    onPress={() => {
                      setSelectedTopic(item)
                      setTopicPickerVisible(false)
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </Pressable>
                )}
              />
              <Pressable style={styles.modalClose} onPress={() => setTopicPickerVisible(false)}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Pressable
          style={({ pressed }) => [
            styles.selectorModern,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={() => setDeckPickerVisible(true)}
        >
          <Text style={styles.selectorText}>{selectedDeck?.name || 'Selecione um Baralho'}</Text>
          <Feather name="chevron-down" size={20} color="#A0A0A0" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.selectorModern,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          onPress={() =>
            selectedDeck
              ? setTopicPickerVisible(true)
              : alert('Selecione um baralho primeiro.')
          }
        >
          <Text style={styles.selectorText}>{selectedTopic?.name || 'Selecione um Tópico'}</Text>
          <Feather name="chevron-down" size={20} color="#A0A0A0" />
        </Pressable>

        <TouchableOpacity
          style={[styles.generateButton, loadingIA && { opacity: 0.7 }]}
          onPress={handleGenerateWithAI}
          disabled={loadingIA}
        >
          {loadingIA ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="cpu" size={20} color="#FFF" />
              <Text style={styles.generateText}>Gerar com IA</Text>
            </>
          )}
        </TouchableOpacity>

        {flashcard && (
          <Animated.View style={[styles.previewCard, { opacity: fadeAnim }]}>
            <Text style={styles.previewTitle}>Prévia do Flashcard</Text>
            <View style={styles.card}>
              <Text style={styles.sideTitle}>Frente</Text>
              <Text style={styles.cardText}>{flashcard.front}</Text>
              <View style={styles.divider} />
              <Text style={styles.sideTitle}>Verso</Text>
              <Text style={styles.cardText}>{flashcard.back}</Text>
              
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.smallButton} onPress={handleGenerateWithAI}>
                <Feather name="refresh-ccw" size={18} color="#FFF" />
                <Text style={styles.smallButtonText}>Gerar Novo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallButton} onPress={handleCopyFlashcard}>
                <Feather name="copy" size={18} color="#FFF" />
                <Text style={styles.smallButtonText}>Copiar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallButton} onPress={toggleFavorite}>
                <Feather
                  name={favoriteCards.includes(flashcard.front) ? 'star' : 'star'}
                  size={18}
                  color={favoriteCards.includes(flashcard.front) ? '#FFD700' : '#FFF'}
                />
                <Text style={styles.smallButtonText}>
                  {favoriteCards.includes(flashcard.front) ? 'Favorito' : 'Favoritar'}
                </Text>
              </TouchableOpacity>
            
              
            </View>

            
            

          </Animated.View>
          
        )}
          <View>
                   <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSaveFlashcard}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Feather name="save" size={20} color="#FFF" />
                  <Text style={styles.saveText}>Salvar Flashcard</Text>
                </>
              )}
            </TouchableOpacity>
              </View>
        
         </ScrollView>
        
      </LinearGradient>
      
    </View>
  )
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1, padding: 30, paddingBottom:100 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: '#FFF', fontSize: 17, marginLeft: 5 },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },

  selectorModern: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  selectorText: { color: '#FFF', fontSize: 16 },
  generateButton: {
    backgroundColor: '#40C463',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  generateText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  previewCard: { marginTop: 20 },
  previewTitle: { color: '#DDD', textAlign: 'center', marginBottom: 10 },
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#444',
  },
  sideTitle: { color: '#CCC', fontWeight: '500', marginBottom: 4 },
  cardText: { color: '#FFF', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#444', marginVertical: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  smallButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#6E72AA',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  smallButtonText: { color: '#FFF', fontWeight: '600' },
  saveButton: {
    marginTop: 25,
  
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalBox: {
    backgroundColor: '#2C2C2E',
    width: '85%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  modalItemText: {
    color: '#FFF',
    fontSize: 17,
    textAlign: 'center',
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 12,
  },
  modalCloseText: { color: '#FFF', textAlign: 'center', fontWeight: '600' },
})
