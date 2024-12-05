import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {/* Gradient for the curved top */}
      <LinearGradient
        colors={['#2a2d4b', '#141a35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.curvedTop}
      />

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Determine the icon for each route
          const iconName =
            route.name === 'Home'
              ? 'home-outline'
              : route.name === 'Settings'
              ? 'person-outline'
              : 'people-outline';

          // Function to handle tab press
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
          
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name); // Navegar para a rota clicada
            }
          };
          

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused ? styles.selectedTab : null]}
            >
              <View
                style={[
                  styles.iconCircle,
                  isFocused ? styles.iconCircleSelected : null,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={28}
                  color="#cfd8dc"
                />
              </View>
              <Text style={{ color: isFocused ? '#bb86fc' : '#cfd8dc' }}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 90,
    backgroundColor: '#121212',
  },
  curvedTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: -1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 2,
    borderTopColor: '#3d5afe',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingTop: 15,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#283593',
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  iconCircleSelected: {
    backgroundColor: '#3d5afe',
    transform: [{ translateY: -5 }],
  },
  selectedTab: {
    transform: [{ scale: 1.1 }],
  },
});

export default CustomTabBar;
