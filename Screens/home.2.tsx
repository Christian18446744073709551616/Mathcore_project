import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// --- ATUALIZAÇÃO 1: Definindo o tipo para nosso Conteúdo ---
export interface Content {
  id: string;
  name: string;
  color: string;
  icon_name: string; // Nome do ícone para renderização dinâmica
  navigation_target: keyof RootStackParamList; // Tela para qual navegar
}

const Home2Screen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');
  // --- ATUALIZAÇÃO 2: Estado para armazenar os conteúdos e o carregamento ---
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // --- ATUALIZAÇÃO 3: Buscando os dados do Supabase (ou usando mock por enquanto) ---
      // Idealmente, viria de: const { data, error } = await supabase.from('contents').select('*');
      const mockData: Content[] = [
        { id: '1', name: 'Geometria', color: '#731dca', icon_name: 'shapes', navigation_target: 'GeometryLessons' },
        { id: '2', name: 'Matemática Financeira', color: '#4b843d', icon_name: 'bar-graph', navigation_target: 'MathFincLessons' },
        { id: '3', name: 'Matemática Básica', color: '#5c1dcb', icon_name: 'division', navigation_target: 'MathBasicLessons' },
        { id: '4', name: 'Álgebra', color: '#2c3c92', icon_name: 'square-root-alt', navigation_target: 'AlgebraLessons' },
      ];
      setContents(mockData);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (profileData) setUsername(profileData.username);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Mapeia o nome do ícone para o componente de ícone real
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'shapes': return <Ionicons name="shapes" size={80} style={{ marginTop: 10 }} />;
      case 'bar-graph': return <Entypo name="bar-graph" size={80} style={{ marginTop: 10 }} />;
      case 'division': return <MaterialCommunityIcons name="division" size={80} style={{ marginTop: 10 }} />;
      case 'square-root-alt': return <FontAwesome5 name="square-root-alt" size={80} style={{ marginTop: 10 }} />;
      default: return null;
    }
  };

  const boxWidth = width > 500 ? 400 : width * 0.9;

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
      <Text style={styles.title}>MathCore</Text>
      <Text style={styles.prompt}>O que vamos aprender hoje, {username}?</Text>

      {/* --- ATUALIZAÇÃO 4: Renderizando a lista de conteúdos dinamicamente --- */}
      <View style={styles.verticalGrid}>
        {contents.map((content) => (
          <TouchableOpacity
            key={content.id}
            style={[styles.box, { backgroundColor: content.color, width: boxWidth, height: 200 }]}
            onPress={() => navigation.navigate(content.navigation_target)}
          >
            <Text style={styles.textBox}>{content.name}</Text>
            {renderIcon(content.icon_name)}
            <View style={styles.progress}>
              <LinearGradient
                colors={['#219d40', '#FFFFFF']}
                locations={[0.25, 0.01]} // Exemplo, isso também pode vir do DB
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.progressText}>25%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// Estilos permanecem os mesmos...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  prompt: {
    fontSize: 20,
    color: '#94A3B8',
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
    color: '#FFFFFF',
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
});

export default Home2Screen;