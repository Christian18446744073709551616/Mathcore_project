import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vraiuldcpusrhhabqgaq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYWl1bGRjcHVzcmhoYWJxZ2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0MjA3NDAsImV4cCI6MjAzNzk5Njc0MH0.fdoHoz1W_uvf8H2J9kGpGXFIc_rDc-6Z-vG_Czjl8LY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Configurar canal para um chat específico
export const setupChatChannel = (
  roomId: string,
  onMessageReceived: (message: any) => void
) => {
  const channel = supabase
    .channel(`chat:${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      onMessageReceived(payload.new);
    })
    .subscribe();

  return channel;
};

// Definindo tipos para os parâmetros
export const setupPresenceChannel = (
  onPresenceUpdate: (userPresence: any) => void
) => {
  const channel = supabase
    .channel('presence:app')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
      onPresenceUpdate(payload.new);
    })
    .subscribe();

  return channel;
};

export const setupLobbyChannel = (
  userId: string,
  onInviteReceived: (invite: any) => void
) => {
  const channel = supabase
    .channel(`lobby_invites:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'lobby_participants',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onInviteReceived(payload.new);
      }
    )
    .subscribe();

  return channel;
};

// ===== NOVAS FUNÇÕES PARA QUIZ =====

// Configurar canal para convites de quiz
export const setupQuizInviteChannel = (
  userId: string,
  onInviteReceived: (invite: any) => void
) => {
  const channel = supabase
    .channel(`quiz_invites:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        // Filtra apenas convites de quiz
        if (payload.new.message_type === 'quiz_invitation') {
          onInviteReceived(payload.new);
        }
      }
    )
    .subscribe();

  return channel;
};

// Canal para sincronizar participantes do quiz
export const setupQuizMatchChannel = (
  matchId: string,
  onParticipantUpdate: (participant: any) => void
) => {
  const channel = supabase
    .channel(`quiz_match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quiz_participants',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onParticipantUpdate(payload);
      }
    )
    .subscribe();

  return channel;
};