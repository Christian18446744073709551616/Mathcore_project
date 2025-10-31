import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MathFincLessons'>;

const { width } = Dimensions.get('window');

function Accordion() {
  const [openStats, setOpenStats] = useState(false);
  const [openProb, setOpenProb] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const statsLessons = [
    ['Noções Básicas', 'Gráfico de Barras'],
    ['Gráfico de Setores', 'Média, Moda e Mediana'],
  ];

  const probLessons = [
    ['Conceitos Básicos de Probabilidade', 'Cálculos de Probabilidade'],
    ['Árvore de Probabilidades'],
  ];

  const renderLessons = (lessons: string[][]) => (
    lessons.map((row, idx) => (
      <View key={idx} style={styles.row}>
        {row.map((lesson) => (
          <TouchableOpacity
            key={lesson}
            style={styles.lessonBox}
            onPress={() => navigation.navigate('Lesson', { lessonTitle: lesson })}
            activeOpacity={0.8}
          >
            <Text style={styles.lessonText}>{lesson}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ))
  );

  return (
    <View style={styles.accordionContainer}>
      {/* Estatística */}
      <TouchableOpacity style={styles.accordionHeader} onPress={() => setOpenStats(!openStats)}>
        <Text style={styles.accordionTitle}>Estatística</Text>
        <MaterialIcons name={openStats ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={40} color="#fff" />
      </TouchableOpacity>
      {openStats && (
        <ScrollView style={styles.accordionContent} showsVerticalScrollIndicator={false}>
          {renderLessons(statsLessons)}
        </ScrollView>
      )}

      {/* Probabilidade */}
      <TouchableOpacity style={styles.accordionHeader} onPress={() => setOpenProb(!openProb)}>
        <Text style={styles.accordionTitle}>Probabilidade</Text>
        <MaterialIcons name={openProb ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={40} color="#fff" />
      </TouchableOpacity>
      {openProb && (
        <ScrollView style={styles.accordionContent} showsVerticalScrollIndicator={false}>
          {renderLessons(probLessons)}
        </ScrollView>
      )}
    </View>
  );
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');

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
  }, []);

  return (
    <LinearGradient
      colors={['#242948', '#5C6494']}
          locations={[0.65, 0.30]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.85, y: 0.4 }}
          style={{ flex: 1, padding: 20 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Matemática Financeira</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home2')}
          >
            <Ionicons name="arrow-back-circle-outline" size={50} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>O que vamos aprender hoje, {username}?</Text>

        <Accordion />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 5,
  },
  subtitle: {
    fontSize: 20,
    color: '#CFCFCF',
    marginBottom: 20,
  },
  accordionContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#707DCB',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 10,
  },
  accordionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  accordionContent: {
    padding: 20,
    backgroundColor: '#4d547cff',
    borderRadius: 20,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  lessonBox: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 25,
    borderRadius: 20,
    backgroundColor: '#BDC4EE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  lessonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242948',
    textAlign: 'center',
  },
});

export default HomeScreen;
