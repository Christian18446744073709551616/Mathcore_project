/**
 * Retorna a URL base da aplicação baseada no ambiente
 * Funciona tanto para web quanto para mobile
 */
export const getBaseUrl = (): string => {
  // Para Web (produção e localhost)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Para Mobile (React Native)
  // Você pode configurar isso no .env ou usar uma URL fixa de produção
  return 'https://your-production-url.com'; // Substitua pela URL de produção
};

/**
 * Gera URL completa para a waiting room
 */
export const generateWaitingRoomUrl = (matchId: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/waiting-room/${matchId}`;
};

/**
 * Extrai matchId de uma URL da waiting room
 * Exemplo: https://seuapp.com/waiting-room/abc123 -> abc123
 */
export const extractMatchIdFromUrl = (url: string): string | null => {
  try {
    // Regex para capturar matchId da URL
    const match = url.match(/\/waiting-room\/([^/?#]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Erro ao extrair matchId:', error);
    return null;
  }
};