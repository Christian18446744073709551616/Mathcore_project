import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, MaterialIcons, Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Importando dados das lições
import ArvoreProbabilidade from '../Vsauces/MathFincCont/ArvoreProbabilidade.json';
import CalculosProbabilidade from '../Vsauces/MathFincCont/CalculosProbabilidade.json';
import ConceitosBasicosProbabilidade from '../Vsauces/MathFincCont/ConceitosBasicosProbabilidade.json';
import GraficoBarras from '../Vsauces/MathFincCont/GraficoBarras.json';
import GraficoSetores from '../Vsauces/MathFincCont/GraficoSetores.json';
import MediaModasMedianas from '../Vsauces/MathFincCont/MediaModasMedianas.json';
import pentagoNocoesBasicasnosData from '../Vsauces/MathFincCont/NocoesBasicas.json';
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MathFincLessons'>;


function Accordion() {
  const [openEstatistica, setOpenEstatistica] = useState(false);
const [openProbabilidade, setOpenProbabilidade] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      
      <View style={styles.SobreBox}>
        <TouchableOpacity style={styles.Estatistica} onPress={() => setOpenEstatistica(!openEstatistica)}>
  <Text style={styles.title}>Estatistica</Text>
  <MaterialIcons name={openEstatistica ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={85} color="black" style={{ marginEnd: 30 }} />
</TouchableOpacity>

{openEstatistica && (
          <ScrollView style={styles.scrollLesson} showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.lessonContainer}>
              <View style={styles.row}>
                {/* ✅ Quadrados agora vai direto para Lesson */}
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Noções Básicas' })}
                >
                  <Text style={styles.lessonTitle}>Noções Básicas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Gráfico de Barras' })}
                >
                  <Text style={styles.lessonTitle}>Gráfico de Barras</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Gráfico de Setores' })}
                >
                  <Text style={styles.lessonTitle}>Gráfico de Setores</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Média, Moda e Mediana'})}
                >
                  <Text style={styles.lessonTitle}>Médias, Modas e Medianas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </ScrollView>
        )}
      </View>


      <View style={styles.SobreBox}>
        <TouchableOpacity style={styles.Estatistica} onPress={() => setOpenProbabilidade(!openProbabilidade)}>
  <Text style={styles.title}>Probabilidade</Text>
  <MaterialIcons name={openProbabilidade ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={85} color="black" style={{ marginEnd: 30 }} />
</TouchableOpacity>

{openProbabilidade && (
          <ScrollView style={styles.scrollLesson} showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.lessonContainer}>
              <View style={styles.row}>
                {/* ✅ Quadrados agora vai direto para Lesson */}
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Conceitos Básicos de Probabilidade' })}
                >
                  <Text style={styles.lessonTitle}>Conceitos Básicos de Probabilidades</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Cálculos de Probabilidade' })}
                >
                  <Text style={styles.lessonTitle}>Cálculo de Probabilidades</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Árvore de Probabilidade' })}
                >
                  <Text style={styles.lessonTitle}>Árvore de Probabilidades</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </ScrollView>
        )}
      </View>
    </View>

    
  );
}


const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (data) setUsername(data.username);
        if (error) console.error(error);
      }
      if (userError) console.error(userError);
    };
    fetchUsername();
  }, []);

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
            <Text style={styles.title}>Matemática Financeira</Text>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => navigation.navigate('Home2')}
            >
              <Ionicons name="arrow-back-circle-outline" size={80} color="black" style={{ fontWeight: 'bold' }} />
            </TouchableOpacity>
          </View>
          <Accordion />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  Estatistica: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#BDC4EE",
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  scrollLesson: {
    maxHeight: 500,
    marginTop: 10,
    borderRadius: 40,
  },
  SobreBox: {
    padding: 20,
    borderRadius: 40,
    backgroundColor: "#707DCB",
    marginBottom: 30,
  },
  content: {
    borderRadius: 30,
    backgroundColor: "#5C6494"
  },
  container: {
    padding: 20,

  },
  title: {
    marginStart: 30,
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  returnButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  lessonContainer: {
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  lessonBox: {
    flex: 1,
    marginHorizontal: 30,
    padding: 30,
    backgroundColor: '#D9D9D9',
    borderRadius: 25,
    alignItems: 'center',
  },
  lessonTitle: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#000000',
  },
});

export default HomeScreen;
