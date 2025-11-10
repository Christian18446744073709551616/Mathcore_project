// LessonScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../types';

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

// MathBasic Lessons
import AdicaoSubtracaoData from '../Vsauces/MathBasicCont/AdicaoSubtracao.json';
import ExpressoesNumericasData from '../Vsauces/MathBasicCont/ExpressoesNumericas.json';
import FracoesData from '../Vsauces/MathBasicCont/Fracoes.json';
import MdcData from '../Vsauces/MathBasicCont/Mdc.json';
import MmcData from '../Vsauces/MathBasicCont/Mmc.json';
import MultiplicacaoDivisaoData from '../Vsauces/MathBasicCont/MultiplicacaoDivisao.json';
import SistemaNumeracaoDecimalData from '../Vsauces/MathBasicCont/SistemaNumeracaoDecimal.json';
import SistemaMetricoDecimalData from '../Vsauces/MathBasicCont/SistemaMetricoDecimal.json';

// MathFinc Lessons
import ArvoreProbabilidadeData from '../Vsauces/MathFincCont/ArvoreProbabilidade.json';
import CalculosProbabilidadeData from '../Vsauces/MathFincCont/CalculosProbabilidade.json';
import ConceitosBasicosProbabilidadeData from '../Vsauces/MathFincCont/ConceitosBasicosProbabilidade.json';
import GraficoBarrasData from '../Vsauces/MathFincCont/GraficoBarras.json';
import GraficoSetoresData from '../Vsauces/MathFincCont/GraficoSetores.json';
import MediaModaMedianaData from '../Vsauces/MathFincCont/MediaModaMediana.json';
import NocoesBasicasData from '../Vsauces/MathFincCont/NocoesBasicas.json';

// Algebra Lessons
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
  Quadrados: quadradosData,
  Triângulos: triangulosData,
  Retângulos: retangulosData,
  Trapézios: trapeziosData,
  Paralelogramos: paralelogramosData,
  Hexágonos: hexagonosData,
  Polígonos: poligonosData,
  Ângulos: angulosData,
  Losangos: losangosData,
  'Adição e Subtração': AdicaoSubtracaoData,
  'Expressões Numéricas': ExpressoesNumericasData,
  Frações: FracoesData,
  MDC: MdcData,
  MMC: MmcData,
  'Multiplicação e Divisão': MultiplicacaoDivisaoData,
  'Sistema de Numeração Decimal': SistemaNumeracaoDecimalData,
  'Sistema Métrico Decimal': SistemaMetricoDecimalData,
  'Árvore de Probabilidades': ArvoreProbabilidadeData,
  'Cálculos de Probabilidade': CalculosProbabilidadeData,
  'Conceitos Básicos de Probabilidade': ConceitosBasicosProbabilidadeData,
  'Gráfico de Barras': GraficoBarrasData,
  'Gráfico de Setores': GraficoSetoresData,
  'Média, Moda e Mediana': MediaModaMedianaData,
  'Noções Básicas': NocoesBasicasData,
  'Noções da função': NocoesFuncaoData,
  'Introdução da Função Afim': IntroducaoFuncaoAfimData,
};

// --- Mapa de imagens ---
const imageMap: { [key: string]: any } = {
  'ExemploQuadrado.jpg': require('../assets/Lesson_Example/Geometry/ExemploQuadrado.jpg'),
  'ExemploTriangulo.jpg': require('../assets/Lesson_Example/Geometry/ExemploTriangulo.jpg'),
  'ExemploRetangulo.jpg': require('../assets/Lesson_Example/Geometry/ExemploRetangulo.jpg'),
  'ExemploLosango.jpg': require('../assets/Lesson_Example/Geometry/ExemploLosango.jpg'),
  'ExemploTrapezio.jpg': require('../assets/Lesson_Example/Geometry/ExemploTrapezio.jpg'),
  'ExemploParalelogramo.jpg': require('../assets/Lesson_Example/Geometry/ExemploParalelogramo.jpg'),
  'ExemploHexagono.jpg': require('../assets/Lesson_Example/Geometry/ExemploHexagono.jpg'),
  'ExemploAngulo.jpg': require('../assets/Lesson_Example/Geometry/ExemploAngulo.jpg'),
  'ExemploPoligono.jpg': require('../assets/Lesson_Example/Geometry/ExemploPoligono.jpg'),
  'ExemploAdicaoSubtracao.jpg': require('../assets/Lesson_Example/MathBasic/ExemploAdicaoSubtracao.jpg'),
  'ExemploExpressoesNumericas.jpg': require('../assets/Lesson_Example/MathBasic/ExemploExpressoesNumericas.jpg'),
  'ExemploFracoes.jpg': require('../assets/Lesson_Example/MathBasic/ExemploFracoes.jpg'),
  'ExemploMMC.jpg': require('../assets/Lesson_Example/MathBasic/ExemploMMC.jpg'),
  'ExemploMDC.jpg': require('../assets/Lesson_Example/MathBasic/ExemploMDC.jpg'),
  'ExemploMultiplicacaoDivisao.jpg': require('../assets/Lesson_Example/MathBasic/ExemploMultiplicacaoDivisao.jpg'),
  'ExemploSistemaNumeracaoDecimal.jpg': require('../assets/Lesson_Example/MathBasic/ExemploSistemaNumeracaoDecimal.jpg'),
  'ExemploSistemMetricoDecimal.jpg': require('../assets/Lesson_Example/MathBasic/ExemploSistemaMetricoDecimal.jpg'),
  'ExemploArvoreProbabilidade.jpg': require('../assets/Lesson_Example/MathFinc/ExemploArvoreProbabilidades.jpg'),
  'ExemploCalculoProbabilidades.jpg': require('../assets/Lesson_Example/MathFinc/ExemploCalculoProbabilidades.jpg'),
  'ExemploConceitosBasicosProbabilidade.jpg': require('../assets/Lesson_Example/MathFinc/ExemploConceitosBasicosProbabilidade.jpg'),
  'ExemploGraficoBarra.jpg': require('../assets/Lesson_Example/MathFinc/ExemploGraficoBarra.jpg'),
  'ExemploGraficoSetores.jpg': require('../assets/Lesson_Example/MathFinc/ExemploGraficoSetores.jpg'),
  'ExemploMediaModaMediana.jpg': require('../assets/Lesson_Example/MathFinc/ExemploMediaModaMediana.jpg'),
  'ExemploNocoesBasicas.jpg': require('../assets/Lesson_Example/MathFinc/ExemploNocoesBasicas.jpg'),
  'ExemploNocoesFuncao.jpg': require('../assets/Lesson_Example/Algebra/ExemploNocoesFuncao.jpg'),
  'ExemploIntroducaoFuncaoAfim.jpg': require('../assets/Lesson_Example/Algebra/ExemploIntroducaoFuncaoAfim.jpg'),
};

