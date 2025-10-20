import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const Home2Screen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [username, setUsername] = useState('');
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
  }, []);

  // calculate dynamic box size
  const boxWidth = width > 500 ? 400 : width * 0.9; // max width 400, otherwise 90% of screen

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
      
      <Text style={styles.title}>MathCore</Text>
      <Text style={styles.prompt}>O que vamos aprender hoje, {username}?</Text>

      <View style={styles.verticalGrid}>
        {/* Geometria */}
        <TouchableOpacity
          style={[styles.box, { backgroundColor: '#731dca', width: boxWidth, height: 200 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.textBox}>Geometria</Text>
          <Ionicons name="shapes" size={80} style={{ marginTop: 10 }} />
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
          style={[styles.box, { backgroundColor: '#4b843d', width: boxWidth, height: 200 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.textBox}>Matemática Financeira</Text>
          <Entypo name="bar-graph" size={80} style={{ marginTop: 10 }} />
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
          style={[styles.box, { backgroundColor: '#5c1dcb', width: boxWidth, height: 200 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.textBox}>Matemática Básica</Text>
          <MaterialCommunityIcons name="division" size={80} style={{ marginTop: 10 }} />
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
          style={[styles.box, { backgroundColor: '#2c3c92', width: boxWidth, height: 200 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.textBox}>Álgebra</Text>
          <FontAwesome5 name="square-root-alt" size={80} style={{ marginTop: 10 }} />
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
  );
};

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
