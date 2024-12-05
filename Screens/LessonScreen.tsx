import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
// Importação dos arquivos JSON para os 17 tópicos
import quadradosData from '../Vsauces/quadrados.json';
import triangulosData from '../Vsauces/triangulos.json';
import retangulosData from '../Vsauces/retangulos.json';
import losangosData from '../Vsauces/losangos.json';
import trapeziosData from '../Vsauces/trapezios.json';
import paralelogramosData from '../Vsauces/paralelogramos.json';
import pentagonosData from '../Vsauces/pentagonos.json';
import hexagonosData from '../Vsauces/hexagonos.json';
import heptagonosData from '../Vsauces/heptagonos.json';
import octagonosData from '../Vsauces/octagonos.json';
import poligonosData from '../Vsauces/poligonos.json';
import teoremaDeTalesData from '../Vsauces/teoremaDeTales.json';
import angulosData from '../Vsauces/angulos.json';
import congruenciaESemelhancaDeFigurasData from '../Vsauces/congruenciaESemelhancaDeFiguras.json';
import circulosData from '../Vsauces/circulos.json';
import transformacoesGeometricasData from '../Vsauces/transformacoesGeometricas.json';
import figurasEConstrucoesGeometricasData from '../Vsauces/figurasEConstrucoesGeometricas.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
type LessonScreenProps = {
  route: LessonScreenRouteProp;
  session: any;
};

// Mapeamento dos dados das lições
const lessonDataMap: { [key: string]: any } = {
  Quadrados: quadradosData,
  Triângulos: triangulosData,
  Retângulos: retangulosData,
  Losangos: losangosData,
  Trapézios: trapeziosData,
  Paralelogramos: paralelogramosData,
  Pentágonos: pentagonosData,
  Hexágonos: hexagonosData,
  Heptágonos: heptagonosData,
  Octágonos: octagonosData,
  Polígonos: poligonosData,
  'Teorema de Tales': teoremaDeTalesData,
  Ângulos: angulosData,
  'Congruência e Semelhança de Figuras': congruenciaESemelhancaDeFigurasData,
  Círculos: circulosData,
  'Transformações Geométricas': transformacoesGeometricasData,
  'Figuras e Construções Geométricas': figurasEConstrucoesGeometricasData,
};

// Componentes para cada parte do conteúdo
const Fundamentals = ({ lessonData }: { lessonData: any }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Fundamentos sobre o Tema</Text>
    <Text style={styles.textContent}>{lessonData.fundamentals}</Text>
  </ScrollView>
);

const EquationsAndFormulas = ({ lessonData }: { lessonData: any }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Equações e Fórmulas</Text>
    {lessonData.formulas.map((item: { name: string; formula: string }, index: number) => (
      <View key={index} style={styles.formulaItem}>
        <Text style={styles.formulaName}>{item.name}:</Text>
        <Text style={styles.formulaContent}>{item.formula}</Text>
      </View>
    ))}
  </ScrollView>
);

const TheoreticalEvaluation = ({ lessonData }: { lessonData: any }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Avaliação Teórica</Text>
    <Text style={styles.textContent}>{lessonData.theoreticalEvaluation}</Text>
  </ScrollView>
);

const Applications = ({ lessonData }: { lessonData: any }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Aplicações Práticas</Text>
    {lessonData.examples.map((example: { question: string; solution: string }, index: number) => (
      <View key={index} style={styles.exampleItem}>
        <Text style={styles.exampleQuestion}>{example.question}</Text>
        <Text style={styles.exampleSolution}>{example.solution}</Text>
      </View>
    ))}
  </ScrollView>
);

const PracticalChallenge = ({ lessonData }: { lessonData: any }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Desafio Prático</Text>
    <Text style={styles.textContent}>{lessonData.practicalChallenge}</Text>
  </ScrollView>
);

