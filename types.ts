// types.ts
import { ParamListBase } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';

export type RootStackParamList = {
  Home: undefined;
  Ultramenu: { lessonTitle: string };
  Settings: { session: any };
  Friends: { session: any };
  FriendDripRoast: {  friendId: string; session: any ; };
  ChatScreen: { friendId: string; friendName: string; session: any; lessonTitle: string, lobbyId: string; };
  Lesson: {  lessonTitle: string , session: any, currentIndex: number};
  Lobby: {  lessonTitle: string, lobbyId: string; session: any };
  GameScreen: { lobbyId: string; lessonTitle: string; session: any }; // Atualize para GameScreen

};



