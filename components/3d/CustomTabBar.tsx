import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Ícones SVG customizados
import HomeIcon from './icons/HomeIcon';
import ExerciciosIcon from './icons/ExerciciosIcon';
import DesempenhoIcon from './icons/DesempenhoIcon';
import QuizIconSecundario from './icons/QuizIconSecundario.js';
import PeopleIcon from './icons/PeopleIcon';
import PersonIcon from './icons/PersonIcon';
import MenuIcon from './icons/MenuIcon';
import FlashcardsIcon from './icons/FlashcardsIcon';
import ConfiguracoesIcon from './icons/ConfiguracoesIcon';
import SairIcon from './icons/SairIcon';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const activeTabRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(activeTabRoute) ?? '';
  const screensToHideTabBar = ['NovoQuizScreen', 'GameQuizScreen'];

  if (screensToHideTabBar.includes(focusedRouteName)) {
    return null;
  }
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  const handleMenuNavigation = (routeName: string) => {
    setMenuVisible(false);
    const routeExists = state.routes.some(route => route.name === routeName);
    if (routeExists) {
      navigation.navigate(routeName);
    } else {
      console.warn(`Rota "${routeName}" não encontrada.`);
    }
  };

  const isRouteActive = (routeName: string) => {
    return state.routes.some((route, index) => 
      route.name === routeName && state.index === index
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Settings')}
            >
              <PersonIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity> 

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Exercicios')}
            >
              <ExerciciosIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Exercícios</Text>
            </TouchableOpacity>   

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Quiz')}
            >
              <QuizIconSecundario size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Desempenho')}
            >
              <DesempenhoIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Desempenho</Text>
            </TouchableOpacity>           
            
            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Flashcards')}
            >
              <FlashcardsIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Flashcards</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Friends')}
            >
              <PeopleIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Social</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Configuracoes')}
            >
              <ConfiguracoesIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Sair')}
            >
              <SairIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.floatingRectangle}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Home')}
          >
            <HomeIcon 
              size={34} 
              color={isRouteActive('Home') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Exercicios')}
          >
            <ExerciciosIcon 
              size={34} 
              color={isRouteActive('Exercicios') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Quiz')}
          >
            <View style={[
              styles.quizImageContainer,
              isRouteActive('Quiz') ? styles.quizImageActive : styles.quizImageInactive
            ]}>
              <Image
                source={require('../../assets/quiz-icon.png')}
                style={styles.quizImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Desempenho')}
          >
            <DesempenhoIcon 
              size={34} 
              color={isRouteActive('Desempenho') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={toggleMenu}>
            <MenuIcon size={34} color={menuVisible ? '#1f1f1fff' : '#cfd8dc'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 0,
  },
  floatingRectangle: {
    backgroundColor: '#404564ff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 25,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  quizImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 32.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizImageActive: {
    backgroundColor: '#1f1f1fff',
  },
  quizImageInactive: {
    backgroundColor: '#cfd8dc',
  },
  quizImage: {
    width: '85%',
    height: '85%',
    borderRadius: 72,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
    zIndex: 1000,
  },
  menuContainer: {
    backgroundColor: '#404564ff',
    marginHorizontal: 100,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    alignSelf: 'center',
    minWidth: 400,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuText: {
    color: '#000000ff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '700',
  },
  separator: {
    height: 8,
    backgroundColor: '#23273dff',
    marginVertical: 3,
    marginHorizontal: 5,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default CustomTabBar;