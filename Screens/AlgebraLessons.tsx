import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { AntDesign, MaterialIcons, Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Importando dados das lições
import ExemploIntroducaoFuncaoAfimData from '../Vsauces/algebraCont/IntroducaoFuncaoAfim.json';
import ExemploNocoesFuncaoData from '../Vsauces/algebraCont/NocaoFuncao.json';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MathBasicLessons'>;


function Accordion() {
  const [openOperAlgebra, setOpenAlgebram] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      
      <View style={styles.SobreBox}>
        <TouchableOpacity style={styles.Estatistica} onPress={() => setOpenAlgebram(!openOperAlgebra)}>
  <Text style={styles.title}>Álgebra Elementar</Text>
  <MaterialIcons name={openOperAlgebra ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={85} color="black" style={{ marginEnd: 30 }} />
</TouchableOpacity>

{openOperAlgebra && (
          <ScrollView style={styles.scrollLesson} showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.lessonContainer}>
              <View style={styles.row}>
                {/* ✅ Quadrados agora vai direto para Lesson */}
                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Noções da função' })}
                >
                  <Text style={styles.lessonTitle}>Noções da função</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.lessonBox}
                  onPress={() => navigation.navigate('Lesson', { lessonTitle: 'Introdução da Função Afim' })}
                >
                  <Text style={styles.lessonTitle}>Introdução da Função Afim</Text>
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
            <Text style={styles.title}>Matemática Básica</Text>
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
