// ...existing code...
import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Geometry lesson
import quadradosData from '../Vsauces/GeometryCont/quadrados.json';
import triangulosData from '../Vsauces/GeometryCont/triangulos.json';
import retangulosData from '../Vsauces/GeometryCont/retangulos.json';
import losangosData from '../Vsauces/GeometryCont/losangos.json';
import trapeziosData from '../Vsauces/GeometryCont/trapezios.json';
import paralelogramosData from '../Vsauces/GeometryCont/paralelogramos.json';
import hexagonosData from '../Vsauces/GeometryCont/hexagonos.json';
import poligonosData from '../Vsauces/GeometryCont/poligonos.json';

import angulosData from '../Vsauces/GeometryCont/angulos.json';




// MathBasic LessonS
import AdicaoSubtracaoData from '../Vsauces/MathBasicCont/AdicaoSubtracao.json';
import ExpressoesNumericasData from '../Vsauces/MathBasicCont/ExpressoesNumericas.json';
import FracoesData from '../Vsauces/MathBasicCont/Fracoes.json';
import MmcMdcData from '../Vsauces/MathBasicCont/MmcMdc.json';
import MultiplicacaoDivisaoData from '../Vsauces/MathBasicCont/MultiplicacaoDivisao.json';
import SistemaNumeracaoDecimalData from '../Vsauces/MathBasicCont/SistemaNumeracaoDecimal.json';
import SistemaMetricoDecimalData from '../Vsauces/MathBasicCont/SistemaMetricoDecimal.json';

// MathFinc Lessons
import ArvoreProbabilidadeData from '../Vsauces/MathFincCont/ArvoreProbabilidade.json';
import CalculosProbabilidadeData from '../Vsauces/MathFincCont/CalculosProbabilidade.json';
import ConceitosBasicosProbabilidadeData from '../Vsauces/MathFincCont/ConceitosBasicosProbabilidade.json';
import GraficoBarrasData from '../Vsauces/MathFincCont/GraficoBarras.json';
import GraficoSetoresData from '../Vsauces/MathFincCont/GraficoSetores.json';
import MediaModasMedianasData from '../Vsauces/MathFincCont/MediaModasMedianas.json';
import NocoesBasicasData from '../Vsauces/MathFincCont/NocoesBasicas.json';

//Algebra Lessons
import IntroducaoFuncaoAfimData from '../Vsauces/algebraCont/IntroducaoFuncaoAfim.json';
import NocoesFuncaoData from '../Vsauces/algebraCont/NocaoFuncao.json';

// --- Tipagens ---
type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
type LessonScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lesson'>;

type LessonScreenProps = {
  route: LessonScreenRouteProp;
};

type LessonData = {
  fundamentals: string;
  formulas: { name: string; formula: string; teste?: string }[];
  theoreticalEvaluation?: string;
  examples?: { question: string; solution: string }[];
  practicalChallenge?: string;
};

// --- Mapeamento dos dados ---
const lessonDataMap: { [key: string]: any } = {

  // Geometry
  Quadrados: quadradosData,
  Triângulos: triangulosData,
 Retângulos: retangulosData,
 Trapézios: trapeziosData,
 Paralelogramos: paralelogramosData,
  
Hexágonos: hexagonosData,
  
 Polígonos: poligonosData,
  
 Ângulos: angulosData,
 Losangos: losangosData,


  // MathBasic
  'Adição e Subtração': AdicaoSubtracaoData,
  'Expressões Numéricas': ExpressoesNumericasData,
  Frações: FracoesData,
  'MMC e MDC': MmcMdcData,
  'Multiplicação e Divisão': MultiplicacaoDivisaoData,
  'Sistema de Numeração Decimal': SistemaNumeracaoDecimalData,
  'Sistema Métrico Decimal': SistemaMetricoDecimalData,

  // MathFinc
  'Árvore de Probabilidade': ArvoreProbabilidadeData,
  'Cálculos de Probabilidade': CalculosProbabilidadeData,
  'Conceitos Básicos de Probabilidade': ConceitosBasicosProbabilidadeData,
  'Gráfico de Barras': GraficoBarrasData,
  'Gráfico de Setores': GraficoSetoresData,
  'Média, Moda e Mediana': MediaModasMedianasData,
  'Noções Básicas': NocoesBasicasData,

  // Algebra
  'Noções da função': NocoesFuncaoData,
  'Introdução da Função Afim': IntroducaoFuncaoAfimData,

  
};

