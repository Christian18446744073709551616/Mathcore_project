import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useLoading } from '../context/LoadingContext'; // Importa o contexto de carregamento

const TestLoadingScreen: React.FC = () => {
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    // Simula um carregamento de 3 segundos
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>Carregamento Concluído</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TestLoadingScreen;
