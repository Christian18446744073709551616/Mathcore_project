import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useMusic } from '../components/MusicContext'; 
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// ajuste o caminho do seu MusicContext

// --- Tipos (Typescript) ---
interface SettingRowProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  isEnabled: boolean;
  onValueChange: (value: number) => void;
  onToggle: (isEnabled: boolean) => void;
}

// --- Componente de Linha de Configuração ---
const SettingRow: React.FC<SettingRowProps> = ({
  label,
  icon,
  value,
  isEnabled,
  onValueChange,
  onToggle,
}) => {
  const sliderColor = isEnabled ? '#9D7AFF' : '#5E5C77';
  const iconColor = isEnabled ? '#FFFFFF' : '#767577';
  const iconWithColor = React.cloneElement(icon as React.ReactElement, {
    color: iconColor,
  });

  return (
    <View style={styles.rowContainer}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.controlsContainer}>
        {iconWithColor}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={sliderColor}
          maximumTrackTintColor="#5E5C77"
          thumbTintColor={sliderColor}
          disabled={!isEnabled}
        />
        <Switch
          trackColor={{ false: '#767577', true: '#8f85e7' }}
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
  // Hook do MusicContext
  const { isPlaying, volume, toggleMusic, setVolume } = useMusic();
const navigation = useNavigation();
  // Estados para os valores de volume (0 a 1)
  const [generalVolume, setGeneralVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [isGeneralEnabled, setIsGeneralEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  // Ícones
  const generalIcon = <Icon name="volume-high" size={20} />;
  const sfxIcon = <Icon name="volume-high" size={20} />;
  const musicIcon = <Icon name="musical-note" size={20} />;

  // Botão de voltar
  const handleBackPress = () => {
    console.log('Botão Voltar Pressionado!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.fullScreen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MathCore</Text>
        <Text style={styles.screenTitle}>Áudio</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

      </View>

      {/* Container centralizado */}
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Áudio 🎵</Text>

          {/* Som Geral */}
          <SettingRow
            label="Som geral"
            icon={generalIcon}
            value={generalVolume}
            isEnabled={isGeneralEnabled}
            onValueChange={setGeneralVolume}
            onToggle={setIsGeneralEnabled}
          />

          <View style={styles.separator} />

          {/* Efeitos Sonoros */}
          <SettingRow
            label="Efeitos sonoros"
            icon={sfxIcon}
            value={sfxVolume}
            isEnabled={isSfxEnabled}
            onValueChange={setSfxVolume}
            onToggle={setIsSfxEnabled}
          />

          <View style={styles.separator} />

          {/* Música de Fundo */}
          <SettingRow
            label="Música de Fundo"
            icon={musicIcon}
            value={volume}         // do MusicContext
            isEnabled={isPlaying}  // ligado/desligado
            onValueChange={setVolume}
            onToggle={toggleMusic}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#302C4C',
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#302C4C',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5E5C77',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  card: {
    width: '35%',
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#4A456C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  rowContainer: {
    marginBottom: 10,
    paddingVertical: 5,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
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
    backgroundColor: '#5E5C77',
    marginVertical: 5,
  },
});

export default AudioSettingsScreen;
