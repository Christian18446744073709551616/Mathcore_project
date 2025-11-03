import React from 'react';
import { View, StyleSheet } from 'react-native';
import Account from '../components/Account';
import { Session } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';

interface SettingsScreenProps {
  session: Session;
  navigation: any; // Para garantir que a prop navigation está sendo passada corretamente
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ session, navigation }) => {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#242948', '#5C6494']}
        locations={[0.65, 0.3]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.85, y: 0.4 }}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <Account session={session} navigation={navigation} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor removido para usar o gradiente
  },
});

export default SettingsScreen;
