import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const QuizScreen = () => {
  const navigation = useNavigation();

  const handleNewQuiz = () => {
    navigation.navigate('NovoQuizScreen');
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.30]} 
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1, padding: 20 }}
      >
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Quiz</Text>
          </View>

          {/* Container que empurra o retângulo para baixo */}
          <View style={styles.bottomContainer}>
            {/* Retângulo que cresce para cima */}
            <View style={styles.expandingRectangle}>
              
              {/* Container para o botão no canto superior esquerdo */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.newQuizButton}
                  onPress={handleNewQuiz}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.novoText}>Novo</Text>
                    <Text style={styles.quizText}>Quiz</Text>
                    <Text style={styles.plusSymbol}>+</Text>
                  </View>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  expandingRectangle: {
    backgroundColor: '#707DCB',
    borderRadius: 12,
    padding: 40,
    minHeight: 700,
    flexGrow: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  newQuizButton: {
    backgroundColor: '#707DCB',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 70,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  novoText: {
    color: '#000000',
    fontSize: 44,
    fontWeight: 'bold',
  },
  quizText: {
    color: '#000000',
    fontSize: 44,
    fontWeight: 'bold',
  },
  plusSymbol: {
    color: '#000000',
    fontSize: 84,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default QuizScreen;