import React from 'react';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Screens/home'; // Certifique-se de que o caminho está correto
import LessonScreen from './Screens/LessonScreen'; // Certifique-se de que o caminho está correto
import SettingsScreen from './Screens/Settings';
import GameScreen from './Screens/GameScreen'; 
import FriendsScreen from './Screens/Friends';
import UltramenuScreen from './Screens/UltramenuScreen';
import FriendDripRoast from './Screens/FriendDripRoast';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { RootStackParamList } from './types';
import LobbyScreen from './Screens/Lobby';
import ChatScreen from './Screens/ChatScreen';
import CustomTabBar from './components/3d/CustomTabBar';  // Import the custom tab bar

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

interface CornhubProps {
  session: Session;
}




// Navegação por Stack para Home e Lesson
const HomeStack: React.FC<{ session: Session }> = ({ session }) => {
  return (

    <Stack.Navigator initialRouteName="Home">

      <Stack.Screen name="Home" component={HomeScreen}  
      options={{
        
          headerShown: false, 
          
        }}  />
      <Stack.Screen name="Ultramenu" component={UltramenuScreen}
      options={{
          headerShown: false,      // Oculta o header
        }}  /> 
      <Stack.Screen name="Lesson" component={LessonScreen} options={{
          presentation: 'modal',   // Define como modal para tela cheia
          headerShown: false,       // Oculta o header
        }}  />
      <Stack.Screen 
        name="Lobby" 
        component={LobbyScreen}
        options={{
          presentation: 'modal',   // Define como modal para tela cheia
          headerShown: false,       // Oculta o header
        }} 
        initialParams={{ session }} // Passa session para LobbyScreen
      />
        <Stack.Screen 
        name="GameScreen" 
        component={GameScreen} 
        options={{
          presentation: 'modal',   // Define como modal para tela cheia
          headerShown: false,       // Oculta o header
        }} 
      />
    </Stack.Navigator>
  );
};



// Navegação por Stack para Friends e FriendDripRoast
const FriendsStack: React.FC<{ session: Session }> = ({ session }) => {
  return (
    <Stack.Navigator initialRouteName="FriendsScreen">
      <Stack.Screen
        name="FriendsScreen"
        component={FriendsScreen}
        initialParams={{ session }} // Passa session para FriendsScreen
        options={{ title: 'Friends' , headerShown: false
          
        }} // Definir o título da tela
      />
      <Stack.Screen
        name="FriendDripRoast"
        component={FriendDripRoast}
        initialParams={{ session }} // Passa session para FriendDripRoast
        options={{ title: 'Friend Details' , headerShown: false }} // Título da tela de detalhes
        
      />
       <Stack.Screen name="ChatScreen" component={ChatScreen} 
        initialParams={{ session }} // Passa session para FriendsScreen
        options={{ title: 'Chat', headerShown: false }}
       />
         <Stack.Screen 
        name="Lobby" 
        component={LobbyScreen} // Corrigido para usar component em vez de getComponent
        initialParams={{ session }} // Passa session para LobbyScreen
        options={{
          presentation: 'modal',   // Define como modal para tela cheia
          headerShown: false,       // Oculta o header
        }}
      />
    </Stack.Navigator>
  );
};

// Navegação por Tabs, incluindo os stacks definidos
const Cornhub: React.FC<CornhubProps> = ({ session }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"  
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={({ route  }) => ({
          
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
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
        
        <Tab.Screen
          name="Friends"
          children={() => <FriendsStack session={session} />}
        />
        <Tab.Screen
          name="Home"
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
