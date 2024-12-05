import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../lib/supabase';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  message_type: string; // Adicionado o campo message_type
  lobby_id: string; // Adicionado o campo lobby_id
}

const OnlineChat = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { friendId } = route.params as { friendId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<any | null>(null);
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    const fetchSessionAndMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) fetchMessages(session.user.id);
    };

    fetchSessionAndMessages();
  }, []);

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
    } else {
      setMessages(data || []);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    const messageData = {
      sender_id: session.user.id,
      receiver_id: friendId,
      message_text: newMessage,
      created_at: new Date().toISOString(),
      message_type: 'text',
    };

    const { data: insertedData, error } = await supabase.from('messages').insert([messageData]).single();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
    } else if (insertedData) {
      setMessages((prevMessages) => [...prevMessages, insertedData as Message]);
      setNewMessage('');
      Keyboard.dismiss(); // Esconde o teclado
    }
  };

  useEffect(() => {
    if (session) {
      const channel = supabase
        .channel(`chat:${friendId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === session.user.id && newMessage.receiver_id === friendId) ||
            (newMessage.sender_id === friendId && newMessage.receiver_id === session.user.id)
          ) {
            setMessages((prevMessages) => {
              if (!prevMessages.find((msg) => msg.id === newMessage.id)) {
                return [...prevMessages, newMessage];
              }
              return prevMessages;
            });
          }
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [session, friendId]);
  
  
  useEffect(() => {
    // Rola até o final da lista quando as mensagens forem atualizadas
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);



  const handleInviteResponse = async (message_id: string, lobby_id: string, response: 'accept' | 'reject') => { 
    if (!session) {
      console.error('Usuário não está autenticado.');
      return;
    }
  
    try {
      // Atualiza o status do convite
      const updatedInviteData = {
        invite_status: response === 'accept' ? 'accepted' : 'rejected',
      };
  
      // Atualiza o status do convite no banco de dados
      const { error: updateError } = await supabase
        .from('messages')
        .update(updatedInviteData)
        .eq('id', message_id) // Usa o message_id para identificar o convite
        .eq('receiver_id', session.user.id); // Identifica o convite que foi enviado para o usuário atual
  
      if (updateError) {
        console.error('Erro ao atualizar convite:', updateError);
        return;
      }
  
      console.log(`Convite ${response === 'accept' ? 'aceito' : 'rejeitado'} com sucesso.`);
  
      // Se o convite for aceito, adiciona o jogador ao lobby
      if (response === 'accept') {
        // Após aceitar o convite, buscar o lobby e adicionar o usuário ao lobby
        const { data: lobbyData, error } = await supabase
          .from('lobbies')
          .select('lobby_name')    // Seleciona o nome do lobby
          .eq('id', lobby_id)      // Filtra pela ID do lobby
          .single();               // Espera um único resultado
  
        if (error || !lobbyData) {
          console.error('Erro ao buscar o lessonTitle:', error);
          return;
        }
  
        const lessonTitle = lobbyData.lobby_name;
  
        // Adiciona o jogador ao lobby na tabela 'lobby_players'
        const { error: insertError } = await supabase
          .from('lobby_players')
          .insert([
            {
              lobby_id: lobby_id,
              player_id: session.user.id,
              is_ready: false,
              is_host: false,
              joined_at: new Date().toISOString(),
            },
          ]);
  
        if (insertError) {
          console.error('Erro ao adicionar o jogador ao lobby:', insertError);
          return;
        }
  
        console.log('Jogador adicionado ao lobby com sucesso.');
  
        // Notifica o canal do lobby sobre o novo jogador
        const lobbyChannel = supabase.channel(`lobby:${lobby_id}`);
        lobbyChannel.send({
          type: 'broadcast',
          event: 'player_joined',
          payload: {
            player_id: session.user.id,
            username: session.user.user_metadata.username,
            avatar_url: session.user.user_metadata.avatar_url,
            is_ready: false,
            is_host: false
          },
        });
  
        // Redireciona para a tela do Lobby
        navigation.navigate('Lobby', { lessonTitle: lessonTitle, lobbyId: lobby_id, session: session });
      }
    } catch (error) {
      console.error('Erro ao processar o convite:', error);
    }
  };
  
  
  

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item }) => {
              if (item.message_type === 'invitation') {
                return (
                  <View style={styles.invitationMessage}>
                    <Text style={styles.invitationText}>{item.message_text}</Text>
                    <View style={styles.invitationActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleInviteResponse(item.id, item.lobby_id, 'accept')}>
                        <Text style={styles.inviteButtonText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => handleInviteResponse(item.id, item.lobby_id, 'reject')}>
                        <Text style={styles.declineButton}>Rejeitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
  
              return (
                <View style={item.sender_id === session?.user.id ? styles.sentMessage : styles.receivedMessage}>
                  <Text style={styles.messageText}>{item.message_text}</Text>
                </View>
              );
            }}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChangeText={setNewMessage}
              onBlur={() => Keyboard.dismiss()} // Tenta esconder o teclado ao sair do input
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Azul escuro com um tom frio e profundo
  },
  flatListContent: {
    padding: 10,
    paddingBottom: 100,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00bfae', // Verde ciano para mensagens do jogador
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#5c4f9d', // Azul-violeta para mensagens do outro jogador
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  invitationMessage: {
    backgroundColor: '#1e3a8a', // Azul escuro para o fundo do convite
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    borderWidth: 2,
    borderColor: '#00bfae', // Contorno verde ciano
  },
  invitationText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: '#00bfae', // Verde ciano para aceitar
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: '#d9534f', // Vermelho para recusar
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inviteButton: {
    backgroundColor: '#1E3A8A', // Azul escuro para o botão de convite
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#00bfae', // Verde ciano para o botão de envio
    padding: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#e0e0e0', // Texto claro para contraste no fundo escuro
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2c2f44', // Fundo mais neutro para input
    borderTopWidth: 1,
    borderColor: '#444466',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#3a3d57', // Fundo de campo de texto em tom de azul suave
    borderRadius: 20,
    marginRight: 10,
    color: '#FFFFFF', // Texto claro
  },
});
export default OnlineChat;
