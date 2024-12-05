import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
import { useRoute } from '@react-navigation/native';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  sender_name: string;
  receiver_name: string;
}

const OnlineChat = () => {
  const route = useRoute();
  const { friendId, friendName } = route.params as { friendId: string; friendName: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<any | null>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
    } else {
      setMessages(data);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: session.user.id,
          receiver_id: friendId,
          message_text: newMessage,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
      } else {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchMessages();

      const subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, payload => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={'1000'}
    >
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat com {friendName}</Text>
        </View>
        
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <View style={item.sender_id === session.user.id ? styles.sentMessageContainer : styles.receivedMessageContainer}>
              <Text style={item.sender_id === session.user.id ? styles.sentMessage : styles.receivedMessage}>
                {item.message_text}
              </Text>
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
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Icon name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flatListContent: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  sentMessageContainer: {
    alignSelf: 'flex-end',
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#DCF8C6',
    borderRadius: 15,
    maxWidth: '75%',
  },
  receivedMessageContainer: {
    alignSelf: 'flex-start',
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    maxWidth: '75%',
  },
  sentMessage: {
    color: '#000',
  },
  receivedMessage: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 10,
  },
  sendButton: {
    padding: 8,
  },
});

export default OnlineChat;
