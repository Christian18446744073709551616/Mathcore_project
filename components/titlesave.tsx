import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

interface TitleScreenProps {
  onFinish: () => void; // Função que será chamada ao clicar no botão
  session: any; // Sessão atual
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onFinish, session }) => {
  return (
    <LinearGradient 
      colors={['#0a0f25', '#000000']} // Dark blue to black gradient
      style={styles.container}
    >
      <Text style={styles.title}>Mathcore</Text>
      <TouchableOpacity style={styles.button} onPress={onFinish}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontFamily: 'Orbitron-Regular', // PS2-inspired font
    color: '#ffffff',
    textShadowColor: '#00ffff', // Neon glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0088cc', // Neon blue button
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    shadowColor: '#0088cc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15, // Neon glow effect
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'Orbitron-Regular',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default TitleScreen;
