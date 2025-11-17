import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
  Modal,
} from 'react-native';
import Avatar from './Avatar';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DEFINIÇÃO DOS TEMAS (ADICIONADO) ---
const themes = {
  padrao: {
    name: 'Padrão',
    background: '#858dbbff',
    card: '#ffffff',
    text: '#2D3748',
    textSecondary: 'rgba(0, 0, 0, 0.9)',
    textWhite: 'rgba(255, 255, 255, 0.9)',
    primary: '#48BB78',
    secondary: '#4A5568',
  },
  altoContraste: {
    name: 'Alto Contraste',
    background: '#2a2a2a',
    card: '#1a1a1a',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textWhite: '#FFFFFF',
    primary: '#FFFF00',
    secondary: '#404040',
  },
  Vermelho: {
    name: 'Vermelho',
    background: '#e6c5c5ff',
    card: '#f5e8e8ff',
    text: '#3b1e1eff',
    textSecondary: '#8b6464ff',
    textWhite: '#3b1e1eff',
    primary: '#f63b3bff',
    secondary: '#c59393ff',
  },
  Laranja: {
    name: 'Laranja',
    background: '#e6dac5ff',
    card: '#f5f1e8ff',
    text: '#3b2e1eff',
    textSecondary: '#8b7b64ff',
    textWhite: '#3b2f1eff',
    primary: '#f69f3bff',
    secondary: '#c5af93ff',
  },
  Amarelo: {
    name: 'Amarelo',
    background: '#e6e5c5ff',
    card: '#f5f5e8ff',
    text: '#393b1eff',
    textSecondary: '#8b8a64ff',
    textWhite: '#3a3b1eff',
    primary: '#f3f63bff',
    secondary: '#c2c593ff',
  },
  Verde: {
    name: 'Verde',
    background: '#cbe6c5ff',
    card: '#e8ecf5',
    text: '#253b1eff',
    textSecondary: '#6c8b64ff',
    textWhite: '#213b1eff',
    primary: '#48BB78',
    secondary: '#93c597ff',
  },
  azulClaro: {
    name: 'Azul Claro',
    background: '#c5d0e6',
    card: '#e8ecf5',
    text: '#1e293b',
    textSecondary: '#64748b',
    textWhite: '#1e293b',
    primary: '#3B82F6',
    secondary: '#93a5c5',
  },
  azulEscuro: {
    name: 'Azul Escuro',
    background: '#c5c6e6ff',
    card: '#eae8f5ff',
    text: '#1e203bff',
    textSecondary: '#64658bff',
    textWhite: '#1e1e3bff',
    primary: '#3e3bf6ff',
    secondary: '#9396c5ff',
  },
  roxo: {
    name: 'Roxo',
    background: '#30345a',
    card: '#1a1d35',
    text: '#FFFFFF',
    textSecondary: '#a0a0a0',
    textWhite: '#FFFFFF',
    primary: '#8B5CF6',
    secondary: '#4a4e7a',
  },
  cinza: {
    name: 'Cinza',
    background: '#5f5f5fff',
    card: '#c9c9c9ff',
    text: '#FFFFFF',
    textSecondary: '#a0a0a0',
    textWhite: '#FFFFFF',
    primary: '#bebebeff',
    secondary: '#2e2e2eff',
  },
}

