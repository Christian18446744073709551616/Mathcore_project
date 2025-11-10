import { generateWaitingRoomUrl, extractMatchIdFromUrl } from '../config/environment';
import { supabase } from '../lib/supabase';

export interface QRCodePayload {
  type: 'quiz_invite';
  matchId: string;
  quizId: string;
  quizTitle: string;
}

/**
 * Gera o conteúdo do QR Code (URL completa)
 */
export const generateQRCodeContent = (payload: QRCodePayload): string => {
  // Gera URL real ao invés de JSON
  return generateWaitingRoomUrl(payload.matchId);
};

/**
 * Processa dados escaneados do QR Code
 * Suporta URLs, códigos de sala de 6 dígitos e JSON (retrocompatibilidade)
 */
export const parseQRCodeData = async (data: string): Promise<QRCodePayload | null> => {
  try {
    // Primeiro tenta extrair de URL
    const matchIdFromUrl = extractMatchIdFromUrl(data);
    if (matchIdFromUrl) {
      return {
        type: 'quiz_invite',
        matchId: matchIdFromUrl,
        quizId: '', // Será buscado do banco
        quizTitle: '', // Será buscado do banco
      };
    }

    // Verifica se é um código de sala de 6 dígitos
    if (/^\d{6}$/.test(data)) {
      console.log('🔍 Procurando match pelo código de sala:', data);

      const { data: matches, error } = await supabase
        .from('quiz_matches')
        .select('id, quiz_id, quiz_title')
        .eq('is_active', false); // Apenas matches que ainda não começaram

      if (error) {
        console.error('Erro ao buscar matches:', error);
        return null;
      }

      for (const match of matches || []) {
        const hash = match.id.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
        const computedCode = (hash % 1000000).toString().padStart(6, '0');

        if (computedCode === data) {
          console.log('✅ Match encontrado pelo código:', match.id);
          return {
            type: 'quiz_invite',
            matchId: match.id,
            quizId: match.quiz_id,
            quizTitle: match.quiz_title,
          };
        }
      }

      console.log('❌ Código de sala não encontrado');
      return null;
    }

    // Fallback: tenta parsear como JSON (para QR codes antigos)
    const parsed = JSON.parse(data);
    if (parsed?.type === 'quiz_invite' && parsed.matchId) {
      return parsed as QRCodePayload;
    }

    return null;
  } catch (error) {
    console.error('Erro ao processar QR code:', error);
    return null;
  }
};
