import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const QRScanner = () => {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [session, setSession] = useState<any | null>(null);

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const payload = JSON.parse(data);
      if (payload?.type !== 'quiz_invite' || !payload.matchId) throw new Error('QR inválido');

      if (!session?.user?.id) {
        Alert.alert('Login necessário', 'Você precisa estar logado para entrar no quiz.');
        setScanned(false);
        return;
      }

      await supabase
        .from('quiz_participants')
        .upsert({
          match_id: payload.matchId,
          user_id: session.user.id,
          is_ready: false,
        }, { onConflict: ['match_id', 'user_id'] });

      navigation.navigate('QuizWaitingRoom', {
        matchId: payload.matchId,
        quizId: payload.quizId,
        quizTitle: payload.quizTitle,
      });
    } catch (err) {
      console.error('Erro ao processar QR:', err);
      if (Platform.OS === 'web') alert('QR inválido.');
      else Alert.alert('QR inválido', 'Não foi possível processar o QR code.');
      setScanned(false);
    }
  };

  if (hasPermission === null) return <View style={styles.center}><Text>Solicitando permissão de câmera...</Text></View>;
  if (hasPermission === false) return <View style={styles.center}><Text>Permissão de câmera negada.</Text></View>;

  return (
    <View style={styles.container}>
      <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay}>
        <Text style={styles.instruction}>Aponte a câmera para o QR Code</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close-circle" size={48} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' },
  instruction: { color: 'white', fontSize: 18, marginBottom: 10 },
  cancelButton: { marginTop: 20 },
});

export default QRScanner;