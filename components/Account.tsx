import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from "@shopify/flash-list";
import Avatar from './Avatar';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import Synth from './Synthetizider';

interface AccountProps {
  session: Session;
  navigation: any;
}

const Account: React.FC<AccountProps> = ({ session, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [users, setUsers] = useState<{ id: string }[]>([]);
  const [progressData, setProgressData] = useState<{ lessonTitle: string; progressPercentage: number }[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (session) {
      getProfile();
      getAllUsers();
      getFriendCount();
      getProgress(); // Chama a função para obter progresso
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
        setProgressData(data.map((item) => ({
          lessonTitle: item.lesson_title,
          progressPercentage: item.progress_percentage,
        })));
      }
    } catch (error) {
      console.error(error);
    }
  }


  
  return (

    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView} // Adicionando o estilo diretamente no ScrollView
    >
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, avatar_url: url });
          }}
        />
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)}
        >
          <Ionicons name="settings" size={24} color="black" style={styles.iconImage} />
        </TouchableOpacity>
      </View>

      {showSettings && (
        <View style={styles.settingsContainer}>
          <Synth session={session} navigation={navigation} />
        </View>
      )}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ''}
          onChangeText={(text) => setUsername(text)}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.text}>Amigos: {friendCount}</Text>
      </View>
 
      {progressData.map((item, index) => (
        <View key={index} style={styles.progressItem}>
          <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${item.progressPercentage}%`,
                  backgroundColor: item.progressPercentage >= 80 ? 'green' : item.progressPercentage >= 50 ? 'orange' : 'red',
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>hello{item.progressPercentage}%</Text>
        </View>
      ))}
    </View></ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },scrollView: {
    backgroundColor: '#0d0f14', // Defina o fundo para evitar o branco ao redor
  }, scrollContainer: {
    flexGrow: 1, // Garante que o ScrollView ocupe todo o espaço disponível
    padding: 20, // Espaçamento ao redor de todos os itens
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  settingsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },

  progressItem: {
    marginVertical: 10,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'white',
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
    color:'white',
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    color:'white',
  },
});

export default Account;