// --- Mapa de imagens (require estático) ---
const imageMap: { [key: string]: any } = {
  // Geometry examples
  'ExemploQuadrado.jpg': require('../assets/Lesson_Example/Geometry/ExemploQuadrado.jpg'),
  'ExemploTriangulo.jpg': require('../assets/Lesson_Example/Geometry/ExemploTriangulo.jpg'),
  'ExemploRetangulo.jpg': require('../assets/Lesson_Example/Geometry/ExemploRetangulo.jpg'),
  'ExemploLosango.jpg': require('../assets/Lesson_Example/Geometry/ExemploLosango.jpg'),
  'ExemploTrapezio.jpg': require('../assets/Lesson_Example/Geometry/ExemploTrapezio.jpg'),
  'ExemploParalelogramo.jpg': require('../assets/Lesson_Example/Geometry/ExemploParalelogramo.jpg'),
  'ExemploHexagono.jpg': require('../assets/Lesson_Example/Geometry/ExemploHexagono.jpg'),
  'ExemploAngulo.jpg': require('../assets/Lesson_Example/Geometry/ExemploAngulo.jpg'),
  'ExemploPoligono.jpg': require('../assets/Lesson_Example/Geometry/ExemploPoligono.jpg'),

  // MathBasic examples
  'ExemploAdicaoSubtracao.jpg': require('../assets/Lesson_Example/MathBasic/ExemploAdicaoSubtracao.jpg'),
  'ExemploExpressoesNumericas.jpg': require('../assets/Lesson_Example/MathBasic/ExemploExpressoesNumericas.jpg'),
  'ExemploFracoes.jpg': require('../assets/Lesson_Example/MathBasic/ExemploFracoes.jpg'),
  'ExemploMMC.jpg': require('../assets/Lesson_Example/MathBasic/ExemploMMC.jpg'),
  'ExemploMultiplicacaoDivisao.jpg': require('../assets/Lesson_Example/MathBasic/ExemploMultiplicacaoDivisao.jpg'),
  'ExemploSistemaNumeracaoDecimal.jpg': require('../assets/Lesson_Example/MathBasic/ExemploSistemaNumeracaoDecimal.jpg'),
  'ExemploSistemaMetricoDecimal.jpg': require('../assets/Lesson_Example/MathBasic/ExemploSistemaMetricoDecimal.jpg'),

  // MathFinc examples
  'ExemploArvoreProbabilidade.jpg': require('../assets/Lesson_Example/MathFinc/ExemploArvoreProbabilidades.jpg'),
  'ExemploCalculosProbabilidade.jpg': require('../assets/Lesson_Example/MathFinc/ExemploCalculoProbabilidades.jpg'),
 'ExemploConceitosBasicosProbabilidade.jpg': require('../assets/Lesson_Example/MathFinc/ExemploConceitosBasicosProbabilidade.jpg'),
  'ExemploGraficoBarras.jpg': require('../assets/Lesson_Example/MathFinc/ExemploGraficoBarra.jpg'),
  'ExemploGraficoSetores.jpg': require('../assets/Lesson_Example/MathFinc/ExemploGraficoSetores.jpg'),
  'ExemploMediaModasMedianas.jpg': require('../assets/Lesson_Example/MathFinc/ExemploMediaModaMediana.jpg'),
  'ExemploNocoesBasicas.jpg': require('../assets/Lesson_Example/MathFinc/ExemploNocoesBasicas.jpg'),

  // Algebra examples
   'ExemploNocoesFuncao.jpg': require('../assets/Lesson_Example/Algebra/ExemploNocoesFuncao.jpg'),
  'ExemploIntroducaoFuncaoAfim.jpg': require('../assets/Lesson_Example/Algebra/ExemploIntroducaoFuncaoAfim.jpg'),
  // adicione aqui outras imagens mapeadas: 'NomeNoJSON.ext': require('caminho/para/arquivo')
};

