import { supabase } from '../lib/supabase';

// Adicionar um amigo (solicitação de amizade)
export async function addFriend(userId: string, friendId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ user_id: userId, friend_id: friendId, accepted: false }]);

  if (error) {
    console.error('Error adding friend:', error.message);
    return null;
  }
  
  return data;
}

// Remover um amigo ou cancelar uma solicitação
export async function removeFriend(userId: string, friendId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .match({ user_id: userId, friend_id: friendId });

  if (error) {
    console.error('Error removing friend (first call):', error.message);
    return null;
  }

  const { error: secondError } = await supabase
    .from('friendships')
    .delete()
    .match({ user_id: friendId, friend_id: userId });

  if (secondError) {
    console.error('Error removing friend (second call):', secondError.message);
    return null;
  }

  return true; // ou retornar os dados se necessário
}


// Aceitar uma solicitação de amizade (e criar amizade mútua)
export async function acceptFriendRequest(userId: string, friendId: string) {
  try {
    // Atualiza a solicitação original para "aceito"
    const { data: updateData, error: updateError } = await supabase
      .from('friendships')
      .update({ accepted: true })
      .eq('user_id', friendId)
      .eq('friend_id', userId);

    if (updateError) {
      console.error('Erro ao aceitar pedido de amizade:', updateError.message);
      return null;
    }

    // atualiza o segundo registro invertendo user_id e friend_id para garantir a amizade mútua
    const { data: insertData, error: insertError } = await supabase
    .from('friendships')
    .update({ accepted: true })
    .eq('user_id', userId)
    .eq('friend_id', friendId);
  
  if (insertError) {
    console.error('Erro ao criar amizade mútua:', insertError.message);
    return null;
  }
  
  return { updateData, insertData }; // Retorna ambas as operações para referência

  } catch (error) {
    console.error('Erro ao processar pedido de amizade:', error);
    return null;
  }
}

// Obter lista de amigos
export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`friend_id, profiles (id, username, avatar_url)`)
    .eq('user_id', userId)
    .eq('accepted', true)
    .single();

  if (error) {
    console.error('Error fetching friends:', error.message);
    return null;
    
  }

  return data;
}

// Verificar se há solicitações de amizade pendentes
export async function getPendingFriendRequests(userId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('accepted', false);

  if (error) {
    console.error('Error fetching pending friend requests:', error.message);
    return null;
  }

  return data;
}
