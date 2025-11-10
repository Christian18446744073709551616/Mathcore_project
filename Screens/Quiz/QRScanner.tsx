import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { parseQRCodeData } from '../../utils/qrCodeUtils'; // 🆕 NOVO IMPORT

const QRScanner = () => {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    (async () => {
      const resp = await supabase.auth.getSession();
      const s = (resp as any)?.data?.session ?? null;
      setSession(s);
    })();
  }, []);

  // 🆕 MODIFICADO: Função melhorada para suportar URLs, códigos de sala e JSON
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    console.log('📷 QR Code escaneado:', data);

    try {
      // Usa a função utilitária para processar URLs, códigos de sala e JSON
      const payload = await parseQRCodeData(data);
      if (!payload) {
        throw new Error('QR code inválido ou formato não reconhecido');
      }

      console.log('✅ Payload processado:', payload);

      if (!session?.user?.id) {
        if (Platform.OS === 'web') {
          alert('Você precisa estar logado para entrar no quiz.');
        } else {
          Alert.alert('Login necessário', 'Você precisa estar logado para entrar no quiz.');
        }
        setScanned(false);
        return;
      }

      // Se o payload já tem quizId e quizTitle (do código de sala), usa diretamente
      let quizId = payload.quizId;
      let quizTitle = payload.quizTitle;

      // Se não tem, busca do banco
      if (!quizId || !quizTitle) {
        const { data: matchData, error: matchError } = await supabase
          .from('quiz_matches')
          .select('quiz_id, quiz_title')
          .eq('id', payload.matchId)
          .single();

        if (matchError) {
          throw new Error('Match não encontrado ou já finalizado');
        }

        quizId = (matchData as any).quiz_id;
        quizTitle = (matchData as any).quiz_title;
      }

      console.log('✅ Match encontrado:', { quizId, quizTitle });

      // Adiciona usuário como participante
      const { error: participantError } = await supabase
        .from('quiz_participants')
        .upsert({
          match_id: payload.matchId,
          user_id: session.user.id,
          is_ready: false,
        }, { onConflict: 'match_id,user_id' });

      if (participantError) {
        console.error('⚠️ Erro ao adicionar participante (pode já estar na sala):', participantError);
      }

      console.log('✅ Usuário adicionado à sala, navegando...');

      // Navega para a WaitingRoom
      navigation.navigate('QuizWaitingRoom', {
        matchId: payload.matchId,
        quizId: quizId,
        quizTitle: quizTitle,
      });

    } catch (err) {
      console.error('❌ Erro ao processar QR:', err);
      const errorMessage = err instanceof Error ? err.message : 'QR code inválido';

      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Erro', errorMessage);
      }
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.messageText}>Solicitando permissão de câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.iconText}>📷</Text>
        <Text style={styles.messageText}>Permissão de câmera negada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.instruction}>📷 Aponte a câmera para o QR Code</Text>
          <Text style={styles.subInstruction}>Ou digite o código da sala manualmente</Text>

          {/* 🆕 NOVO: Sempre mostrar opção de entrada manual */}
          {!showManualInput ? (
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={() => setShowManualInput(true)}
            >
              <Text style={styles.manualInputButtonText}>📝 Digitar Código Manualmente</Text>
            </TouchableOpacity>
          ) : (
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
                  onPress={async () => {
                    if (!manualInput.trim()) {
                      if (Platform.OS === 'web') {
                        alert('Por favor, digite o código da sala.');
                      } else {
                        Alert.alert('Erro', 'Por favor, digite o código da sala.');
                      }
                      return;
                    }
                    await handleBarCodeScanned({ data: manualInput.trim() });
                  }}
                >
                  <Text style={styles.manualSubmitButtonText}>✅ Entrar no Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.manualCancelButton}
                  onPress={() => {
                    setShowManualInput(false);
                    setManualInput('');
                  }}
                >
                  <Text style={styles.manualCancelButtonText}>❌ Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 🆕 NOVO: Área de scan com cantos visuais */}
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.iconText}>❌</Text>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          {/* 🆕 NOVO: Botão para escanear novamente */}
          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanText}>🔄 Escanear Novamente</Text>
            </TouchableOpacity>
          )}
        </View>
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
  messageText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  subMessageText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  iconText: {
    fontSize: 64,
    color: 'white',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  instruction: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstruction: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  // 🆕 NOVOS: Estilos da área de scan
  scanArea: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4CAF50',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  // 🆕 NOVOS: Botão de rescan
  rescanButton: {
    marginTop: 20,
    backgroundColor: '#707DCB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  rescanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 🆕 NOVOS: Estilos para entrada manual na web
  manualInputButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  manualInputButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualInputContainer: {
    marginTop: 20,
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
});

export default QRScanner;