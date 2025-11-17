import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; // --- IMPORTAÇÃO ADICIONADA ---

// --- DEFINIÇÃO DOS TEMAS (ALTERADO: background virou gradient) ---
const themes = {
  padrao: {
    name: 'Padrão',
    gradient: ['#242948', '#5C6494'], // Antes era background: '#2E2F47'
    card: '#4A4C70',
    text: '#ddddddff',
    primary: '#3B82F6',
  },
  altoContraste: {
    name: 'Alto Contraste',
    gradient: ['#000000', '#1a1a1a'], // Antes era background: '#000000'
    card: '#2a2a2a',
    text: '#FFFFFF',
    primary: '#FFFF00',
  },
  Vermelho: {
    name: 'Vermelho',
    gradient: ['#482424ff', '#945c5cff'], // Antes era background: '#2E2F47'
    card: '#704a4aff',
    text: '#ddddddff',
    primary: '#f63b3bff',
  },
  Laranja: {
    name: 'Laranja',
    gradient: ['#483724ff', '#94805cff'], // Antes era background: '#2E2F47'
    card: '#70644aff',
    text: '#ddddddff',
    primary: '#f6ab3bff',
  },
  Amarelo: {
    name: 'Amarelo',
    gradient: ['#464824ff', '#93945cff'], // Antes era background: '#2E2F47'
    card: '#6a704aff',
    text: '#ddddddff',
    primary: '#e3f63bff',
  },
  Verde: {
    name: 'Verde',
    gradient: ['#274824ff', '#5c945fff'], // Antes era background: '#2E2F47'
    card: '#4a704cff',
    text: '#ddddddff',
    primary: '#4bf63bffff',
  },
  azulClaro: {
    name: 'Azul Claro',
    gradient: ['#5b6b85', '#93a5c5'], // Antes era background: '#93a5c5'
    card: '#e8ecf5',
    text: '#1e293b',
    primary: '#0EA5E9',
  },
  azulEscuro: {
    name: 'Azul Escuro',
    gradient: ['#444dbeff', '#223a88ff'], // Antes era background: '#93a5c5'
    card: '#1e4dbbff',
    text: '#ffffffff',
    primary: '#1d0ee9ff',
  },
  roxo: {
    name: 'Roxo',
    gradient: ['#50265fff', '#753e7cff'], // Antes era background: '#1d2033'
    card: '#8627acff',
    text: '#FFFFFF',
    primary: '#dc5cf6ff',
  },
  ciano: {
    name: 'Ciano',
    gradient: ['#808080', '#A9A9A9'], // Antes era background: '#1d2033'
    card: '#313131ff',
    text: '#FFFFFF',
    primary: '#bbbbbbff',
  },
}

export default function ConfiguracoesScreen({ navigation }: any) {
  const [currentTheme, setCurrentTheme] = useState('padrao')
  const [showThemeModal, setShowThemeModal] = useState(false)

  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme')
        if (savedTheme && themes[savedTheme as keyof typeof themes]) {
          setCurrentTheme(savedTheme)
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error)
      }
    }
    loadTheme()
  }, [])

  const changeTheme = async (themeKey: string) => {
    setCurrentTheme(themeKey)
    setShowThemeModal(false)
    try {
      await AsyncStorage.setItem('app_theme', themeKey)
    } catch (error) {
      console.log('Erro ao salvar tema:', error)
    }
  }

  const theme = themes[currentTheme as keyof typeof themes]

  const menuItems = [
    {
      IconComponent: Ionicons,
      iconName: 'person-outline',
      label: 'Conta',
      screen: 'Settings',
    },
    {
      IconComponent: MaterialIcons,
      iconName: 'lock-outline',
      label: 'Senha',
      screen: 'ChangePassword',
    },
    {
      IconComponent: Ionicons,
      iconName: 'volume-high-outline',
      label: 'Áudio',
      screen: 'Audio',
    },
  ];

  // --- ALTERAÇÃO PRINCIPAL: View substituída por LinearGradient ---
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradient} // Usando a nova propriedade gradient
        locations={[0.65, 0.30]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={styles.container}
      >
        <TouchableOpacity 
          style={styles.themeButton}
          onPress={() => setShowThemeModal(true)}
        >
          <Ionicons name="color-palette" size={28} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: 'white' }]}>Configurações</Text>
        
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.IconComponent;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuButton, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.iconLabelContainer}>
                  <Icon name={item.iconName as any} size={24} color={theme.text} />
                  <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                </View>
                <Text style={[styles.arrow, { color: theme.text }]}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Modal de tema permanece dentro do LinearGradient */}
        <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowThemeModal(false)}
          >
            <View style={[styles.themeModalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha um Tema</Text>
              
              <ScrollView style={styles.themeList}>
                {Object.entries(themes).map(([key, themeOption]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.themeOption,
                      { 
                        backgroundColor: themeOption.gradient[0], // Usando primeira cor do gradiente
                        borderColor: currentTheme === key ? themeOption.primary : 'transparent',
                      }
                    ]}
                    onPress={() => changeTheme(key)}
                  >
                    <Text style={[styles.themeName, { color: themeOption.text }]}>{themeOption.name}</Text>
                    <View style={styles.colorPreview}>
                      <View style={[styles.colorSwatch, { backgroundColor: themeOption.gradient[0] }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeOption.card }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeOption.primary }]} />
                    </View>
                    {currentTheme === key && (
                      <Ionicons name="checkmark-circle" size={24} color={themeOption.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 90,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  themeButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 100,
    alignSelf: 'flex-start',
    color: 'black',
    marginTop: -20,
    marginLeft: 20,
  },
  menuContainer: {
    gap: 12,
    width: '85%',
    marginTop: -50,
    marginBottom: 90,
  },
  menuButton: {
    borderRadius: 16,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeList: {
    maxHeight: 350,
  },
  themeOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
});