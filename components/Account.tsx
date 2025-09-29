import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
} from 'react-native';
import Avatar from './Avatar';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { MaterialIcons } from '@expo/vector-icons';

interface AccountProps {
  session: Session;
  navigation: any;
}

const Account: React.FC<AccountProps> = ({ session, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [users, setUsers] = useState<{ id: string }[]>([]);
  const [progressData, setProgressData] = useState<
    { lessonTitle: string; progressPercentage: number }[]
  >([]);
  const [friendCount, setFriendCount] = useState(0);

  // controla se está editando o username
  const [editingUsername, setEditingUsername] = useState(false);

  useEffect(() => {
    if (session) {
      getProfile();
      getAllUsers();
      getFriendCount();
      getProgress();
    }
  }, [session]);

  async function getAllUsers() {
    const { data, error } = await supabase.from('profiles').select('id');
    if (error) {
      console.log(error.message);
    }
    setUsers(data ?? []);
  }

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const getFriendCount = async () => {
    const { count, error } = await supabase
      .from('friendships')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .eq('accepted', true);

    if (error) {
      console.error('Erro ao contar amigos:', error);
    } else {
      setFriendCount(count ?? 0);
    }
  };

  async function getProgress() {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_title, progress_percentage')
        .eq('user_id', session?.user.id);

      if (error) {
        console.error('Erro ao obter progresso:', error);
        return;
      }

      if (data) {
        setProgressData(
          data.map((item) => ({
            lessonTitle: item.lesson_title,
            progressPercentage: item.progress_percentage,
          }))
        );
      }
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {/* CARD AZUL CLARO */}
      <View style={styles.card}>
        {/* Header com Avatar */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Avatar
              size={150}
              url={avatarUrl}
              onUpload={(url: string) => {
                setAvatarUrl(url);
                updateProfile({ username, avatar_url: url });
              }}
            />
          </View>
        </View>

        {/* EMAIL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{session?.user?.email}</Text>
            
          </View>
        </View>

        {/* USERNAME */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.usernameRow}>
            {editingUsername ? (
              <TextInput
                style={[styles.inputContainer, styles.usernameInput]}
                value={username}
                onChangeText={setUsername}
                autoFocus
                onBlur={() => setEditingUsername(false)}
                placeholder="Digite seu nome"
              />
            ) : (
              <View style={[styles.inputContainer, styles.usernameInput]}>
                <Text style={styles.inputText}>{username || 'Seu Nome'}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.usernameEditButton}
              onPress={() => setEditingUsername(true)} // sempre entra em edição
            >
              <MaterialIcons name="edit" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Update'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Contador de amigos */}
        <Text style={styles.friendsCount}>Amigos: {friendCount}</Text>

        {/* Progress Data */}



        {progressData.map((item, index) => (
          <View key={index} style={styles.progressItem}>
            <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${item.progressPercentage}%`,

                    backgroundColor:
                      item.progressPercentage >= 80
                        ? 'green'
                        : item.progressPercentage >= 50
                        ? 'orange'
                        : 'red',


                  },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {item.progressPercentage}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({

  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#858dbbff',
    borderRadius: 25,
    padding: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',

  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: 'rgba(0, 0, 0, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputText: {
    fontSize: 16,
    color: '#2D3748',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  usernameInput: {
    flex: 1,
    paddingRight: 40, // espaço para o lápis
  },
  usernameEditButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'transparent', // sem fundo cinza
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#48BB78',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutButton: {
    backgroundColor: '#4A5568',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  friendsCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressItem: {
    marginVertical: 10,
    width: '100%',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progress: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'white',


  },
});

export default Account;
