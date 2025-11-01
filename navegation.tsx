import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import Home2Screen from './Screens/home.2';
import AlgebraLessonsScreen from './Screens/AlgebraLessons';
import MathBasicLessonsScreen from './Screens/MathBasicLessons';
import MathFincLessonsScreen from './Screens/MathFincLessons';
import GeometryLessonsScreen from './Screens/GeometryLessons';
import LessonScreen from './Screens/LessonScreen';
import SettingsScreen from './Screens/Settings';
import GameScreen from './Screens/GameScreen';
import FriendsScreen from './Screens/Friends';
import UltramenuScreen from './Screens/UltramenuScreen';
import FriendDripRoast from './Screens/FriendDripRoast';
import Lobby from './Screens/Lobby';
import ChatScreen from './Screens/ChatScreen';
import FlashcardsScreen from './Screens/Flashcards/FlashcardsScreen';
import CreateFlashcardScreen from './Screens/Flashcards/CreateFlashcardScreen';
import ReviewFlashcardScreen from './Screens/Flashcards/ReviewFlashcardScreen';
import ConfiguracoesScreen from './Screens/ConfiguracoesScreen';
import QuizScreen from './Screens/Quiz/QuizScreen';
import NovoQuizScreen from './Screens/Quiz/NovoQuizScreen';
import GameQuizScreen from './Screens/Quiz/GameQuizScreen';
import QuizWaitingRoom from './Screens/Quiz/QuizWaitingRoom';
import QuizResultsScreen from './Screens/Quiz/QuizResultsScreen';
import QRScanner from './Screens/Quiz/QRScanner';
import QuizInviteNotification from './components/QuizInviteNotification';

import ChangePassword from './Screens/ChangePassword';
import AudioScreen from './Screens/Audio';
import QuestionGenerator from './components/QuestionGenerator';


import CustomTabBar from './components/3d/CustomTabBar';
import { RootStackParamList } from './types';
import AICreateFlashcardScreen from 'Screens/Flashcards/AICreateFlashcardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

interface CornhubProps {
  session: Session;
}

const HomeStack: React.FC<{ session: Session }> = ({ session }) => (
  <Stack.Navigator initialRouteName="Home2" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home2" component={Home2Screen} />
    <Stack.Screen name="GeometryLessons" component={GeometryLessonsScreen} />
    <Stack.Screen name="MathFincLessons" component={MathFincLessonsScreen} />
    <Stack.Screen name="MathBasicLessons" component={MathBasicLessonsScreen} />
    <Stack.Screen name="AlgebraLessons" component={AlgebraLessonsScreen} />
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

const QuizStack: React.FC<{ session: Session }> = ({ session }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="QuizScreen" component={QuizScreen} initialParams={{ session }} />
    <Stack.Screen name="NovoQuizScreen" component={NovoQuizScreen} initialParams={{ session }} />
    <Stack.Screen name="QRScanner" component={QRScanner} options={{ title: 'Scanner de QR' }} />
  </Stack.Navigator>
);


const FlashcardsStack: React.FC<{ session: Session }> = ({ session }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FlashcardsScreen" component={FlashcardsScreen} initialParams={{ session }} />
    <Stack.Screen name="CreateFlashcardScreen" component={CreateFlashcardScreen} initialParams={{ session }} />
    <Stack.Screen name="ReviewFlashcardScreen" component={ReviewFlashcardScreen} initialParams={{ session }} />
    <Stack.Screen
      name="AICreateFlashcardScreen"
      component={AICreateFlashcardScreen}
      initialParams={{ session }}
    />

  </Stack.Navigator>
);



const SimpleStack = (ScreenComponent: React.FC<any>, session?: Session) => () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ScreenComponent.name} component={ScreenComponent} initialParams={session ? { session } : undefined} />
  </Stack.Navigator>
);

const Tabs: React.FC<{ session: Session }> = ({ session }) => (
  <Tab.Navigator
    initialRouteName="GeometryLessons"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,

      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'home') iconName = 'home';
        else if (route.name === 'Friends') iconName = 'people';
        else if (route.name === 'Settings') iconName = 'person';
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >

    <Tab.Screen name="GeometryLessons" children={() => <HomeStack session={session} />} />
    <Tab.Screen name="MathFincLessons" children={() => <HomeStack session={session} />} />
    <Tab.Screen name="Friends" children={() => <FriendsStack session={session} />} />
    <Tab.Screen name="Exercicios" children={SimpleStack(QuestionGenerator, session)} />
    <Tab.Screen name="Quiz" children={() => <QuizStack session={session} />} />
    <Tab.Screen name="Flashcards" component={FlashcardsStack} />
    <Tab.Screen name="Configuracoes" children={SimpleStack(ConfiguracoesScreen, session)} />

    <Tab.Screen name="Settings" children={() => <SettingsScreen />} />
  </Tab.Navigator>
);

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
      <RootStack.Screen name="ChangePassword" component={ChangePassword} initialParams={{ session }} />
      <RootStack.Screen name="Audio" component={AudioScreen} initialParams={{ session }} />
    </RootStack.Navigator>

    <QuizInviteNotification userId={session.user.id} />
  </NavigationContainer>
);

export default Cornhub;