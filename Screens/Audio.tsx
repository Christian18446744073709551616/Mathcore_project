import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useMusic } from '../components/MusicContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DEFINIÇÃO DOS TEMAS ---
const themes = {
  padrao: {
    name: 'Padrão',
    gradient: ['#242948', '#5C6494'],
    card: '#4A456C',
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    slider: '#9D7AFF',
    sliderDisabled: '#5E5C77',
    separator: '#5E5C77',
    primary: '#8f85e7',
  },
  altoContraste: {
    name: 'Alto Contraste',
    gradient: ['#000000', '#1a1a1a'],
    card: '#2a2a2a',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    slider: '#FFFF00',
    sliderDisabled: '#4a4a4a',
    separator: '#FFFFFF',
    primary: '#00FF00',
  },
  Vermelho: {
    name: 'Vermelho',
    gradient: ['#482424ff', '#945c5cff'],
    card: '#6c4545ff',
    text: '#FFFFFF',
    textSecondary: '#d6b4b4ff',
    slider: '#ff7a7aff',
    sliderDisabled: '#775c5cff',
    separator: '#000000ff',
    primary: '#e78585ff',
  },
  Laranja: {
    name: 'Laranja',
    gradient: ['#483724ff', '#947c5cff'],
    card: '#6c5d45ff',
    text: '#FFFFFF',
    textSecondary: '#d6cbb4ff',
    slider: '#ffca7aff',
    sliderDisabled: '#776c5cff',
    separator: '#000000ff',
    primary: '#e7bd85ff',
  },
  Amarelo: {
    name: 'Amarelo',
    gradient: ['#474824ff', '#93945cff'],
    card: '#6c6a45ff',
    text: '#FFFFFF',
    textSecondary: '#d3d6b4ff',
    slider: '#fffd7aff',
    sliderDisabled: '#77775cff',
    separator: '#000000ff',
    primary: '#e5e785ff',
  },
  Verde: {
    name: 'Verde',
    gradient: ['#244824ff', '#63945cff'],
    card: '#4d6c45ff',
    text: '#FFFFFF',
    textSecondary: '#b5d6b4ff',
    slider: '#7aff85ff',
    sliderDisabled: '#5c775eff',
    separator: '#000000ff',
    primary: '#95e785ff',
  },
  azulClaro: {
    name: 'Azul Claro',
    gradient: ['#5b6b85', '#93a5c5'],
    card: '#c5d0e6',
    text: '#1e293b',
    textSecondary: '#475569',
    slider: '#3B82F6',
    sliderDisabled: '#93a5c5',
    separator: '#93a5c5',
    primary: '#0EA5E9',
  },
  azulEscuro: {
    name: 'Azul Escuro',
    gradient: ['#262e61ff', '#3e50b8ff'],
    card: '#4038acff',
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    slider: '#4446f3ff',
    sliderDisabled: '#35387eff',
    separator: '#000000ff',
    primary: '#5146ecff',
  },
  roxo: {
    name: 'Roxo',
    gradient: ['#2a1d33ff', '#47305aff'],
    card: '#592485ff',
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    slider: '#be5cf6ff',
    sliderDisabled: '#7c4194ff',
    separator: '#000000ff',
    primary: '#9333EA',
  },
  cinza: {
    name: 'Cinza',
    gradient: ['#808080', '#A9A9A9'],
    card: '#505050ff',
    text: '#FFFFFF',
    textSecondary: '#B4B7D6',
    slider: '#bbbbbbff',
    sliderDisabled: '#696969ff',
    separator: '#ffffffff',
    primary: '#e9e9e9ff',
  },
};

// --- Tipos (Typescript) ---
interface SettingRowProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  isEnabled: boolean;
  onValueChange: (value: number) => void;
  onToggle: (isEnabled: boolean) => void;
  theme: any;
}

// --- Componente de Linha de Configuração ---
const SettingRow: React.FC<SettingRowProps> = ({
  label,
  icon,
  value,
  isEnabled,
  onValueChange,
  onToggle,
  theme,
}) => {
  const sliderColor = isEnabled ? theme.slider : theme.sliderDisabled;
  const iconColor = isEnabled ? theme.text : theme.textSecondary;
  const iconWithColor = React.cloneElement(icon as React.ReactElement, {
    color: iconColor,
  });

  return (
    <View style={styles.rowContainer}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.controlsContainer}>
        {iconWithColor}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={sliderColor}
          maximumTrackTintColor={theme.sliderDisabled}
          thumbTintColor={sliderColor}
          disabled={!isEnabled}
        />
        <Switch
          trackColor={{ false: '#767577', true: theme.primary }}
          thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
          ios_backgroundColor="#767577"
          onValueChange={onToggle}
          value={isEnabled}
        />
      </View>
    </View>
  );
};

