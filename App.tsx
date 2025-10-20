import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabase';
import Cornhub from './navegation';
import Auth from './components/Auth';
import TitleScreen from './Screens/TitleFight';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (showTitle) {
    return (
      <TitleScreen 
        onFinish={() => setShowTitle(false)}
        session={session}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {session && session.user ? (
        <Cornhub session={session} />
      ) : (
        <Auth />
      )}
    </View>
  );
}