import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string; // O ID deve ser do tipo string
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
}

const OnlineChat = () => {
  const route = useRoute();
  const { friendId } = route.params as { friendId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<any | null>(null);

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
    };

    const { data: insertedData, error } = await supabase.from('messages').insert([messageData]).single();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
    } else if (insertedData) {
      setMessages((prevMessages) => [...prevMessages, insertedData as Message]);
      setNewMessage(''); // Limpar campo de mensagem após o envio
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <View style={item.sender_id === session?.user.id ? styles.sentMessage : styles.receivedMessage}>
              <Text style={styles.messageText}>{item.message_text}</Text>
            </View>
          )}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChangeText={setNewMessage}
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
    backgroundColor: '#f2f2f2',
  },
  flatListContent: {
    padding: 10,
    paddingBottom: 100,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1ffd1',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
});

export default OnlineChat;
