import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Certifique-se que o caminho esteja correto
import { supabase } from '../lib/supabase'; // Ajuste o caminho conforme necessário

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser(); // Obtém o usuário logado
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id) // Filtra pelo ID do usuário logado
          .single(); // Espera um único objeto

        if (data) setUsername(data.username);
        if (error) console.error(error);
      }
      
      if (userError) console.error(userError);
    };

    fetchUsername();
  }, []);


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MathCore</Text>
      <Text style={styles.subtitle}>Geometria Plana</Text>
      <Text style={styles.prompt}>O que vamos aprender hoje, {username}?</Text>
      
      <View style={styles.lessonContainer}>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Quadrados' })}
          >
            <Text style={styles.lessonText}>1</Text>
            <Text style={styles.lessonTitle}>Quadrados</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Triângulos' })}
          >
            <Text style={styles.lessonText}>2</Text>
            <Text style={styles.lessonTitle}>Triângulos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Retângulos' })}
          >
            <Text style={styles.lessonText}>3</Text>
            <Text style={styles.lessonTitle}>Retângulos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Losangos' })}
          >
            <Text style={styles.lessonText}>4</Text>
            <Text style={styles.lessonTitle}>Losangos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Trapézios' })}
          >
            <Text style={styles.lessonText}>5</Text>
            <Text style={styles.lessonTitle}>Trapézios</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Paralelogramos' })}
          >
            <Text style={styles.lessonText}>6</Text>
            <Text style={styles.lessonTitle}>Paralelogramos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Pentágonos' })}
          >
            <Text style={styles.lessonText}>7</Text>
            <Text style={styles.lessonTitle}>Pentágonos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Hexágonos' })}
          >
            <Text style={styles.lessonText}>8</Text>
            <Text style={styles.lessonTitle}>Hexágonos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Heptágonos' })}
          >
            <Text style={styles.lessonText}>9</Text>
            <Text style={styles.lessonTitle}>Heptágonos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Octágonos' })}
          >
            <Text style={styles.lessonText}>10</Text>
            <Text style={styles.lessonTitle}>Octágonos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Polígonos' })}
          >
            <Text style={styles.lessonText}>11</Text>
            <Text style={styles.lessonTitle}>Polígonos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Teorema de Tales' })}
          >
            <Text style={styles.lessonText}>12</Text>
            <Text style={styles.lessonTitle}>Teorema de Tales</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Ângulos' })}
          >
            <Text style={styles.lessonText}>13</Text>
            <Text style={styles.lessonTitle}>Ângulos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Congruência e Semelhança de Figuras' })}
          >
            <Text style={styles.lessonText}>14</Text>
            <Text style={styles.lessonTitle}>Congruência e Semelhança de Figuras</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Círculos' })}
          >
            <Text style={styles.lessonText}>15</Text>
            <Text style={styles.lessonTitle}>Círculos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Transformações Geométricas' })}
          >
            <Text style={styles.lessonText}>16</Text>
            <Text style={styles.lessonTitle}>Transformações Geométricas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.lessonBox} 
            onPress={() => navigation.navigate('Ultramenu', { lessonTitle: 'Figuras e Construções Geométricas' })}
          >
            <Text style={styles.lessonText}>17</Text>
            <Text style={styles.lessonTitle}>Figuras e Construções Geométricas</Text>
          </TouchableOpacity> 
        </View>
      </View>
    </ScrollView>
  );
 
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 24,
    color: '#94A3B8',
    marginVertical: 20,
  },
  prompt: {
    fontSize: 18,
    color: '#94A3B8',
  },
  lessonContainer: {
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  lessonBox: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
  },
  lessonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  lessonTitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default HomeScreen;
