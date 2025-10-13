import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Image,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'

// Gerenciamento de sessão automática
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const [emailError, setEmailError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  async function signInWithEmail() {
    setLoading(true)
    setEmailError('')
    setPasswordError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const msg = error.message.toLowerCase()

      if (msg.includes('invalid login credentials')) {
        setEmailError('E-mail ou senha incorretos.')
        setPasswordError('E-mail ou senha incorretos.')
      } else {
        Alert.alert('Erro ao entrar', error.message)
      }

      setLoading(false)
      return
    }

    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    setEmailError('')
    setPasswordError('')

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      const msg = error.message.toLowerCase()

      if (msg.includes('already registered') || msg.includes('already exists')) {
        setEmailError('Este e-mail já está em uso.')
      } else if (msg.includes('password')) {
        setPasswordError('Senha inválida ou muito fraca.')
      } else {
        Alert.alert('Erro ao cadastrar', error.message)
      }

      setLoading(false)
      return
    }

    if (!session) {
      Alert.alert('Confira seu e-mail para verificar sua conta!')
    }

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

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <Input
                style={{ outlineStyle: 'none' }}
                onChangeText={(text) => {
                  setEmail(text)
                  if (emailError) setEmailError('')
                }}
                value={email}
                placeholder="Digite seu e-mail"
                autoCapitalize="none"
                containerStyle={styles.inputContainerStyle}
                inputContainerStyle={[
                  styles.inputContainerStyleInner,
                  emailError ? { borderColor: 'red', borderWidth: 1 } : {},
                ]}
                inputStyle={styles.inputStyle}
                placeholderTextColor="#999"
                rightIcon={
                  emailError
                    ? {
                        type: 'font-awesome',
                        name: 'exclamation-circle',
                        color: 'red',
                        size: 20,
                      }
                    : undefined
                }
              />
              {emailError ? (
                <Text style={{ color: 'red', marginLeft: 10 }}>{emailError}</Text>
              ) : null}
            </View>

            {/* Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <Input
                style={{ outlineStyle: 'none' }}
                onChangeText={(text) => {
                  setPassword(text)
                  if (passwordError) setPasswordError('')
                }}
                value={password}
                secureTextEntry={!showPassword}
                placeholder="Digite sua senha"
                autoCapitalize="none"
                containerStyle={styles.inputContainerStyle}
                inputContainerStyle={[
                  styles.inputContainerStyleInner,
                  passwordError ? { borderColor: 'red', borderWidth: 1 } : {},
                ]}
                inputStyle={styles.inputStyle}
                placeholderTextColor="#999999ff"
                rightIcon={{
                  type: 'font-awesome',
                  name: showPassword ? 'eye-slash' : 'eye',
                  color: passwordError ? 'red' : '#666',
                  size: 16,
                  onPress: () => setShowPassword(!showPassword),
                }}
              />
              {passwordError ? (
                <Text style={{ color: 'red', marginLeft: 10 }}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                title="Entrar"
                disabled={loading}
                onPress={signInWithEmail}
                buttonStyle={styles.enterButtonStyle}
                titleStyle={styles.enterButtonTitleStyle}
              />
              <Button
                title="Criar conta"
                disabled={loading}
                onPress={signUpWithEmail}
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
    backgroundColor: '#40466eff',
    zIndex: -1,
  },
  scrollViewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: '#858dbbff',
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
    backgroundColor: '#858dbbff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: { width: 85, height: 85, resizeMode: 'contain', },
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#333',
    borderRadius: 25,
    height: 50,
    width: '100%',
  },
  createButtonTitleStyle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})