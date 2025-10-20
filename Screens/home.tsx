import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, MaterialIcons, Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Importando dados das lições
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

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;


function Accordion() {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.SobreBox}>
        <TouchableOpacity style={styles.GeometriaPlana} onPress={() => setOpen(!open)}>
          <Text style={styles.title}>Geometria Plana</Text>
          <MaterialIcons name={open ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={85} color="black" style={{ marginEnd: 30 }} />
        </TouchableOpacity>

        {open && (
          <ScrollView style={styles.scrollLesson} showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.lessonContainer}>
              <View style={styles.row}>
                {/* ✅ Quadrados agora vai direto para Lesson */}
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Quadrados' })}
                >
                  <Text style={styles.lessonTitle}>Quadrados</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Triângulos' })}
                >
                  <Text style={styles.lessonTitle}>Triângulos</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Retângulos' })}
                >
                  <Text style={styles.lessonTitle}>Retângulos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Losangos' })}
                >
                  <Text style={styles.lessonTitle}>Losangos</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Trapézios' })}
                >
                  <Text style={styles.lessonTitle}>Trapézios</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Paralelogramos' })}
                >
                  <Text style={styles.lessonTitle}>Paralelogramos</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Pentágonos' })}
                >
                  <Text style={styles.lessonTitle}>Pentágonos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Hexágonos' })}
                >
                  <Text style={styles.lessonTitle}>Hexágonos</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Heptágonos' })}
                >
                  <Text style={styles.lessonTitle}>Heptágonos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Octágonos' })}
                >
                  <Text style={styles.lessonTitle}>Octágonos</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Polígonos' })}
                >
                  <Text style={styles.lessonTitle}>Polígonos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Teorema de Tales' })}
                >
                  <Text style={styles.lessonTitle}>Teorema de Tales</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Ângulos' })}
                >
                  <Text style={styles.lessonTitle}>Ângulos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Congruência e Semelhança de Figuras' })}
                >
                  <Text style={styles.lessonTitle}>Congruência e Semelhança de Figuras</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Círculos' })}
                >
                  <Text style={styles.lessonTitle}>Círculos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Transformações Geométricas' })}
                >
                  <Text style={styles.lessonTitle}>Transformações Geométricas</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Figuras e Construções Geométricas' })}
                >
                  <Text style={styles.lessonTitle}>Figuras e Construções Geométricas</Text>
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
            <Text style={styles.title}>GEOMETRIA</Text>
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
  GeometriaPlana: {
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
