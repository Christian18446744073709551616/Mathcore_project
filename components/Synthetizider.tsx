import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider'; // Certifique-se de ter instalado este pacote
import { Session } from '@supabase/supabase-js';

interface SynthProps {
  session: Session;
  navigation: any;
}

const Synth: React.FC<SynthProps> = ({ session, navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Synth Component</Text>
      {/* Aqui você pode adicionar os controles de volume, tema, música, etc */}
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default Synth;