// --- Subcomponentes ---
const Fundamentals = ({ text, fontSize }: { text: string; fontSize: number }) => (
  <View style={styles.sectionBox}>
    <Text style={[styles.subTitle, { fontSize: fontSize * 1.2 }]}>Conceito</Text>
    <Text style={[styles.textContent, { fontSize }]}>{text}</Text>
  </View>
);

const EquationsAndFormulas = ({
  formulas,
  fontSize,
}: {
  formulas: { name: string; formula: string }[];
  fontSize: number;
}) => (
  <View style={styles.sectionBox}>
    <Text style={[styles.subTitle, { fontSize: fontSize * 1.2 }]}>Equações e Fórmulas</Text>
    {formulas.map((item, i) => (
      <View key={i} style={{ marginBottom: 8 }}>
        <Text style={[styles.formulaName, { fontSize: fontSize * 1.1 }]}>{item.name}</Text>
        <Text style={[styles.textContent, { fontSize }]}>{item.formula}</Text>
      </View>
    ))}
  </View>
);

// --- Componente principal ---
const LessonScreen: React.FC<LessonScreenProps> = ({ route }) => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<LessonScreenNavigationProp>();
  const { lessonTitle } = route.params;
  const lessonData = lessonDataMap[lessonTitle];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [session, setSession] = useState<any | null>(null);

  const exampleFileName = lessonData?.formulas?.[0]?.teste;
  const exampleImage = exampleFileName ? imageMap[exampleFileName] : null;
  const fontSize = width < 380 ? 15 : width < 600 ? 17 : 19;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) setSession(data.session);
    };
    getSession();
  }, []);

  useEffect(() => {
    const markLessonViewed = async () => {
      if (session?.user) {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: session.user.id,
            lesson_title: lessonTitle,
          });
        if (error) console.log('Error marking lesson viewed:', error);
      }
    };
    if (lessonData) markLessonViewed();
  }, [session, lessonTitle, lessonData]);

  if (!lessonData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#03f0fc" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Conteúdo não encontrado</Text>
      </View>
    );
  }

  const imageHeight = Math.min(height * 0.7, 700);

  return (
    <ScrollView style={styles.scrollScreen} showsVerticalScrollIndicator={false}>
      <LinearGradient
       colors={['#242948', '#5C6494']}
          locations={[0.65, 0.30]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.85, y: 0.4 }}
          style={{ flex: 1, padding: 20 }}
      >
        <View style={{ paddingBottom: height * 0.05 }}>
        <TouchableOpacity style={[styles.returnButton, { left: width * 0.9, top: height * 0.02 }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle-outline" size={width * 0.03} color="#ffffffff" />
        </TouchableOpacity>

        <View style={{ paddingBottom: height * 0.05 }}>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <View style={[styles.lessonBox, { paddingVertical: height * 0.02, paddingHorizontal: width * 0.08 }]}>
              <Text style={[styles.title, { fontSize: fontSize * 2 }]}>{lessonTitle}</Text>
            </View>

            <Fundamentals text={lessonData.fundamentals} fontSize={fontSize} />
            <EquationsAndFormulas formulas={lessonData.formulas} fontSize={fontSize} />

            {exampleImage && (
              <View style={[styles.imageContainer, { padding: width * 0.02 }]}>
                <Image source={exampleImage} resizeMode="contain" style={[styles.lessonImage, { height: imageHeight }]} />
              </View>
            )}
          </Animated.View>
        </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 80,
  },
  scrollScreen: {
    flex: 1,
    backgroundColor: '#242948',
  },
  sectionBox: {
    backgroundColor: '#3B3C59',
    width: '95%',
    alignSelf: 'center',
    marginVertical: 10,
    padding: 16,
    borderRadius: 25,
  },
  subTitle: {
    fontWeight: 'bold',
    color: '#03f0fc',
    marginBottom: 8,
    textAlign: 'center',
  },
  textContent: {
    color: '#e0e0e0',
    textAlign: 'justify',
  },
  formulaName: {
    color: '#f0a500',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonBox: {
    backgroundColor: '#BDC4EE',
    borderRadius: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  title: {
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  returnButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 5,
  },
  imageContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#fff1',
  },
  lessonImage: {
    width: '100%',
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242948',
  },
});

export default LessonScreen;
