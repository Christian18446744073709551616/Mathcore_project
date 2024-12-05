import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { PostgrestResponse } from '@supabase/postgrest-js';
const supabaseUrl = 'https://vraiuldcpusrhhabqgaq.supabase.co'
const supabaseAnonKey = ''

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
  onMessageReceived: (message: any) => void // Substitua 'any' pelo tipo específico da mensagem, se houver
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
  onPresenceUpdate: (userPresence: any) => void // Substitua 'any' pelo tipo específico da presença, se houver
) => {
  const channel = supabase
    .channel('presence:app')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
      onPresenceUpdate(payload.new);
    })
    .subscribe();

  return channel;
};

// Configurar canal para um lobby específico
