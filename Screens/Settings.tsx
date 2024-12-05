import React from 'react';
import { View, StyleSheet } from 'react-native';
import Account from '../components/Account';
import { Session } from '@supabase/supabase-js';

interface SettingsScreenProps {
  session: Session;
  navigation: any; // Para garantir que a prop navigation está sendo passada corretamente
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ session, navigation }) => {
  return (
    <View style={styles.container}>
      <Account session={session} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0f14',
    padding: 20,
  },
});

export default SettingsScreen;