// --- Componentes filhos ---
const Fundamentals = ({ lessonData }: { lessonData: LessonData }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Conceito</Text>
    <Text style={styles.textContent}>{lessonData.fundamentals}</Text>
  </ScrollView>
);

const EquationsAndFormulas = ({ lessonData }: { lessonData: LessonData }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Equações e Fórmulas</Text>
    {lessonData.formulas.map((item, index) => (
      <View key={index} style={styles.formulaItem}>
        <Text style={styles.formulaName}>{item.name}:</Text>
        <Text style={styles.formulaContent}>{item.formula}</Text>
      </View>
    ))}
  </ScrollView>
);

const TheoreticalEvaluation = ({ lessonData }: { lessonData: LessonData }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Avaliação Teórica</Text>
    <Text style={styles.textContent}>{lessonData.theoreticalEvaluation}</Text>
  </ScrollView>
);

const Applications = ({ lessonData }: { lessonData: LessonData }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Aplicações Práticas</Text>
    {lessonData.examples?.map((example, index) => (
      <View key={index} style={styles.exampleItem}>
        <Text style={styles.exampleQuestion}>{example.question}</Text>
        <Text style={styles.exampleSolution}>{example.solution}</Text>
      </View>
    ))}
  </ScrollView>
);

const PracticalChallenge = ({ lessonData }: { lessonData: LessonData }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Desafio Prático</Text>
    <Text style={styles.textContent}>{lessonData.practicalChallenge}</Text>
  </ScrollView>
);

