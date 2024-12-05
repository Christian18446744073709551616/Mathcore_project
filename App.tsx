import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabase';
import Cornhub from './navegation'; // Navegação principal do app
import Auth from './components/Auth'; // Tela de autenticação
import TitleScreen from './Screens/TitleFight'; // Tela de título
import { Session } from '@supabase/supabase-js'; // Tipo de sessão

export default function App() {
  const [session, setSession] = useState<Session | null>(null); // Estado da sessão
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [showTitle, setShowTitle] = useState(true); // Estado para mostrar ou esconder a tela de título

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false); // Parar carregamento após verificar a sessão
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Exibe indicador de carregamento enquanto verifica a sessão
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Exibe a tela de título antes de redirecionar para o login ou a navegação principal
  if (showTitle) {
    return (
      <TitleScreen 
        onFinish={() => setShowTitle(false)} // Chama onFinish ao clicar para sair da tela de título
        session={session} // Passa a sessão para o TitleScreen, caso precise
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {session && session.user ? (
        <Cornhub session={session} /> // Se houver sessão, redireciona para o app principal
      ) : (
        <Auth /> // Se não houver sessão, redireciona para a tela de login
      )}
    </View>
  );
}
