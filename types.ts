// types.ts
import { ParamListBase } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';

// Interfaces para Quiz
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export type RootStackParamList = {
  Home: undefined;
  Ultramenu: { lessonTitle: string };
  Settings: { session: any };
  Friends: { session: any };
  FriendDripRoast: { friendId: string; session: any };
  ChatScreen: { friendId: string; friendName: string; session: any; lessonTitle: string; lobbyId: string };
  Lesson: { lessonTitle: string; session: any; currentIndex: number };
  Lobby: { lessonTitle: string; lobbyId: string; session: any };
  GameScreen: { lobbyId: string; lessonTitle: string; session: any };
  
  // ===== NOVAS ROTAS PARA QUIZ =====
  QuizScreen: { session: any; type?: string; quizId?: string; quiz?: Quiz };
  NovoQuizScreen: { session: any; quizToEdit?: Quiz | null };
  GameQuizScreen: { 
    quizData: Quiz; 
    mode?: 'solo' | 'multiplayer';
    matchId?: string;
  };
  QuizWaitingRoom: { matchId: string; quizId?: string; quizTitle?: string };
  QuizResultsScreen: {
  matchId: string;
  quizTitle: string;
  myFinishTime: string;
};
  QRScanner: undefined;
};