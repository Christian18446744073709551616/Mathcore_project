import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, KeyboardAvoidingView, Platform, ScrollView, Text, Image } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.backgroundView}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.cardContainer}>
            {/* Logo e Título */}
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/iconmathcore1.png')} 
                  style={styles.logoImage}
                />
              </View>
              <Text style={styles.titleText}>MathCore</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>

              <Input
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="Digite seu e-mail"
                autoCapitalize={'none'}
                containerStyle={styles.inputContainerStyle}
                inputContainerStyle={styles.inputContainerStyleInner}
                inputStyle={styles.inputStyle}
                placeholderTextColor="#999"
              />

            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>

              <Input

                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={!showPassword}
                placeholder="Digite sua senha"
                autoCapitalize={'none'}
                containerStyle={styles.inputContainerStyle}
                inputContainerStyle={styles.inputContainerStyleInner}
                inputStyle={styles.inputStyle}
                placeholderTextColor="#999999ff"
                rightIcon={{
                  type: 'font-awesome',
                  name: showPassword ? 'eye-slash' : 'eye',
                  color: '#666',
                  size: 16,
                  onPress: () => setShowPassword(!showPassword)
                }}
              />
            </View>

        

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                title="Entrar"
                disabled={loading}
                onPress={() => signInWithEmail()}
                buttonStyle={styles.enterButtonStyle}
                titleStyle={styles.enterButtonTitleStyle}
              />
              
              <Button
                title="Criar conta"
                disabled={loading}
                onPress={() => signUpWithEmail()}
                buttonStyle={styles.createButtonStyle}
                titleStyle={styles.createButtonTitleStyle}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#40466eff', // Fundo roxo/azul da imagem
    zIndex: -1,
  },
  scrollViewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: '#858dbbff', // Card
    borderRadius: 25,
    padding: 30,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#858dbbff', // Fundo vermelho/laranja do ícone
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333ff',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,

    color: '#000000ff',

    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainerStyle: {
    paddingHorizontal: 0,
  },
  inputContainerStyleInner: {
  borderBottomWidth: 0,
  backgroundColor: '#f5f5f5',
  borderRadius: 25,
  paddingHorizontal: 20,
  height: 50,

  
},
  
  inputStyle: {
    fontSize: 16,
    color: '#333',

  },
  
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  enterButtonStyle: {
    backgroundColor: '#4CAF50', // Verde do botão Entrar
    borderRadius: 25,
    height: 50,
    width: '100%',
  },
  enterButtonTitleStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',

  },
  createButtonStyle: {
    backgroundColor: '#333', // Preto do botão Criar conta
    borderRadius: 25,
    height: 50,
    width: '100%',
  },

  createButtonTitleStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  logoImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
  },
})