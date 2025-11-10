import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// --- TEMAS ATUALIZADOS (gradient ao invés de background) ---
const themes = {
  padrao: {
    name: 'Padrão',
    gradient: ['#0F172A', '#1E293B'],
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    boxes: ['#731dca', '#4b843d', '#5c1dcb', '#2c3c92'],
  },
  roxo: {
    name: 'Roxo',
    gradient: ['#1d2033', '#30345a'],
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    boxes: ['#8B5CF6', '#9333EA', '#7C3AED', '#6D28D9'],
  },
  azulClaro: {
    name: 'Azul Claro',
    gradient: ['#5b6b85', '#93a5c5'],
    text: '#1e293b',
    textSecondary: '#475569',
    boxes: ['#3B82F6', '#06B6D4', '#0EA5E9', '#2563EB'],
  },
  altoContraste: {
    name: 'Alto Contraste',
    gradient: ['#000000', '#1A1A1A'],
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    boxes: ['#FFFF00', '#00FF00', '#FF00FF', '#00FFFF'],
  },
  deuteranopia: {
    name: 'Deuteranopia',
    gradient: ['#faf9f7', '#E8E6E0'],
    text: '#2c2c2c',
    textSecondary: '#666666',
    boxes: ['#0077b6', '#9d4edd', '#ff9500', '#0466c8'],
  },
  protanopia: {
    name: 'Protanopia',
    gradient: ['#f8f9fa', '#D9DCE0'],
    text: '#212529',
    textSecondary: '#6c757d',
    boxes: ['#0466c8', '#7209b7', '#fb8500', '#0353a4'],
  },
  tritanopia: {
    name: 'Tritanopia',
    gradient: ['#fefefe', '#F0F0F0'],
    text: '#1e1e1e',
    textSecondary: '#666666',
    boxes: ['#e63946', '#06ffa5', '#ff006e', '#d62828'],
  },
};

const Home2Screen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [currentTheme, setCurrentTheme] = useState('padrao');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { width } = useWindowDimensions();

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
  }, []);

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
                  locations={[0.25, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>25%</Text>
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
                  locations={[1, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>100%</Text>
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
                  locations={[0.37, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>37%</Text>
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
                  locations={[0, 0.01]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.progressText}>0%</Text>
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