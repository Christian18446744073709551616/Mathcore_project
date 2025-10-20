import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase, setupQuizInviteChannel } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import AvatarView from './AvatarView';

interface QuizInvite {
  id: string;
  sender_id: string;
  quiz_id: string;
  quiz_title: string;
  match_id: string;
  sender_username?: string;
  sender_avatar?: string;
}

interface QuizInviteNotificationProps {
  userId: string;
}

const QuizInviteNotification: React.FC<QuizInviteNotificationProps> = ({ userId }) => {
  const [invite, setInvite] = useState<QuizInvite | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Configurar canal para receber convites
    const channel = setupQuizInviteChannel(userId, async (newInvite) => {
      console.log('Convite de quiz recebido:', newInvite);

      // Buscar dados do remetente
      const { data: senderData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', newInvite.sender_id)
        .single();

      // Parsear dados do convite (message_text contém JSON)
      let inviteData;
      try {
        inviteData = JSON.parse(newInvite.message_text);
      } catch (error) {
        console.error('Erro ao parsear convite:', error);
        return;
      }

      setInvite({
        id: newInvite.id,
        sender_id: newInvite.sender_id,
        quiz_id: inviteData.quiz_id,
        quiz_title: inviteData.quiz_title,
        match_id: inviteData.match_id,
      });
      setIsVisible(true);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const handleAccept = async () => {
    if (!invite) return;

    try {
      // Adicionar usuário como participante
      const { error } = await supabase
        .from('quiz_participants')
        .insert({
          match_id: invite.match_id,
          user_id: userId,
          is_ready: false,
        });

      if (error) throw error;

      // Deletar mensagem de convite
      await supabase.from('messages').delete().eq('id', invite.id);

      setIsVisible(false);

      // Navegar para a tela de espera do quiz
      navigation.navigate('QuizWaitingRoom', {
        matchId: invite.match_id,
        quizId: invite.quiz_id,
        quizTitle: invite.quiz_title,
      });
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      Alert.alert('Erro', 'Não foi possível aceitar o convite.');
    }
  };

  const handleDecline = async () => {
    if (!invite) return;

    // Deletar mensagem de convite
    await supabase.from('messages').delete().eq('id', invite.id);
    setIsVisible(false);
    setInvite(null);
  };

  if (!invite) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <AvatarView size={80} url={invite.sender_avatar} />
          <Text style={styles.title}>
            {invite.sender_username} está te chamando para jogar!
          </Text>
          <Text style={styles.quizTitle}>Quiz: {invite.quiz_title}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
              <Text style={styles.buttonText}>Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#707DCB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  quizTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizInviteNotification;