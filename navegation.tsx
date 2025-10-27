import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import Home2Screen from './Screens/home.2';
import HomeScreen from './Screens/home';
import LessonScreen from './Screens/LessonScreen';
import SettingsScreen from './Screens/Settings';
import GameScreen from './Screens/GameScreen';
import FriendsScreen from './Screens/Friends';
import UltramenuScreen from './Screens/UltramenuScreen';
import FriendDripRoast from './Screens/FriendDripRoast';
import Lobby from './Screens/Lobby';
import ChatScreen from './Screens/ChatScreen';
import ExerciciosScreen from './Screens/ExerciciosScreen';
import DesempenhoScreen from './Screens/DesempenhoScreen';
import FlashcardsScreen from './Screens/FlashcardsScreen';
import ConfiguracoesScreen from './Screens/ConfiguracoesScreen';
import QuizScreen from './Screens/Quiz/QuizScreen';
import NovoQuizScreen from './Screens/Quiz/NovoQuizScreen';
import GameQuizScreen from './Screens/Quiz/GameQuizScreen';
import QuizWaitingRoom from './Screens/Quiz/QuizWaitingRoom';
import QuizResultsScreen from './Screens/Quiz/QuizResultsScreen';
import QRScanner from './Screens/Quiz/QRScanner';
import QuizInviteNotification from './components/QuizInviteNotification';

import CustomTabBar from './components/3d/CustomTabBar';
import { RootStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

interface CornhubProps {
  session: Session;
}

// Stacks para Home e Friends
const HomeStack: React.FC<{ session: Session }> = ({ session }) => (
  <Stack.Navigator initialRouteName="Home2" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home2" component={Home2Screen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Ultramenu" component={UltramenuScreen} />
    <Stack.Screen name="Lesson" component={LessonScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="GameScreen" component={GameScreen} options={{ presentation: 'modal' }} />
  </Stack.Navigator>
);

const FriendsStack: React.FC<{ session: Session }> = ({ session }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FriendsScreen" component={FriendsScreen} initialParams={{ session }} />
    <Stack.Screen name="FriendDripRoast" component={FriendDripRoast} initialParams={{ session }} />
  </Stack.Navigator>
);

// --- QUIZSTACK ---
const QuizStack: React.FC<{ session: Session }> = ({ session }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="QuizScreen" component={QuizScreen} initialParams={{ session }} />
    <Stack.Screen name="NovoQuizScreen" component={NovoQuizScreen} initialParams={{ session }} />
    <Stack.Screen name="QRScanner" component={QRScanner} options={{ title: 'Scanner de QR' }} />
  </Stack.Navigator>
);

// Stacks simples
const SimpleStack = (ScreenComponent: React.FC<any>, session?: Session) => () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ScreenComponent.name} component={ScreenComponent} initialParams={session ? { session } : undefined} />
  </Stack.Navigator>
);

// Navegação por Tabs
const Tabs: React.FC<{ session: Session }> = ({ session }) => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,

      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Friends') iconName = 'people';
        else if (route.name === 'Settings') iconName = 'person';
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" children={() => <HomeStack session={session} />} />
    <Tab.Screen name="Friends" children={() => <FriendsStack session={session} />} />
    <Tab.Screen name="Exercicios" children={SimpleStack(ExerciciosScreen, session)} />
    <Tab.Screen name="Desempenho" children={SimpleStack(DesempenhoScreen, session)} />
    <Tab.Screen name="Quiz" children={() => <QuizStack session={session} />} />
    <Tab.Screen name="Flashcards" children={SimpleStack(FlashcardsScreen, session)} />
    <Tab.Screen name="Configuracoes" children={SimpleStack(ConfiguracoesScreen, session)} />
    <Tab.Screen name="Settings" children={() => <SettingsScreen />} />
  </Tab.Navigator>
);

// RootStack
const RootStack = createNativeStackNavigator();

const Cornhub: React.FC<CornhubProps> = ({ session }) => (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" children={() => <Tabs session={session} />} />
      <RootStack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={{ tabBarStyle: { display: 'none' } }}
      />
      <RootStack.Screen name="Lobby" component={Lobby} initialParams={{ session }} options={{ presentation: 'modal' }} />
      <RootStack.Screen name="GameQuizScreen" component={GameQuizScreen} />
      <RootStack.Screen name="QuizWaitingRoom" component={QuizWaitingRoom} />
      <RootStack.Screen name="QuizResultsScreen" component={QuizResultsScreen} />
    </RootStack.Navigator>
    
    {/* ✅ NOTIFICAÇÃO DENTRO DO NavigationContainer */}
    <QuizInviteNotification userId={session.user.id} />
  </NavigationContainer>
);

export default Cornhub;