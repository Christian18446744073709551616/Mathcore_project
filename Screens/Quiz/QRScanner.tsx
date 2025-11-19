import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const QRScanner = () => {
  const navigation = useNavigation<any>();
  const [session, setSession] = useState<any | null>(null);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    (async () => {
      const resp = await supabase.auth.getSession();
      const s = (resp as any)?.data?.session ?? null;
      setSession(s);
    })();
  }, []);

  const handleCodeEntered = async (code: string) => {
    if (!code.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor, digite o código da sala.');
      } else {
        Alert.alert('Erro', 'Por favor, digite o código da sala.');
      }
      return;
    }

    console.log('📝 Código da sala digitado:', code);

    try {
      if (!session?.user?.id) {
        if (Platform.OS === 'web') {
          alert('Você precisa estar logado para entrar no quiz.');
        } else {
          Alert.alert('Login necessário', 'Você precisa estar logado para entrar no quiz.');
        }
        return;
      }

      let matchId: string;
      let quizId: string;
      let quizTitle: string;

      // Verifica se é um código de sala de 6 dígitos
      if (/^\d{6}$/.test(code.trim())) {
        console.log('🔍 Procurando match pelo código de sala:', code.trim());

        const { data: matches, error } = await supabase
          .from('quiz_matches')
          .select('id, quiz_id, quiz_title')
          .eq('is_active', false); // Apenas matches que ainda não começaram

        if (error) {
          console.error('Erro ao buscar partidas:', error);
          throw new Error('Erro ao buscar partidas');
        }

        let foundMatch = null;
        for (const match of matches || []) {
          const hash = match.id.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
          const computedCode = (hash % 1000000).toString().padStart(6, '0');

          if (computedCode === code.trim()) {
            foundMatch = match;
            break;
          }
        }

        if (!foundMatch) {
          throw new Error('Código de sala não encontrado ou sala já fechada');
        }

        matchId = foundMatch.id;
        quizId = foundMatch.quiz_id;
        quizTitle = foundMatch.quiz_title;

        console.log('✅ Partida encontrada pelo código:', { matchId, quizId, quizTitle });
      } else {
        // Trata como matchId direto (fallback)
        matchId = code.trim();

        const { data: matchData, error: matchError } = await supabase
          .from('quiz_matches')
          .select('quiz_id, quiz_title')
          .eq('id', matchId)
          .single();

        if (matchError) {
          throw new Error('Partida não encontrada ou já finalizada');
        }

        quizId = (matchData as any).quiz_id;
        quizTitle = (matchData as any).quiz_title;

        console.log('✅ Partida encontrada por ID direto:', { quizId, quizTitle });
      }

      // Adiciona usuário como participante
      const { error: participantError } = await supabase
        .from('quiz_participants')
        .upsert({
          match_id: matchId,
          user_id: session.user.id,
          is_ready: false,
        }, { onConflict: 'match_id,user_id' });

      if (participantError) {
        console.error('⚠️ Erro ao adicionar participante (pode já estar na sala):', participantError);
      }

      console.log('✅ Usuário adicionado à sala, navegando...');

      // Navega para a WaitingRoom
      navigation.navigate('QuizWaitingRoom', {
        matchId: matchId,
        quizId: quizId,
        quizTitle: quizTitle,
      });

    } catch (err) {
      console.error('❌ Erro ao processar código:', err);
      const errorMessage = err instanceof Error ? err.message : 'Código inválido';

      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.instruction}>Digite o código da sala</Text>
        <View style={styles.manualInputContainer}>
          <TextInput
            style={styles.manualInput}
            placeholder="Digite o código da sala..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={manualInput}
            onChangeText={setManualInput}
            keyboardType="numeric"
            maxLength={10}
          />
          <View style={styles.manualInputButtons}>
            <TouchableOpacity
              style={styles.manualSubmitButton}
              onPress={() => handleCodeEntered(manualInput.trim())}
            >
              <Text style={styles.manualSubmitButtonText}>Entrar no Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualCancelButton}
              onPress={() => {
                setManualInput('');
              }}
            >
              <Text style={styles.manualCancelButtonText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242948',
    padding: 20,
  },
  instruction: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  manualInputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  manualInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 16,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  manualInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  manualSubmitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  manualSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualCancelButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  manualCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#707DCB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRScanner;