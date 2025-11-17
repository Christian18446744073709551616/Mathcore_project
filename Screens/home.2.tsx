import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home2'>;

// --- TEMAS ATUALIZADOS (gradient ao invés de background) ---
const themes = {
  padrao: {
    name: 'Padrão',
    gradient: ['#0F172A', '#1E293B'],
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    boxes: ['#731dca', '#4b843d', '#5c1dcb', '#2c3c92'],
  },
  altoContraste: {
    name: 'Alto Contraste',
    gradient: ['#000000', '#1A1A1A'],
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    boxes: ['#FFFF00', '#00FF00', '#FF00FF', '#00FFFF'],
  },
  Vermelho: {
    name: 'Vermelho',
    gradient: ['#461818ff', '#721d30ff'],
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    boxes: ['#f65c5cff', '#ea3333ff', '#ed3a3aff', '#d92837ff'],
  },
  Laranja: {
    name: 'Laranja',
    gradient: ['#462d18ff', '#72431dff'],
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
    boxes: ['#f6b85cff', '#ea9b33ff', '#edae3aff', '#d98628ff'],
  },
  Amarelo: {
    name: 'Amarelo',
    gradient: ['#464318ff', '#726c1dff'],
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    boxes: ['#e7f65cff', '#eae733ff', '#e1ed3aff', '#cdd928ff'],
  },
  Verde: {
    name: 'Verde',
    gradient: ['#184618ff', '#20721dff'],
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
    boxes: ['#5cf67dff', '#4b843d', '#49ed3aff', '#51d928ff'],
  },
  azulClaro: {
    name: 'Azul Claro',
    gradient: ['#5b6b85', '#93a5c5'],
    text: '#1e293b',
    textSecondary: '#475569',
    boxes: ['#3B82F6', '#06B6D4', '#0EA5E9', '#2563EB'],
  },
  azulEscuro: {
    name: 'Azul Escuro',
    gradient: ['#181946ff', '#1d2572ff'],
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
    boxes: ['#5c66f6ff', '#3336eaff', '#3d3aedff', '#2b28d9ff'],
  },
  Roxo: {
    name: 'Roxo',
    gradient: ['#1d2033', '#30345a'],
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    boxes: ['#8B5CF6', '#9333EA', '#7C3AED', '#6D28D9'],
  },
  cinza: {
    name: 'Cinza',
    gradient: ['#808080', '#A9A9A9'],
    text: '#FFFFFF',
    textSecondary: '#FFFFFF',
    boxes: ['#6b6767ff', '#928f8fff', '#C0C0C0', '#D3D3D3'],
  },
};

