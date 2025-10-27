import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useIsFocused } from '@react-navigation/native';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  message_type: string;
  lobby_id?: string;
}

const OnlineChat = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { friendId } = route.params as { friendId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<any | null>(null);
  const flatListRef = useRef<FlatList<Message> | null>(null);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: isFocused ? 'none' : 'flex' }
    });
  }, [isFocused]);

  useEffect(() => {
    const fetchSessionAndMessages = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session ?? null;
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
      setMessages([]);
    } else {
      setMessages((data as Message[]) ?? []);
    }
  };

  const handleSendMessage = async () => {
    if (!session) {
      console.error('Usuário não autenticado.');
      if (Platform.OS === 'web') {
        alert('Você precisa estar autenticado para enviar mensagens.');
      } else {
        Alert.alert('Erro', 'Você precisa estar autenticado para enviar mensagens.');
      }
      return;
    }

    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');

    const messageData = {
      sender_id: session.user.id,
      receiver_id: friendId,
      message_text: messageToSend,
      created_at: new Date().toISOString(),
      message_type: 'text',
    };

    const { data: insertedData, error } = await supabase.from('messages').insert([messageData]).select().single();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
    } else if (insertedData) {
      setMessages((prevMessages) => [...prevMessages, insertedData as Message]);
      Keyboard.dismiss();
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
          const newMessageReceived = payload.new as Message;
          if (
            (newMessageReceived.sender_id === friendId && newMessageReceived.receiver_id === session.user.id) ||
            (newMessageReceived.sender_id === session.user.id && newMessageReceived.receiver_id === friendId)
          ) {
            setMessages((prevMessages) => {
              if (!prevMessages.find((msg) => msg.id === newMessageReceived.id)) {
                return [...prevMessages, newMessageReceived];
              }
              return prevMessages;
            });
          }
        })
        .subscribe();

      return () => {
        try {
          channel.unsubscribe();
        } catch (e) {
          // fallback: ignore unsubscribe errors
        }
      };
    }
  }, [session, friendId]);

  useEffect(() => {
    // tenta rolar para o fim quando as mensagens mudam
    try {
      (flatListRef.current as any)?.scrollToEnd?.({ animated: true });
    } catch (e) {
      // ignora erros de scroll
    }
  }, [messages]);

  const parseInviteData = (messageText: string) => {
    try {
      const data = JSON.parse(messageText);

      if (data && typeof data === 'object') {
        if (data.match_id && data.quiz_id) {
          return { type: 'quiz', data: data };
        }

        if (data.lobby_id) {
          return { type: 'lobby', data: data };
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const handleQuizInviteResponse = async (message_id: string, inviteData: any, response: 'accept' | 'reject') => {
    if (!session) {
      console.error('Usuário não está autenticado.');
      return;
    }

    try {
      console.log(`${response === 'accept' ? '✅ Aceitando' : '❌ Rejeitando'} convite de quiz`);

      if (response === 'accept') {
        const { error } = await supabase
          .from('quiz_participants')
          .insert({
            match_id: inviteData.match_id,
            user_id: session.user.id,
            is_ready: false,
          });

        if (error) {
          console.error('❌ Erro ao aceitar convite:', error);
          if (Platform.OS === 'web') {
            alert('Não foi possível aceitar o convite.');
          } else {
            Alert.alert('Erro', 'Não foi possível aceitar o convite.');
          }
          return;
        }

        await supabase.from('messages').delete().eq('id', message_id);

        console.log('✅ Convite aceito! Navegando para QuizWaitingRoom...');

        (navigation as any).navigate('QuizWaitingRoom', {
          matchId: inviteData.match_id,
          quizId: inviteData.quiz_id,
          quizTitle: inviteData.quiz_title,
        });
      } else {
        await supabase.from('messages').delete().eq('id', message_id);

        console.log('❌ Convite rejeitado');

        if (Platform.OS === 'web') {
          alert('Convite rejeitado.');
        } else {
          Alert.alert('Convite rejeitado', 'Você recusou o convite para o quiz.');
        }

        if (session) fetchMessages(session.user.id);
      }
    } catch (error) {
      console.error('❌ Erro ao processar convite de quiz:', error);
    }
  };

  const handleLobbyInviteResponse = async (message_id: string, lobby_id: string, response: 'accept' | 'reject') => {
    if (!session) {
      console.error('Usuário não está autenticado.');
      return;
    }

    try {
      const updatedInviteData = {
        invite_status: response === 'accept' ? 'accepted' : 'rejected',
      };

      const { error: updateError } = await supabase
        .from('messages')
        .update(updatedInviteData)
        .eq('id', message_id)
        .eq('receiver_id', session.user.id);

      if (updateError) {
        console.error('Erro ao atualizar convite:', updateError);
        return;
      }

      console.log(`Convite de lobby ${response === 'accept' ? 'aceito' : 'rejeitado'} com sucesso.`);

      if (response === 'accept') {
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('lobby_name')
          .eq('id', lobby_id)
          .single();

        if (lobbyError) {
          console.error('Erro ao buscar o lobby_name:', lobbyError);
          return;
        }

        const lessonTitle = (lobbyData as any)?.lobby_name ?? 'Lobby';

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

        try {
          const lobbyChannel = supabase.channel(`lobby:${lobby_id}`);
          lobbyChannel.send({
            type: 'broadcast',
            event: 'player_joined',
            payload: {
              player_id: session.user.id,
              username: session.user.user_metadata?.username,
              avatar_url: session.user.user_metadata?.avatar_url,
              is_ready: false,
              is_host: false,
            },
          });
        } catch (e) {
          // ignora erros de broadcast
        }

        (navigation as any).navigate('Lobby', { lessonTitle: lessonTitle, lobbyId: lobby_id, session: session });
      }
    } catch (error) {
      console.error('Erro ao processar o convite de lobby:', error);
    }
  };

  return (
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
              const inviteInfo = parseInviteData(item.message_text);

              if (inviteInfo?.type === 'quiz') {
                return (
                  <View style={styles.invitationMessage}>
                    <Text style={styles.invitationText}>
                      🎮 Convite para jogar Quiz
                    </Text>
                    <Text style={styles.quizTitleInChat}>
                      📝 {inviteInfo.data.quiz_title}
                    </Text>
                    <View style={styles.invitationActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleQuizInviteResponse(item.id, inviteInfo.data, 'accept')}
                      >
                        <Text style={styles.inviteButtonText}>✅ Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButtonStyle}
                        onPress={() => handleQuizInviteResponse(item.id, inviteInfo.data, 'reject')}
                      >
                        <Text style={styles.inviteButtonText}>❌ Rejeitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              if (inviteInfo?.type === 'lobby' && item.lobby_id) {
                return (
                  <View style={styles.invitationMessage}>
                    <Text style={styles.invitationText}>{item.message_text}</Text>
                    <View style={styles.invitationActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleLobbyInviteResponse(item.id, item.lobby_id!, 'accept')}
                      >
                        <Text style={styles.inviteButtonText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => handleLobbyInviteResponse(item.id, item.lobby_id!, 'reject')}
                      >
                        <Text style={styles.declineButton}>Rejeitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <View style={styles.invitationMessage}>
                  <Text style={styles.invitationText}>{item.message_text}</Text>
                </View>
              );
            }

            return (
              <View
                style={
                  item.sender_id === session?.user.id
                    ? styles.sentMessage
                    : styles.receivedMessage
                }
              >
                <Text style={styles.messageText}>{item.message_text}</Text>
              </View>
            );
          }}
        />

        <View>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.navigate('Home2')}
          >
            <Ionicons name="arrow-back-circle-outline" size={80} color="black" style={{ fontWeight:'bold'}} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#aaa"
            value={newMessage}
            onChangeText={setNewMessage}
            autoFocus
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingBottom: 100,
  },
  flatListContent: {
    padding: 10,
    paddingBottom: 100,
  },
  returnButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00bfae',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#5c4f9d',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  invitationMessage: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    borderWidth: 2,
    borderColor: '#00bfae',
  },
  invitationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quizTitleInChat: {
    color: '#FFF9E0',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#00bfae',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    flex: 1,
    alignItems: 'center',
  },
  declineButtonStyle: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
    flex: 1,
    alignItems: 'center',
  },
  inviteButton: {
    backgroundColor: '#1E3A8A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
    flex: 1,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  declineButton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#00bfae',
    padding: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2c2f44',
    borderTopWidth: 1,
    borderColor: '#444466',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#3a3d57',
    borderRadius: 20,
    marginRight: 10,
    color: '#FFFFFF',
  },
});

export default OnlineChat;