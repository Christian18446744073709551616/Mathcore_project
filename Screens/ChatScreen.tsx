import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

import { supabase } from '../lib/supabase';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useIsFocused } from '@react-navigation/native';

import ChatHeader from './ChatHeader';

interface Friend {
  id: string;
  name: string;
  avatar_url: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  message_type: string; // 'text' ou 'invitation'
  lobby_id?: string;
}

const OnlineChat = () => {
  const [friend, setFriend] = useState<Friend | null>(null);
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { friendId } = route.params as { friendId: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<any | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: isFocused ? 'none' : 'flex' },
    });
  }, [isFocused]);

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
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (error) console.error('Erro ao buscar mensagens:', error);
    else setMessages(data || []);
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

    setNewMessage('');
    Keyboard.dismiss();

    const { data: insertedData, error } = await supabase
      .from('messages')
      .insert([messageData])
      .single();

    if (error) console.error('Erro ao enviar mensagem:', error);
    else if (insertedData) setMessages((prev) => [...prev, insertedData as Message]);
  };

  useEffect(() => {
    const fetchFriend = async () => {
      if (!friendId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', friendId)
        .single();

      if (error) console.error('Erro ao buscar amigo:', error);

      if (data) {
        let avatar = data.avatar_url;
        if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:image')) {
          avatar = `data:image/jpeg;base64,${avatar}`;
        }
        if (avatar) {
          avatar = avatar.replace(/^data:image\/\w+;base64,/, '');
          avatar = `data:image/jpeg;base64,${avatar}`;
        }

        const friendData: Friend = {
          id: data.id,
          name: data.username,
          avatar_url: avatar || '',
        };
        setFriend(friendData);
      }
    };

    fetchFriend();
  }, [friendId]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`chat:${friendId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        if (
          (newMessage.sender_id === session.user.id && newMessage.receiver_id === friendId) ||
          (newMessage.sender_id === friendId && newMessage.receiver_id === session.user.id)
        ) {
          setMessages((prev) =>
            prev.find((msg) => msg.id === newMessage.id) ? prev : [...prev, newMessage]
          );
        }
      })
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch (e) {}
    };
  }, [session, friendId]);

  const parseInviteData = (messageText: string) => {
    try {
      const data = JSON.parse(messageText);
      if (data && typeof data === 'object') {
        if (data.match_id && data.quiz_id) return { type: 'quiz', data };
        if (data.lobby_id) return { type: 'lobby', data };
      }
      return null;
    } catch {
      return null;
    }
  };

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ChatHeader
        groupName={`Chat com: ${friend ? friend.name : 'Carregando...'}`}
        friendName={friend ? friend.name : 'Carregando...'}
        friendAvatar={
          friend && friend.avatar_url
            ? friend.avatar_url
            : require('../assets/IconDefault.jpg')
        }
        onChallengePress={() => {}}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.message_type === 'invitation') {
              const inviteInfo = parseInviteData(item.message_text);

              if (inviteInfo?.type === 'quiz') {
                return (
                  <View style={styles.invitationMessage}>
                    <Text style={styles.invitationText}>🎮 Convite para jogar Quiz</Text>
                    <Text style={styles.quizTitleInChat}>
                      📝 {inviteInfo.data.quiz_title}
                    </Text>
                    <View style={styles.invitationActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => {}}
                      >
                        <Text style={styles.inviteButtonText}>✅ Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButtonStyle}
                        onPress={() => {}}
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
                        onPress={() => {}}
                      >
                        <Text style={styles.inviteButtonText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButtonStyle}
                        onPress={() => {}}
                      >
                        <Text style={styles.inviteButtonText}>Rejeitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
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

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { outlineStyle: 'none' }]}
            placeholder="Mande uma mensagem"
            placeholderTextColor="#aaa"
            value={newMessage}
            onChangeText={setNewMessage}
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#242948' },
  flatListContent: { padding: 12, paddingBottom: 140 },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    marginVertical: 6,
    maxWidth: '75%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#BDC4EE',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 14,
    marginVertical: 6,
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins_400Regular',
  },
  invitationMessage: {
    backgroundColor: '#5C6494',
    borderRadius: 15,
    padding: 12,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: '#000706ff',
    maxWidth: '50%',
  },
  invitationText: {
    color: '#fff',
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
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    height: 55,
  },
  input: {
    flex: 1,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#242948',
    padding: 12,
    borderRadius: 25,
    marginLeft: 8,
  },
});

export default OnlineChat;
