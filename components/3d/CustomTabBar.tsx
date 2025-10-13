import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Ícones SVG customizados
import HomeIcon from './icons/HomeIcon';
import ExerciciosIcon from './icons/ExerciciosIcon';
import QuizIcon from './icons/QuizIcon';
import DesempenhoIcon from './icons/DesempenhoIcon';
import PeopleIcon from './icons/PeopleIcon';
import PersonIcon from './icons/PersonIcon';
import MenuIcon from './icons/MenuIcon';
import FlashcardsIcon from './icons/FlashcardsIcon';
import ConfiguracoesIcon from './icons/ConfiguracoesIcon';
import SairIcon from './icons/SairIcon';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  // Função para abrir/fechar o menu
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Função para navegar a partir do menu
  const handleMenuNavigation = (routeName: string) => {
    setMenuVisible(false);
    
    // Verifica se a rota existe antes de navegar
    const routeExists = state.routes.some(route => route.name === routeName);
    
    if (routeExists) {
      navigation.navigate(routeName);
    } else {
      console.warn(`Rota "${routeName}" não encontrada.`);
    }
  };

  // Função auxiliar para verificar se a rota está ativa
  const isRouteActive = (routeName: string) => {
    return state.routes.some((route, index) => 
      route.name === routeName && state.index === index
    );
  };

  return (
    <View style={styles.container}>
      {/* Modal do Menu (a telinha com opções secundárias) */}
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
            {/* Opções do menu */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Exercicios')}
            >
              <ExerciciosIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Exercícios</Text>
            </TouchableOpacity>   

            {/* DESEMPENHO AGORA COM ÍCONE DO QUIZ */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Desempenho')}
            >
              <QuizIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Desempenho</Text>
            </TouchableOpacity>

            {/* QUIZ AGORA COM ÍCONE DO DESEMPENHO */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Quiz')}
            >
              <DesempenhoIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuNavigation('Settings')}
            >
              <PersonIcon size={24} color="#1f1f1fff" />
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>            
            
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

      {/* Retângulo flutuante com bordas arredondadas */}
      <View style={styles.floatingRectangle}>
        <View style={styles.tabBar}>
          {/* Botão Home */}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Home')}
          >
            <HomeIcon 
              size={34} 
              color={isRouteActive('Home') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          {/* Botão Exercícios */}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Exercicios')}
          >
            <ExerciciosIcon 
              size={34} 
              color={isRouteActive('Exercicios') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          {/* Botão Quiz */}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Quiz')}
          >
            <QuizIcon 
              size={34} 
              color={isRouteActive('Quiz') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          {/* Botão Desempenho */}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate('Desempenho')}
          >
            <DesempenhoIcon 
              size={34} 
              color={isRouteActive('Desempenho') ? '#1f1f1fff' : '#cfd8dc'}
            />
          </TouchableOpacity>

          {/* Botão Menu */}
          <TouchableOpacity style={styles.tab} onPress={toggleMenu}>
            <MenuIcon size={34} color={menuVisible ? '#1f1f1fff' : '#cfd8dc'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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

  // Estilos para o Menu Modal
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
});

export default CustomTabBar;  