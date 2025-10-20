            import React, { useState, useEffect } from 'react';
            import { TouchableOpacity } from 'react-native-gesture-handler';
            import { useNavigation } from '@react-navigation/native';
            import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
            import { RouteProp } from '@react-navigation/native';
            import { StackNavigationProp } from '@react-navigation/stack';
            import { RootStackParamList } from '../types';
            import { supabase } from '../lib/supabase';
            import { LinearGradient } from 'expo-linear-gradient';

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
            import { AntDesign, MaterialIcons, Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';


            // --- Tipagens ---
            type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
            type LessonScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lesson'>;

            type LessonScreenProps = {
              route: LessonScreenRouteProp;
            };

            type LessonData = {
              fundamentals: string;
              formulas: { name: string; formula: string }[];
              theoreticalEvaluation: string;
              examples: { question: string; solution: string }[];
              practicalChallenge: string;
            };

            // --- Mapeamento dos dados ---
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

            

            // --- Componentes filhos ---
            const Fundamentals = ({
              lessonData,
            }: {
              lessonData: LessonData;
             
            }) => (

              <ScrollView style={styles.tabContent}>
                
                <Text style={styles.subTitle}>Conceito</Text>
                <Text style={styles.textContent}>{lessonData.fundamentals}</Text>
              </ScrollView>
            );

            const EquationsAndFormulas = ({ lessonData }: { lessonData: LessonData }) => (
              <ScrollView style={styles.tabContent}>
                <Text style={styles.subTitle}>Equações e Fórmulas</Text>
                {lessonData.formulas.map((item, index) => (
                  <View key={index} style={styles.formulaItem}>
                    <Text style={styles.formulaName}>{item.name}:</Text>
                    <Text style={styles.formulaContent}>{item.formula}</Text>
                  </View>
                ))}
              </ScrollView>
            );

            const TheoreticalEvaluation = ({ lessonData }: { lessonData: LessonData }) => (
              <ScrollView style={styles.tabContent}>
                <Text style={styles.subTitle}>Avaliação Teórica</Text>
                <Text style={styles.textContent}>{lessonData.theoreticalEvaluation}</Text>
              </ScrollView>
            );

            const Applications = ({ lessonData }: { lessonData: LessonData }) => (
              <ScrollView style={styles.tabContent}>
                <Text style={styles.subTitle}>Aplicações Práticas</Text>
                {lessonData.examples.map((example, index) => (
                  <View key={index} style={styles.exampleItem}>
                    <Text style={styles.exampleQuestion}>{example.question}</Text>
                    <Text style={styles.exampleSolution}>{example.solution}</Text>
                  </View>
                ))}
              </ScrollView>
            );

            const PracticalChallenge = ({ lessonData }: { lessonData: LessonData }) => (
              <ScrollView style={styles.tabContent}>
                <Text style={styles.subTitle}>Desafio Prático</Text>
                <Text style={styles.textContent}>{lessonData.practicalChallenge}</Text>
              </ScrollView>
            );

            // --- Componente principal ---
            const LessonScreen: React.FC<LessonScreenProps> = ({ route }) => {
              const navigation = useNavigation<LessonScreenNavigationProp>();
              const { lessonTitle } = route.params;
              const lessonData = lessonDataMap[lessonTitle];
              const [session, setSession] = useState<any | null>(null);
              const [currentIndex, setCurrentIndex] = useState(0);
              const [maxProgressIndex, setMaxProgressIndex] = useState(0);

              const tabs = [
                'Fundamentos',
                'Equações e Fórmulas',
                'Avaliação Teórica',
                'Aplicações Práticas',
                'Desafio Prático',
              ];
              const colorStages = ['#03f0fc', '#00adb5', '#f0a500', '#f08a00', '#f04500'];

              // --- Carrega sessão ---
              useEffect(() => {
                const fetchSession = async () => {
                  const { data: { session }, error } = await supabase.auth.getSession();
                  if (error) console.error('Erro ao obter sessão:', error);
                  else setSession(session);
                };
                fetchSession();
              }, []);

              // --- Carrega progresso ---
              const loadProgress = async () => {
                if (!session?.user) return;
                try {
                  const { data: userProgress, error } = await supabase
                    .from('user_progress')
                    .select('current_index, max_index')
                    .eq('user_id', session.user.id)
                    .eq('lesson_title', lessonTitle)
                    .single();

                  if (error) console.error('Erro ao carregar progresso:', error);
                  else if (userProgress) {
                    setCurrentIndex(userProgress.current_index);
                    setMaxProgressIndex(userProgress.max_index);
                  }
                } catch (error) {
                  console.error('Erro ao buscar progresso:', error);
                }
              };

              useEffect(() => {
                if (session?.user) loadProgress();
              }, [session]);

              // --- Atualiza progresso ---
              const saveProgressToDatabase = async (index: number, newMaxIndex: number) => {
                if (!session?.user) return;
                try {
                  const progressPercentage = ((newMaxIndex + 1) / tabs.length) * 100;

                  const { data: existingProgress, error: fetchError } = await supabase
                    .from('user_progress')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('lesson_title', lessonTitle)
                    .single();

                  if (fetchError) console.error('Erro ao buscar progresso existente:', fetchError.message);
                  else if (existingProgress) {
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

              const updateProgress = async (newIndex: number) => {
                const newMaxIndex = Math.max(newIndex, maxProgressIndex);
                setCurrentIndex(newIndex);
                setMaxProgressIndex(newMaxIndex);
                await saveProgressToDatabase(newIndex, newMaxIndex);
              };

              
              /*if (!session) { // Mostra indicador de carregamento enquanto a sessão é carregada
                return (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#03f0fc" />
                  </View>
                );
              }*/

              return (
                <ScrollView style={styles.ScrollScreen}
                showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
                <View style={styles.container}>
                  <LinearGradient
                          colors={['#242948', '#5C6494']}
                          locations={[0.65, 0.30]}
                          start={{ x: 1, y: 1 }}
                          end={{ x: 0.85, y: 0.4 }}
                          style={{ flex: 1, padding: 20 }}
                        >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20, }}>
                  <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => navigation.navigate('Home')}
                  
                >
                  <Ionicons name="arrow-back-circle-outline" size={80} color="black" style={{ fontWeight: 'bold' }} />

                </TouchableOpacity>
                  </View>
                  <View style={styles.SobreBox}>
                    <View style= {[{width: '100%',}]}  >
                  <TouchableOpacity style={styles.ModePratic } onPress={() => navigation.push('GameScreen', {
                    lobbyId: 'default',        // ou um ID real do lobby, se houver
          lessonTitle: lessonTitle,  // você já tem isso vindo das `route.params`
          session: session,          // variável já carregada via Supabase
                  })
                  }>
                  <Text style={styles.title}>{lessonTitle}</Text>
                  </TouchableOpacity>
                  </View>
                  </View>

                  <View style={styles.SobreBox}>   
                    <View style= {[{width: '100%',}]}  >

                      
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 100 }}>
  <View style={styles.card}>
    <View style={styles.Conteudo}><Fundamentals lessonData={lessonData} /></View>
    <View style={styles.Conteudo}><EquationsAndFormulas lessonData={lessonData} /></View>
    <View style={styles.Conteudo}><TheoreticalEvaluation lessonData={lessonData} /></View>
    <View style={styles.Conteudo}><Fundamentals lessonData={lessonData} /></View>
    <View style={styles.Conteudo}><EquationsAndFormulas lessonData={lessonData} /></View>
    <View style={styles.Conteudo}><TheoreticalEvaluation lessonData={lessonData} /></View>
  </View> 
  </ScrollView>

                  </View>
                  </View>
                  </LinearGradient>
                </View>
                </ScrollView>
              );
            };

            // --- Estilos ---
            const styles = StyleSheet.create({
              container: { flex: 1 },
              returnButton: {
                width: 80,
                height: 80,
                borderRadius: 100,
                backgroundColor: '#D9D9D9',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              },
              ScrollScreen: {
                
              },
              SobreBox: {
                 
                width: '60%', 
    alignSelf: 'center', // centraliza horizontalmente
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
      padding: 20,
      borderRadius: 40,
      backgroundColor: "#707DCB",
    },
    ModePratic: {
      width: '100%', // ocupa 100% da largura do SobreBox
      backgroundColor: "#BDC4EE",
      padding: 10,
      borderRadius: 30,
      alignItems: "center",
    },
    Conteudo: {
      marginBottom: 20,
      width: '50%', // ocupa 100% da largura do SobreBox
      borderRadius: 30,
      borderColor: '#000000',
      borderWidth: 2,
      padding: 10,
      backgroundColor: "#D9D9D9",
    },
              title: { fontSize: 45, fontWeight: 'bold', color: '#000000ff', textAlign: 'center', marginBottom: 16 },
              card: {
                justifyContent: "space-between",
      backgroundColor: "#BDC4EE",
      padding: 20,
      borderRadius: 30,
      alignItems: "center",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 60,
              },
              tabContent: { },
              subTitle: { fontSize: 30, fontWeight: 'bold', color: '#000000ff', marginBottom: 8, textAlign: 'center' },
              textContent: { color: '#000000ff', fontSize: 20, },
              formulaItem: { marginBottom: 8 },
              formulaName: { fontWeight: 'bold', color: '#000000ff' },
              formulaContent: {color: '#000000ff' },
              exampleItem: { marginBottom: 8 },
              exampleQuestion: { fontWeight: 'bold', color: '#03f0fc' },
              exampleSolution: { fontStyle: 'italic', color: '#e0e0e0' },
              
              
            });

            export default LessonScreen;
