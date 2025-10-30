import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ConfiguracoesScreen({ navigation }: any) {
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
    {
      IconComponent: MaterialIcons,
      iconName: 'assignment',
      label: 'Área TEA',
      screen: 'AreaTEA',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const Icon = item.IconComponent;
          return (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.iconLabelContainer}>
                <Icon name={item.iconName as any} size={24} color="#1e293b" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5b6b85',
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 100,
    alignSelf: 'flex-start',
    marginTop: -20,
    marginLeft: 20,
  },
  menuContainer: {
    gap: 12,
    width: '85%',
    marginTop: 20,
  },
  menuButton: {
    backgroundColor: '#c5d0e6',
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
    color: '#1e293b',
  },
  arrow: {
    fontSize: 28,
    color: '#1e293b',
    fontWeight: '300',
  },
});