const Account: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [session, setSession] = useState<Session | null>(null);

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [users, setUsers] = useState<{ id: string }[]>([]);
  const [progressData, setProgressData] = useState<
    { lessonTitle: string; progressPercentage: number }[]
  >([]);
  const [friendCount, setFriendCount] = useState(0);

  // controla se está editando o username
  const [editingUsername, setEditingUsername] = useState(true);

  // --- ESTADOS DO TEMA (ADICIONADO) ---
  const [currentTheme, setCurrentTheme] = useState('padrao')
  const [showThemeModal, setShowThemeModal] = useState(false)

  // --- CARREGAR TEMA (ADICIONADO) ---
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme')
        if (savedTheme && themes[savedTheme as keyof typeof themes]) {
          setCurrentTheme(savedTheme)
        }
      } catch (error) {
        console.log('Erro ao carregar tema:', error)
      }
    }
    loadTheme()
  }, [])

  // --- MUDAR TEMA (ADICIONADO) ---
  const changeTheme = async (themeKey: string) => {
    setCurrentTheme(themeKey)
    setShowThemeModal(false)
    try {
      await AsyncStorage.setItem('app_theme', themeKey)
    } catch (error) {
      console.log('Erro ao salvar tema:', error)
    }
  }

  const theme = themes[currentTheme as keyof typeof themes]

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao buscar sessão:', error.message);
      } else {
        setSession(data.session);
        console.log('Sessão carregada:', data.session);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        console.log('Sessão atualizada:', session);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  useEffect(() => {
    console.log('Session carregada no useEffect:', session);

    if (session) {
      console.log('User ID:', session.user.id);
      getProfile();
      getAllUsers();
      getFriendCount();
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



  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {/* --- BOTÃO DE TEMA (ADICIONADO) --- */}
      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => setShowThemeModal(true)}
      >
        <Ionicons name="color-palette" size={28} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* CARD AZUL CLARO */}
      <View style={[styles.card, { backgroundColor: theme.background }]}>
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

       
<View style={styles.inputGroup}>
  <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
  <TextInput
  value={session?.user.email || ''}
    style={[
      styles.inputContainer,
      { 
        backgroundColor: 'white',  // FUNDO BRANCO FIXO igual username
        outlineStyle: 'none' 
      }
    ]}
    editable={false}
  />
</View>

       
<View style={styles.inputGroup}>
  <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
  <View style={styles.usernameRow}>
    <TextInput
      style={[
        styles.inputContainer, 
        styles.usernameInput, 
        { 
          backgroundColor: 'white',  // FUNDO BRANCO FIXO
          outlineStyle: 'none' 
        }
      ]}
      value={username}
      onChangeText={setUsername}
      placeholder="Digite seu nome"
      editable={editingUsername}
      onBlur={() => setEditingUsername(false)}
      autoFocus={editingUsername}
    />
    <TouchableOpacity
      style={styles.usernameEditButton}
      onPress={() => setEditingUsername(true)}
    >
      <MaterialIcons name="edit" size={22} color={theme.textSecondary} />
    </TouchableOpacity>
  </View>
</View>


        {/* BOTÕES */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.primary }]}
            onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Update'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: theme.secondary }]}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>


        {/* Contador de amigos */}
        <Text style={[styles.friendsCount, { color: theme.textWhite }]}>Amigos: {friendCount}</Text>

        {/* Progress Data */}
        {progressData.map((item, index) => (
          <View key={index} style={styles.progressItem}>
            <Text style={[styles.lessonTitle, { color: theme.textWhite }]}>{item.lessonTitle}</Text>
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

            <Text style={[styles.progressText, { color: theme.textWhite }]}>
              {item.progressPercentage}%
            </Text>
          </View>
        ))}
      </View>

      {/* --- MODAL DE TEMA (ADICIONADO) --- */}
      <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.themeModalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.textWhite }]}>Escolha um Tema</Text>

            <ScrollView style={styles.themeList}>
              {Object.entries(themes).map(([key, themeOption]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: themeOption.card,
                      borderColor: currentTheme === key ? themeOption.primary : 'transparent',
                    }
                  ]}
                  onPress={() => changeTheme(key)}
                >
                  <Text style={[styles.themeName, { color: themeOption.text }]}>{themeOption.name}</Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.background }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.card }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themeOption.primary }]} />
                  </View>
                  {currentTheme === key && (
                    <Ionicons name="checkmark-circle" size={24} color={themeOption.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  // --- ESTILO DO BOTÃO DE TEMA (ADICIONADO) ---
  themeButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
    padding: 8,
  },
  card: {
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    color: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputText: {
    fontSize: 16,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  usernameInput: {
    flex: 1,
    paddingRight: 40,
  },
  usernameEditButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  updateButton: {
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
  },
  // --- ESTILOS DO MODAL DE TEMA (ADICIONADO) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeList: {
    maxHeight: 350,
  },
  themeOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
});

export default Account;