// --- Tela Principal ---
const AudioSettingsScreen: React.FC = () => {
  const { isPlaying, volume, toggleMusic, setVolume } = useMusic();
  const navigation = useNavigation();

  const [generalVolume, setGeneralVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [isGeneralEnabled, setIsGeneralEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const [currentTheme, setCurrentTheme] = useState('padrao');
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme');
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
      await AsyncStorage.setItem('app_theme', themeKey);
    } catch (error) {
      console.log('Erro ao salvar tema:', error);
    }
  };

  const theme = themes[currentTheme as keyof typeof themes];

  const generalIcon = <Icon name="volume-high" size={20} />;
  const sfxIcon = <Icon name="volume-high" size={20} />;
  const musicIcon = <Icon name="musical-note" size={20} />;

  const handleBackPress = () => {
    console.log('Botão Voltar Pressionado!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.fullScreen} edges={['top']}>
      <LinearGradient
        colors={theme.gradient}
        locations={[0.65, 0.30]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1 }}
      >
        {/* --- HEADER ALTERADO --- */}
        <View style={styles.header}>
          {/* Botão de Voltar - AGORA À ESQUERDA */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* Título MathCore e Áudio - CENTRALIZADOS */}
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>MathCore</Text>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Áudio</Text>
          </View>

          {/* Botão de Tema - AGORA À DIREITA */}
          <TouchableOpacity 
            style={styles.themeButton}
            onPress={() => setShowThemeModal(true)}
          >
            <Ionicons name="color-palette" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Container centralizado */}
        <View style={styles.centerContainer}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Áudio 🎵</Text>

            {/* Som Geral */}
            <SettingRow
              label="Som geral"
              icon={generalIcon}
              value={generalVolume}
              isEnabled={isGeneralEnabled}
              onValueChange={setGeneralVolume}
              onToggle={setIsGeneralEnabled}
              theme={theme}
            />

            <View style={[styles.separator, { backgroundColor: theme.separator }]} />

            {/* Efeitos Sonoros */}
            <SettingRow
              label="Efeitos sonoros"
              icon={sfxIcon}
              value={sfxVolume}
              isEnabled={isSfxEnabled}
              onValueChange={setSfxVolume}
              onToggle={setIsSfxEnabled}
              theme={theme}
            />

            <View style={[styles.separator, { backgroundColor: theme.separator }]} />

            {/* Música de Fundo */}
            <SettingRow
              label="Música de Fundo"
              icon={musicIcon}
              value={volume}
              isEnabled={isPlaying}
              onValueChange={setVolume}
              onToggle={toggleMusic}
              theme={theme}
            />
          </View>
        </View>

        {/* MODAL DE TEMA */}
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
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha um Tema</Text>
              
              <ScrollView style={styles.themeList}>
                {Object.entries(themes).map(([key, themeOption]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.themeOption,
                      { 
                        backgroundColor: themeOption.card,
                        borderColor: currentTheme === key ? themeOption.primary : 'transparent',
                      }
                    ]}
                    onPress={() => changeTheme(key)}
                  >
                    <Text style={[styles.themeName, { color: themeOption.text }]}>
                      {themeOption.name}
                    </Text>
                    <View style={styles.colorPreview}>
                      <View style={[styles.colorSwatch, { backgroundColor: themeOption.gradient[0] }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeOption.card }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeOption.primary }]} />
                    </View>
                    {currentTheme === key && (
                      <Ionicons name="checkmark-circle" size={24} color={themeOption.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

// --- Estilos (ATUALIZADOS) ---
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  // --- HEADER ALTERADO ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  // --- CONTAINER CENTRAL PARA TÍTULOS (NOVO) ---
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // --- BOTÃO DE VOLTAR (ATUALIZADO - AGORA SEM POSITION ABSOLUTE) ---
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(94, 92, 119, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- BOTÃO DE TEMA (ATUALIZADO - AGORA SEM POSITION ABSOLUTE) ---
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(94, 92, 119, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
 centerContainer: {
  flex: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingTop: 20,
  paddingHorizontal: 10,
},

card: {
  width: '90%',
  maxWidth: 500,
  paddingVertical: 25,
  paddingHorizontal: 15,
  borderRadius: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 8,
},

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rowContainer: {
    marginBottom: 10,
    paddingVertical: 5,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 5,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  separator: {
    height: 1,
    marginVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
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
    maxHeight: 350,
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
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
});

export default AudioSettingsScreen;