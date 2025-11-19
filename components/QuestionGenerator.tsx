import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { LinearGradient } from 'expo-linear-gradient'

const CONTENTS = [
  { name: 'Geometria', topics: ['Geometria Plana', 'Quadrados', 'Triângulos', 'Retângulos', 'Losangos', 'Trapézios', 'Paralelogramos', 'Hexágonos', 'Ângulos', 'Polígonos'] },
  { name: 'Matemática Financeira', topics: ['Estatística', 'Probabilidade'] },
  { name: 'Operações e Sistemas Numéricos', topics: ['Adição e Subtração', 'Multiplicação e Divisão', 'Expressões Numéricas', 'Frações', 'Sistema de Numeração Decimal', 'Sistema Métrico Decimal', 'MMC e MDC'] },
  { name: 'Álgebra Elementar', topics: ['Noções de Função', 'Função Afim'] },
]

function Popup({ visible, message, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)'
      }}>
        <View style={{
          width: '80%',
          maxWidth: 400,
          backgroundColor: '#2b2e4a',
          padding: 20,
          borderRadius: 15,
          elevation: 1,
          borderWidth: 1,
          borderColor: '#5c6bc0'
        }}>
          <Text style={{ color: '#fff', fontSize: 16, marginBottom: 20 }}>
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#00AEEF',
              paddingVertical: 10,
              borderRadius: 10
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function QuestionGenerator() {
  const [popupVisible, setPopupVisible] = useState(false);
const [popupMessage, setPopupMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerAnim] = useState(new Animated.Value(0))
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState<any>(null)
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('fácil')
  const [expandedContent, setExpandedContent] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [history, setHistory] = useState<any[]>([])
  const [autoDifficulty, setAutoDifficulty] = useState(false)
  const correctStreak = useRef(0)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [animValue] = useState(new Animated.Value(1))
  const [historyModal, setHistoryModal] = useState(false)
  const [explanationModal, setExplanationModal] = useState(false)

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic))
      setSelectedTopics(selectedTopics.filter((t) => t !== topic))
    else setSelectedTopics([...selectedTopics, topic])
  }

  const showPopup = (msg: string) => {
  setPopupMessage(msg);
  setPopupVisible(true);
};

  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.timing(drawerAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setDrawerOpen(false))
    } else {
      setDrawerOpen(true)
      Animated.timing(drawerAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    }
  }

  const generateQuestion = async (similarPrompt: boolean = false) => {
    if (similarPrompt && !question) {
      showPopup('Não há questão anterior para gerar uma similar.');

      return
    }

    try {
      if (!selectedContent || selectedTopics.length === 0) {
        showPopup('Selecione um conteúdo e ao menos um tópico.');

        return
      }

      setLoading(true)
      setQuestion(null)
      setSelectedOption(null)
      setShowResult(false)
      setExplanation(null)

      const prompt = similarPrompt
        ? `
Crie uma nova questão de múltipla escolha  SIMILAR DA ANTERIOR: "${question.question}".

Regras:
- mantenha apenas o mesmo tema e o mesmo nível de dificuldade: "${difficulty}"
- não repita palavras-chave específicas do enunciado anterior
- não repita o formato das alternativas anteriores
- Escreva alternativas boas, e que fazem sentido mesmo não sendo a correta.
- ofereça somente uma alternativa correta

Responda APENAS em JSON neste formato:

{
  "question": "string",
  "option_a": "string",
  "option_b": "string",
  "option_c": "string",
  "option_d": "string",
  "correct_option": "A",
  "difficulty": "${difficulty}"
}
`
        : `
Gere uma questão de múltipla escolha totalmente original sobre os seguintes tópicos: ${selectedTopics.join(', ')}.
O conteúdo geral é: ${selectedContent}.
A dificuldade deve ser "${difficulty}".

A questão deve ser:
- diferente de qualquer questão gerada anteriormente, sempre bem diferente
- Aborde bem os topicos selecionados, saindo da mesmice.
- escrita com enunciado novo (mesmo que o tema seja igual)
- objetiva, clara e com apenas uma alternativa correta
- com enunciado de no máximo 3 linhas
- com alternativas curtas e bem distintas entre si

Responda APENAS em JSON exatamente neste formato:

{
  "question": "string",
  "option_a": "string",
  "option_b": "string",
  "option_c": "string",
  "option_d": "string",
  "correct_option": "A",
  "difficulty": "${difficulty}"
}
`;
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}` },
        body: JSON.stringify({ model: 'gpt-4.1-nano', input: prompt, temperature: 0.7 }),
      })

      const data = await response.json()
      const text = data?.output?.[0]?.content?.[0]?.text?.trim() || '{}'
      const parsed = JSON.parse(text)

      setHistory((prev) => [parsed, ...prev].slice(0, 5))
      const { error } = await supabase.from('questions').insert(parsed)
      if (error) throw error
      setQuestion(parsed)
    } catch (err: any) {
      console.error(err)
      showPopup('Erro ao gerar questão. Verifique o console.');

    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (!showResult && question) {
      setSelectedOption(option)
      setShowResult(true)

      Animated.sequence([
        Animated.timing(animValue, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()

      if (autoDifficulty) {
        if (option === question.correct_option) {
          correctStreak.current += 1
          if (correctStreak.current >= 3) {
            if (difficulty === 'fácil') setDifficulty('médio')
            else if (difficulty === 'médio') setDifficulty('difícil')
            correctStreak.current = 0
          }
        } else correctStreak.current = 0
      }
    }
  }

  const renderOption = (label: string, text: string) => {
    let backgroundColor = '#333'
    if (showResult) {
      if (label === question.correct_option) backgroundColor = '#4CAF50'
      else if (label === selectedOption) backgroundColor = '#F44336'
    } else if (selectedOption === label) backgroundColor = '#555'

    return (
      <Animated.View key={label} style={{ transform: [{ scale: animValue }] }}>
        <TouchableOpacity style={[styles.optionButton, { backgroundColor }]} onPress={() => handleOptionSelect(label)} disabled={showResult}>
          <Text style={styles.optionText}>{label}) {text}</Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const generateExplanation = async () => {
    if (!question) return
    setLoading(true)
    try {
      const prompt = `Explique de forma sucinta e sem emoji a alternativa correta desta questão: "${question.question}". Responda em texto simples.`
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}` },
        body: JSON.stringify({ model: 'gpt-4.1-nano', input: prompt, temperature: 0.7 }),
      })
      const data = await response.json()
      const text = data?.output?.[0]?.content?.[0]?.text?.trim() || ''
      setExplanation(text)
      setExplanationModal(true)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar explicação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.title}>Exercícios</Text>

          {/* Conteúdos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conteúdo</Text>
            <View style={styles.chipContainer}>
              {CONTENTS.map((content) => (
                <TouchableOpacity
                  key={content.name}
                  style={[styles.chip, selectedContent === content.name && styles.chipActive]}
                  onPress={() => { setExpandedContent(content.name); setSelectedContent(content.name); setSelectedTopics([]) }}
                >
                  <Text style={[styles.chipText, selectedContent === content.name && styles.chipTextActive]}>{content.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {expandedContent && (
              <TouchableOpacity style={styles.filterButton} onPress={toggleDrawer}>
                <Text style={styles.filterButtonText}>{selectedTopics.length > 0 ? `Tópicos: ${selectedTopics.length}` : 'Selecionar Tópicos'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dificuldade e auto-adaptação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dificuldade</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              {(['fácil', 'médio', 'difícil'] as const).map((lvl) => (
                <TouchableOpacity key={lvl} style={[styles.chip, difficulty === lvl && styles.chipActive]} onPress={() => setDifficulty(lvl)}>
                  <Text style={[styles.chipText, difficulty === lvl && styles.chipTextActive]}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.chip, autoDifficulty && styles.chipActive]} onPress={() => setAutoDifficulty(!autoDifficulty)}>
                <Text style={[styles.chipText, autoDifficulty && styles.chipTextActive]}>Auto-dificuldade</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botões principais */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
            <TouchableOpacity style={styles.button} onPress={() => generateQuestion(false)} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gerar Questão</Text>}
            </TouchableOpacity>

            {question && (
              <>
                <TouchableOpacity style={styles.button} onPress={() => generateQuestion(true)} disabled={loading}>
                  <Text style={styles.buttonText}>Questão Parecida</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={generateExplanation} disabled={loading}>
                  <Text style={styles.buttonText}>Explicação</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.button} onPress={() => setHistoryModal(true)} disabled={history.length === 0}>
              <Text style={styles.buttonText}>Últimas 5 Perguntas</Text>
            </TouchableOpacity>
          </View>

          {/* Questão */}
          {question && (
            <View style={styles.card}>
              <View style={styles.tagContainer}>
                <View style={[styles.tag, { backgroundColor: '#2196F3' }]}><Text style={styles.tagText}>{selectedContent}</Text></View>
                <View style={[styles.tag, { backgroundColor: '#4CAF50' }]}><Text style={styles.tagText}>{difficulty}</Text></View>
              </View>
              <Text style={styles.qText}>{question.question}</Text>
              {renderOption('A', question.option_a)}
              {renderOption('B', question.option_b)}
              {renderOption('C', question.option_c)}
              {renderOption('D', question.option_d)}
              {showResult && (
                <Text style={styles.resultText}>{selectedOption === question.correct_option ? ' Acertou!' : ` Errou! A correta é ${question.correct_option}`}</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Modal Histórico */}
        <Modal visible={historyModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setHistoryModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.historyModal}>
                <Text style={styles.modalTitle}>Últimas 5 Perguntas</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {history.map((h, i) => (
                    <View key={i} style={styles.historyCard}>
                      <Text style={{ color: '#fff' }}>{h.question}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal Explicação */}
        <Modal visible={explanationModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setExplanationModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.explanationModal}>
                <Text style={styles.modalTitle}> Explicação</Text>
                <ScrollView>
                  <Text style={{ color: '#fff' }}>{explanation}</Text>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Drawer flutuante */}
        {drawerOpen && (
          <TouchableWithoutFeedback onPress={toggleDrawer}>
            <View style={styles.drawerOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[styles.drawer, { transform: [{ translateY: drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }], opacity: drawerAnim }]}
                >
                  <Text style={styles.drawerTitle}>Tópicos</Text>
                  <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                    {CONTENTS.find(c => c.name === expandedContent)?.topics.map(topic => (
                      <TouchableOpacity
                        key={topic}
                        style={[styles.chipSmall, selectedTopics.includes(topic) && styles.chipSmallActive]}
                        onPress={() => toggleTopic(topic)}
                      >
                        <Text style={[styles.chipSmallText, selectedTopics.includes(topic) && styles.chipSmallTextActive]}>{topic}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.selectedFilters}>
                    {selectedTopics.map(topic => (
                      <View key={topic} style={styles.filterChip}>
                        <Text style={styles.filterText}>{topic}</Text>
                        <TouchableOpacity onPress={() => toggleTopic(topic)}><Text style={styles.filterRemove}>✕</Text></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}
        <Popup
  visible={popupVisible}
  message={popupMessage}
  onClose={() => setPopupVisible(false)}
/>

      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 90
  },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  section: {
    backgroundColor: 'rgba(59, 60, 89, 0.8)', // Mais transparente para combinar com o gradiente
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4C4D70'
  },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#fff', marginBottom: 6 },
  chip: { backgroundColor: '#4A4C70', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, margin: 4 },
  chipActive: { backgroundColor: '#00AEEF' },
  chipText: { color: '#fff', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  chipSmall: { backgroundColor: '#4A4C70', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, margin: 6 },
  chipSmallActive: { backgroundColor: '#00AEEF' },
  chipSmallText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  chipSmallTextActive: { color: '#000', fontWeight: 'bold' },
  filterButton: { backgroundColor: '#00AEEF', padding: 10, borderRadius: 12, alignSelf: 'flex-start', marginTop: 10 },
  filterButtonText: { color: '#fff', fontWeight: 'bold' },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'center', zIndex: 999 },
  drawer: { width: '90%', backgroundColor: '#3B3C59', borderRadius: 15, padding: 12, marginTop: 60, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 10 },
  drawerTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  selectedFilters: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00AEEF', borderRadius: 15, paddingVertical: 4, paddingHorizontal: 8, margin: 3 },
  filterText: { color: '#000', marginRight: 4, fontWeight: 'bold', fontSize: 12 },
  filterRemove: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  button: {
    backgroundColor: '#00AEEF',
    padding: 12,
    borderRadius: 15,
    minWidth: '22%',
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(31, 33, 51, 0.9)', // Mais transparente para combinar com o gradiente
    padding: 15,
    borderRadius: 15,
    marginBottom: 15
  },
  qText: { color: '#fff', fontSize: 16, marginBottom: 15 },
  optionButton: { padding: 12, borderRadius: 12, marginVertical: 5 },
  optionText: { color: '#fff', fontSize: 15 },
  tagContainer: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  tag: { borderRadius: 15, paddingHorizontal: 10, paddingVertical: 3, marginRight: 5, marginBottom: 5 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  resultText: { marginTop: 15, fontSize: 16, fontWeight: 'bold', color: '#fff' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  historyModal: {
    width: '85%',
    backgroundColor: '#30345a',
    borderRadius: 15,
    padding: 20
  },
  explanationModal: {
    width: '35%',
    backgroundColor: '#242948',
    borderRadius: 15,
    padding: 20,
    maxHeight: '60%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
})
