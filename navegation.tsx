import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home2Screen from './Screens/home.2';// Certifique-se de que o caminho está correto
import HomeScreen from './Screens/home'; // Certifique-se de que o caminho está correto
import LessonScreen from './Screens/LessonScreen'; // Certifique-se de que o caminho está correto

import SettingsScreen from './Screens/Settings';
import GameScreen from './Screens/GameScreen'; 
import FriendsScreen from './Screens/Friends';
import UltramenuScreen from './Screens/UltramenuScreen';
import FriendDripRoast from './Screens/FriendDripRoast';
import { Session } from '@supabase/supabase-js';
import { RootStackParamList } from './types';
import LobbyScreen from './Screens/Lobby';
import ChatScreen from './Screens/ChatScreen';
import CustomTabBar from './components/3d/CustomTabBar';

// Telas em desenvolvimento
import ExerciciosScreen from './Screens/ExerciciosScreen';
import DesempenhoScreen from './Screens/DesempenhoScreen';
import FlashcardsScreen from './Screens/FlashcardsScreen';
import ConfiguracoesScreen from './Screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

interface CornhubProps {
  session: Session;
}

// Stack para Home
const HomeStack: React.FC<{ session: Session }> = ({ session }) => {
  return (

    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Ultramenu" component={UltramenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="Lobby" component={LobbyScreen} options={{ presentation: 'modal', headerShown: false }} initialParams={{ session }} />
      <Stack.Screen name="GameScreen" component={GameScreen} options={{ presentation: 'modal', headerShown: false }} />
    </Stack.Navigator>
  );
};

// Stack para Friends
const FriendsStack: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <Stack.Navigator initialRouteName="FriendsScreen">
      <Stack.Screen name="FriendsScreen" component={FriendsScreen} initialParams={{ session }} options={{ headerShown: false }} />
      <Stack.Screen name="FriendDripRoast" component={FriendDripRoast} initialParams={{ session }} options={{ headerShown: false }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} initialParams={{ session }} options={{ headerShown: false }} />
      <Stack.Screen name="Lobby" component={LobbyScreen} initialParams={{ session }} options={{ presentation: 'modal', headerShown: false }} />

    </Stack.Navigator>
  );
};

// Stacks simples para as futuras telas
const ExerciciosStack: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExerciciosScreen" component={ExerciciosScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const DesempenhoStack: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DesempenhoScreen" component={DesempenhoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const FlashcardsStack: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FlashcardsScreen" component={FlashcardsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const ConfiguracoesStack: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ConfiguracoesScreen" component={ConfiguracoesScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// Navegação por Tabs
const Cornhub: React.FC<CornhubProps> = ({ session }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home2"  
        tabBar={(props) => <CustomTabBar {...props} />}

        screenOptions={{ headerShown: false }}

        screenOptions={({ route  }) => ({
          
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home2') {
              iconName = 'home2';
            } else if (route.name === 'Settings') {
              iconName = 'person';
            } else if (route.name === 'Friends') {
              iconName = 'people';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },

          headerShown: false,  // Oculta o cabeçalho
       // Adiciona animação de transição apenas nas telas Home, Friends e Settings
       
    })}
      

      >
        {/* Rotas principais */}
        <Tab.Screen name="Friends" children={() => <FriendsStack session={session} />} />
        <Tab.Screen name="Home" children={() => <HomeStack session={session} />} />
        <Tab.Screen name="Exercicios" children={() => <ExerciciosStack session={session} />} />
        <Tab.Screen name="Desempenho" children={() => <DesempenhoStack session={session} />} />
        

        {/* Rotas do menu */}
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Flashcards" children={() => <FlashcardsStack session={session} />} />
        <Tab.Screen name="Configuracoes" children={() => <ConfiguracoesStack session={session} />} />

        <Tab.Screen
          name="Friends"
          children={() => <FriendsStack session={session} />}
        />
        <Tab.Screen
          name="Home2"
          children={() => <HomeStack session={session} />}
        />
        <Tab.Screen
          name="Settings"
          children={() => <SettingsScreen session={session} />}
        />

      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Cornhub;