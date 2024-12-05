import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const Loading = ({ message = "Carregando..." }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Fundo escuro para combinar com o tema do app
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default Loading;