// --- Componente principal ---
const LessonScreen: React.FC<LessonScreenProps> = ({ route }) => {
  const navigation = useNavigation<LessonScreenNavigationProp>();
  const { lessonTitle } = route.params;
  const lessonData: LessonData | undefined = lessonDataMap[lessonTitle];

  const [session, setSession] = useState<any | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxProgressIndex, setMaxProgressIndex] = useState(0);

  const tabs = [
    'Fundamentos',
    'Equações e Fórmulas',
    'Avaliação Teórica',
    'Aplicações Práticas',
    'Desafio Prático',
  ];
  const colorStages = ['#03f0fc', '#00adb5', '#f0a500', '#f08a00', '#f04500'];

  // calcula imagem de exemplo com segurança (pega o campo "teste" do primeiro item de formulas)
  const exampleFileName = lessonData?.formulas?.[0]?.teste;
  const exampleImage = exampleFileName ? imageMap[exampleFileName] : null; // pode ser undefined

  // --- Carrega sessão ---
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Erro ao obter sessão:', error);
      else setSession(session);
    };
    fetchSession();
  }, []);

  // --- Carrega progresso ---
  const loadProgress = async () => {
    if (!session?.user) return;
    try {
      const { data: userProgress, error } = await supabase
        .from('user_progress')
        .select('current_index, max_index')
        .eq('user_id', session.user.id)
        .eq('lesson_title', lessonTitle)
        .single();

      if (error) console.error('Erro ao carregar progresso:', error);
      else if (userProgress) {
        setCurrentIndex(userProgress.current_index);
        setMaxProgressIndex(userProgress.max_index);
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    }
  };

  useEffect(() => {
    if (session?.user) loadProgress();
  }, [session]);

  // --- Atualiza progresso ---
  const saveProgressToDatabase = async (index: number, newMaxIndex: number) => {
    if (!session?.user) return;
    try {
      const progressPercentage = ((newMaxIndex + 1) / tabs.length) * 100;

      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('lesson_title', lessonTitle)
        .single();

      if (fetchError) console.error('Erro ao buscar progresso existente:', fetchError.message);
      else if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            current_index: index,
            max_index: newMaxIndex,
            progress_percentage: progressPercentage,
            completed: index === tabs.length - 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: session.user.id,
            lesson_title: lessonTitle,
            current_index: index,
            max_index: newMaxIndex,
            progress_percentage: progressPercentage,
            completed: index === tabs.length - 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const updateProgress = async (newIndex: number) => {
    const newMaxIndex = Math.max(newIndex, maxProgressIndex);
    setCurrentIndex(newIndex);
    setMaxProgressIndex(newMaxIndex);
    await saveProgressToDatabase(newIndex, newMaxIndex);
  };

  // Proteção caso não exista dados para a lição
  if (!lessonData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#03f0fc" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Conteúdo não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.ScrollScreen}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#242948', '#5C6494']}
          locations={[0.65, 0.30]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.85, y: 0.4 }}
          style={{ flex: 1, padding: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20 }}>
            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-circle-outline" size={80} color="black" style={{ fontWeight: 'bold' }} />
            </TouchableOpacity>
          </View>

          <View style={styles.SobreBox}>
            <View style={[{ width: '100%' }]}>
              <TouchableOpacity
                style={styles.ModePratic}
                onPress={() =>
                  navigation.push('GameScreen', {
                    lobbyId: 'default',
                    lessonTitle: lessonTitle,
                    session: session,
                  })
                }
              >
                <Text style={styles.title}>{lessonTitle}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.SobreBox}>
              

            


            
            <View style={[{ width: '100%' }]}>
              {/* Renderiza a imagem do JSON (se existir mapeamento) */}
              {exampleImage ? (
                <View style={styles.imageContainer}>
                <Image  source={exampleImage} style={styles.lessonImage}  />
                </View>
                
              ) : (
                <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#000' }}>Imagem de exemplo não disponível</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
  height: 250,
  width: '100%',
  alignSelf: 'center',
  borderRadius: 20,
  marginVertical: 10,
  backgroundColor: 'transparent',
},

lessonImage: {
  width: '50%', // ← OCUPA A LARGURA TOTAL DO CONTÊINER
  height: '100%', // ← ALTURA AUTOMÁTICA PARA MANTER A PROPORÇÃO
  maxHeight: 250, // ← CONTROLA O TAMANHO DA IMAGEM
  aspectRatio: 0.1, // ← MANTÉM A PROPORÇÃO DA IMAGEM
  borderRadius: 20,
  alignSelf: 'center',
},


  logo: {
    width: 200,
    height: 200,
  },

  returnButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ScrollScreen: {},
 SobreBox: {
  width: '40%',
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
  padding: 16,
  borderRadius: 30,
  backgroundColor: '#707DCB',
},
  ModePratic: {
    width: '100%',
    backgroundColor: '#BDC4EE',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  Conteudo: {
    alignSelf: 'center',
    marginBottom: 20,
    width: '50%',
    borderRadius: 30,
    borderColor: '#000000',
    borderWidth: 2,
    padding: 10,
    backgroundColor: '#D9D9D9',
  },
  title: { fontSize: 45, fontWeight: 'bold', color: '#000000ff', textAlign: 'center', marginBottom: 16 },
  card: {
    justifyContent: 'space-between',
    backgroundColor: '#BDC4EE',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 60,
  },
  tabContent: {},
  subTitle: { fontSize: 30, fontWeight: 'bold', color: '#000000ff', marginBottom: 8, textAlign: 'center' },
  textContent: { color: '#000000ff', fontSize: 20 },
  formulaItem: { marginBottom: 8 },
  formulaName: { fontWeight: 'bold', color: '#000000ff' },
  formulaContent: { color: '#000000ff' },
  exampleItem: { marginBottom: 8 },
  exampleQuestion: { fontWeight: 'bold', color: '#000000ff' },
  exampleSolution: { fontStyle: 'italic', color: '#e0e0e0' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242948',
  },
});

export default LessonScreen;