const LessonScreen: React.FC<LessonScreenProps> = ({ route, }) => {
  const { lessonTitle } = route.params;
  const lessonData = lessonDataMap[lessonTitle] || {};
  const [session, setSession] = useState<any | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxProgressIndex, setMaxProgressIndex] = useState(0);
 
  useEffect(() => {
    // Obtém a sessão do usuário ao carregar o componente
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao obter sessão:', error);
      } else {
        setSession(session);
      }
    };

    fetchSession();
  }, []);
  const tabs = ['Fundamentos', 'Equações e Fórmulas', 'Avaliação Teórica', 'Aplicações Práticas', 'Desafio Prático'];
  const colorStages = ['#03f0fc', '#00adb5', '#f0a500', '#f08a00', '#f04500'];

  const loadProgress = async () => {
    if (!session?.user) return;

    try {
      const { data: userProgress, error } = await supabase
        .from('user_progress')
        .select('current_index, max_index')
        .eq('user_id', session.user.id)
        .eq('lesson_title', lessonTitle)
        .single();

      if (error) {
        console.error('Erro ao carregar progresso:', error);
        return;
      }

      if (userProgress) {
        setCurrentIndex(userProgress.current_index);
        setMaxProgressIndex(userProgress.max_index);
      } else {
        setCurrentIndex(0);
        setMaxProgressIndex(0);
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
    }
  };

  // Atualiza o progresso no banco de dados
  const saveProgressToDatabase = async (index: number, newMaxIndex: number) => {
    if (!session?.user) return;

    try {
      const progressPercentage = (newMaxIndex + 1) * 20;

      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('lesson_title', lessonTitle)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar progresso existente:', fetchError.message);
        return;
      }

      if (existingProgress) {
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

  // Atualiza progresso
  const updateProgress = async (newIndex: number) => {
    const newMaxIndex = Math.max(newIndex, maxProgressIndex);
    setCurrentIndex(newIndex);
    setMaxProgressIndex(newMaxIndex);
    await saveProgressToDatabase(newIndex, newMaxIndex);
  };

  useEffect(() => {
    if (session?.user) {
      loadProgress();
    }
  }, [session]);

  // Manipulação de tabs
  const handleNextTab = () => {
    if (currentIndex < tabs.length - 1) {
      updateProgress(currentIndex + 1);
    }
  };

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      updateProgress(currentIndex - 1);
    }
  };

  
  const renderContent = () => {
    switch (currentIndex) {
      case 0: return <Fundamentals lessonData={lessonData} />;
      case 1: return <EquationsAndFormulas lessonData={lessonData} />;
      case 2: return <TheoreticalEvaluation lessonData={lessonData} />;
      case 3: return <Applications lessonData={lessonData} />;
      case 4: return <PracticalChallenge lessonData={lessonData} />;
      default: return <Fundamentals lessonData={lessonData} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lessonTitle}</Text>
      <View style={styles.card}>{renderContent()}</View>
      <View style={styles.indicatorContainer}>
        <Text style={styles.tabIndicator}>{tabs[currentIndex]}</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            {
              width: `${((maxProgressIndex + 1) / tabs.length) * 100}%`,
              backgroundColor: colorStages[maxProgressIndex],
            },
          ]}
        />
      </View>
      <View style={styles.navigationButtons}>
        <Text onPress={handlePrevTab} style={[styles.button, currentIndex === 0 && styles.disabled]}>
          Anterior
        </Text>
        <Text onPress={handleNextTab} style={[styles.button, currentIndex === tabs.length - 1 && styles.disabled]}>
          Próximo
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1a2e', // Fundo azul escuro
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center', // Centraliza o título
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#162447', // Azul escuro para o card
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0f3460',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tabContent: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03f0fc', //
    marginBottom: 8,
    textAlign: 'center', // Centraliza o subtítulo
  },
  textContent: {
    color: '#e0e0e0', // Texto claro
  },
  formulaItem: {
    marginBottom: 8,
  },
  formulaName: {
    fontWeight: 'bold',
    color: '#03f0fc', // 
  },
  formulaContent: {
    fontStyle: 'italic',
    color: '#e0e0e0', // Texto claro
  },
  exampleItem: {
    marginBottom: 8,
  },
  exampleQuestion: {
    fontWeight: 'bold',
    color: '##03f0fc', //
  },
  exampleSolution: {
    fontStyle: 'italic',
    color: '#e0e0e0', // Texto claro
  },
  indicatorContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tabIndicator: {
    fontSize: 16,
    color: '#f0f0f0', // Cor clara para o indicador
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    color: '#00adb5', // Tom neon azul para os botões
    fontSize: 16,
    fontWeight: 'bold',
  },  
  disabled: {
    opacity: 0.5, // Estilo desativado
  },
  progressBar: {
    height: 10,
    backgroundColor: '#cccccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progress: {
    height: '100%',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LessonScreen;
