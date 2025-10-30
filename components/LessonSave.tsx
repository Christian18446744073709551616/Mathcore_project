import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

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

type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;

type LessonScreenProps = {
  route: LessonScreenRouteProp;
};

const Tab = createMaterialTopTabNavigator();

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

// Componentes das abas
const Fundamentals = ({ lessonData }: { lessonData: any }) => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.subTitle}>Fundamentos sobre o Tema</Text>
    <Text>{lessonData.fundamentals}</Text>
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
    <Text>{lessonData.theoreticalEvaluation}</Text>
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
    <Text>{lessonData.practicalChallenge}</Text>
  </ScrollView>
);

const LessonScreen: React.FC<LessonScreenProps> = ({ route }) => {
  const { lessonTitle } = route.params;
  const lessonData = lessonDataMap[lessonTitle] || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const tabs = ['Fundamentos', 'Equações e Fórmulas', 'Avaliação Teórica', 'Aplicações Práticas', 'Desafio Prático'];

  const handleNextTab = () => {
    if (currentIndex < tabs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lessonTitle}</Text>

      {/* ScrollView para o conteúdo da lição */}
      <Tab.Navigator
        initialRouteName={tabs[currentIndex]}
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: 'white' },
          tabBarStyle: { backgroundColor: '#1F2937', display: 'none' }, // Esconde as abas
        }}
      >
        <Tab.Screen name="Fundamentos">
          {() => <Fundamentals lessonData={lessonData} />}
        </Tab.Screen>
        <Tab.Screen name="Equações e Fórmulas">
          {() => <EquationsAndFormulas lessonData={lessonData} />}
        </Tab.Screen>
        <Tab.Screen name="Avaliação Teórica">
          {() => <TheoreticalEvaluation lessonData={lessonData} />}
        </Tab.Screen>
        <Tab.Screen name="Aplicações Práticas">
          {() => <Applications lessonData={lessonData} />}
        </Tab.Screen>
        <Tab.Screen name="Desafio Prático">
          {() => <PracticalChallenge lessonData={lessonData} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Indicadores de navegação */}
      <View style={styles.indicatorContainer}>
        {currentIndex > 0 && (
          <Text onPress={handlePrevTab} style={styles.indicatorText}>← Voltar</Text>
        )}
        {currentIndex < tabs.length - 1 && (
          <Text onPress={handleNextTab} style={styles.indicatorText}>Avançar →</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tabContent: {
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    marginTop: 10,
  },
  formulaItem: {
    marginBottom: 10,
  },
  formulaName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formulaContent: {
    color: '#FFFFFF',
  },
  exampleItem: {
    marginBottom: 10,
  },
  exampleQuestion: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exampleSolution: {
    color: '#FFFFFF',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    cursor: 'pointer',
  },
});

export default LessonScreen;