const Home2Screen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [currentTheme, setCurrentTheme] = useState('padrao');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [progress, setProgress] = useState({
    Geometria: 0,
    'Matemática Básica': 0,
    'Matemática Financeira': 0,
    Álgebra: 0,
  });
  const { width } = useWindowDimensions();

  // Define lessons per subject
  const subjects = {
    Geometria: ['Quadrados', 'Triângulos', 'Retângulos', 'Losangos', 'Trapézios', 'Paralelogramos', 'Hexágonos', 'Ângulos', 'Polígonos'],
    'Matemática Básica': ['Adição e Subtração', 'Multiplicação e Divisão', 'Expressões Numéricas', 'Frações', 'Sistema de Numeração Decimal', 'Sistema Métrico Decimal', 'MDC', 'MMC'],
    'Matemática Financeira': ['Noções Básicas', 'Gráfico de Barras', 'Gráfico de Setores', 'Média, Moda e Mediana', 'Conceitos Básicos de Probabilidade', 'Cálculos de Probabilidade', 'Árvore de Probabilidades'],
    Álgebra: ['Noções da função', 'Introdução da Função Afim'],
  };

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_title')
        .eq('user_id', user.id);
      if (!error && data) {
        const viewedLessons = data.map(item => item.lesson_title);
        const newProgress = { ...progress };
        Object.keys(subjects).forEach(subject => {
          const totalLessons = subjects[subject as keyof typeof subjects].length;
          const viewedCount = subjects[subject as keyof typeof subjects].filter(lesson => viewedLessons.includes(lesson)).length;
          newProgress[subject as keyof typeof newProgress] = Math.round((viewedCount / totalLessons) * 100);
        });
        setProgress(newProgress);
      }
    }
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (data) setUsername(data.username);
      }
    };
    fetchUsername();

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('home_theme');
        if (savedTheme && themes[savedTheme as keyof typeof themes]) {
          setCurrentTheme(savedTheme);
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      }
    };
    loadTheme();

    fetchProgress();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProgress();
    });
    return unsubscribe;
  }, [navigation]);

  const changeTheme = async (themeKey: string) => {
    setCurrentTheme(themeKey);
    setShowThemeModal(false);
    try {
      await AsyncStorage.setItem('home_theme', themeKey);
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
    }
  };

  const theme = themes[currentTheme as keyof typeof themes];
  const boxWidth = width > 500 ? 400 : width * 0.9;

  return (
    <View style={{ flex: 1 }}>
      {/* --- CORREÇÃO PRINCIPAL: Usando theme.gradient --- */}
      <LinearGradient
        colors={theme.gradient}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >

          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <Text style={[styles.title, { color: theme.text }]}>MathCore</Text>
            <TouchableOpacity onPress={() => setShowThemeModal(true)} style={{ flex: 1, alignItems: 'flex-end' }}>
              <Ionicons name="color-palette" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Corrigido: usando theme.textSecondary */}
          <Text style={[styles.prompt, { color: theme.textSecondary }]}>
            O que vamos aprender hoje, {username}?
          </Text>

          <View style={styles.verticalGrid}>
            {/* Geometria */}
            <TouchableOpacity
              style={[styles.box, { backgroundColor: theme.boxes[0], width: boxWidth, height: 200 }]}
              onPress={() => navigation.navigate('GeometryLessons')}
            >
              <Text style={styles.textBox}>Geometria</Text>
              <Ionicons name="shapes" size={80} color="#000000ff" style={{ marginTop: 10 }} />
              <View style={styles.progress}>
                <LinearGradient
                  colors={['#219d40', '#FFFFFF']}
                  locations={[progress.Geometria / 100, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>{progress.Geometria}%</Text>
              </View>
            </TouchableOpacity>

            {/* Matemática Financeira */}
            <TouchableOpacity
              style={[styles.box, { backgroundColor: theme.boxes[1], width: boxWidth, height: 200 }]}
              onPress={() => navigation.navigate('MathFincLessons')}
            >
              <Text style={styles.textBox}>Matemática Financeira</Text>
              <Entypo name="bar-graph" size={80} color="#000000ff" style={{ marginTop: 10 }} />
              <View style={styles.progress}>
                <LinearGradient
                  colors={['#219d40', '#FFFFFF']}
                  locations={[progress['Matemática Financeira'] / 100, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>{progress['Matemática Financeira']}%</Text>
              </View>
            </TouchableOpacity>

            {/* Matemática Básica */}
            <TouchableOpacity
              style={[styles.box, { backgroundColor: theme.boxes[2], width: boxWidth, height: 200 }]}
              onPress={() => navigation.navigate('MathBasicLessons')}
            >
              <Text style={styles.textBox}>Matemática Básica</Text>
              <MaterialCommunityIcons name="division" size={80} color="#000000ff" style={{ marginTop: 10 }} />
              <View style={styles.progress}>
                <LinearGradient
                  colors={['#219d40', '#FFFFFF']}
                  locations={[progress['Matemática Básica'] / 100, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>{progress['Matemática Básica']}%</Text>
              </View>
            </TouchableOpacity>

            {/* Álgebra */}
            <TouchableOpacity
              style={[styles.box, { backgroundColor: theme.boxes[3], width: boxWidth, height: 200 }]}
              onPress={() => navigation.navigate('AlgebraLessons')}
            >
              <Text style={styles.textBox}>Álgebra</Text>
              <FontAwesome5 name="square-root-alt" size={80} color="#000000ff" style={{ marginTop: 10 }} />
              <View style={styles.progress}>
                <LinearGradient
                  colors={['#219d40', '#FFFFFF']}
                  locations={[progress.Álgebra / 100, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>{progress.Álgebra}%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de seleção de tema */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowThemeModal(false)}
          >
            {/* Corrigido: usando theme.gradient[0] */}
            <View style={[styles.modalContent, { backgroundColor: theme.gradient[0] }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha um Tema</Text>

              <ScrollView style={styles.themeList}>
                {Object.entries(themes).map(([key, themeOption]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: themeOption.gradient[0],
                        borderColor: currentTheme === key ? '#219d40' : 'transparent',
                      }
                    ]}
                    onPress={() => changeTheme(key)}
                  >
                    <Text style={[styles.themeName, { color: themeOption.text }]}>
                      {themeOption.name}
                    </Text>
                    <View style={styles.colorPreview}>
                      {themeOption.boxes.map((color, index) => (
                        <View
                          key={index}
                          style={[styles.colorSwatch, { backgroundColor: color }]}
                        />
                      ))}
                    </View>
                    {currentTheme === key && (
                      <Ionicons name="checkmark-circle" size={24} color="#219d40" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
    padding: 8,
  },
  prompt: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
  },
  verticalGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
    width: '100%',
  },
  box: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
  },
  textBox: {
    color: '#000000ff',
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  progress: {
    borderWidth: 3,
    flexDirection: 'row',
    width: '80%',
    height: 40,
    marginTop: 10,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    zIndex: 1,
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeList: {
    maxHeight: 400,
  },
  themeOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  closeButton: {
    backgroundColor: '#219d40',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Home2Screen;