import { supabase } from '../lib/supabase';

interface Lobby {
  id: string;
  lobby_name: string;
}

// Criar um novo lobby
export const createLobby = async (lessonTitle: string): Promise<Lobby> => {
  const { data, error } = await supabase
    .from('lobbies')
    .insert([{ lobby_name: lessonTitle }])
    .single();

  if (error) {
    throw new Error(`Erro ao criar lobby: ${error.message}`);
  }

  return data;
};

// Adicionar um jogador ao lobby
export async function addPlayerToLobby(lobbyId: string, userId: string, username: string) {
  const { data, error } = await supabase
    .from('lobby_players')
    .insert([{ lobby_id: lobbyId, user_id: userId, username }]); // Armazena o username

  if (error) {
    console.error('Erro ao adicionar jogador ao lobby:', error.message);
    return null;
  }

  return data;
}

// Obter jogadores de um lobby
export const getLobbyPlayers = async (lobbyId: string) => {
  const { data, error } = await supabase
    .from('lobby_players')
    .select('user_id, username')
    .eq('lobby_id', lobbyId);

  if (error) {
    throw new Error(`Erro ao obter jogadores: ${error.message}`);
  }

  return data;
};

// Excluir um lobby
export const deleteLobby = async (lobbyId: string) => {
  const { error } = await supabase
    .from('lobbies')
    .delete()
    .eq('id', lobbyId);

  if (error) {
    throw new Error(`Erro ao deletar lobby: ${error.message}`);
  }
};

// Atualizar o status de "pronto" do jogador
export async function updatePlayerReadyStatus(lobbyId: string, userId: string, isReady: boolean) {
  const { data, error } = await supabase
    .from('lobby_players')
    .update({ is_ready: isReady })
    .eq('lobby_id', lobbyId)
    .eq('user_id', userId);

  if (error) {
    console.error('Erro ao atualizar status de pronto:', error.message);
    return null;
  }

  return data;
}

// Verificar se todos os jogadores estão prontos
export async function areAllPlayersReady(lobbyId: string) {
  const { data, error } = await supabase
    .from('lobby_players')
    .select('is_ready')
    .eq('lobby_id', lobbyId);

  if (error) {
    console.error('Erro ao verificar status de jogadores:', error.message);
    return null;
  }

  return data.every((player) => player.is_ready);
}
