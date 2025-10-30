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
  TouchableOpacity,
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
  const [isSignUp, setIsSignUp] = useState<boolean>(false)

  // Login states
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  // SignUp states
  const [name, setName] = useState<string>('')
  const [nameError, setNameError] = useState<string>('')
  const [hasTEA, setHasTEA] = useState<boolean | null>(null)

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
    setNameError('')
    setEmailError('')
    setPasswordError('')

    // Validações
    if (!name.trim()) {
      setNameError('Digite seu nome')
      setLoading(false)
      return
    }
    if (!email.trim()) {
      setEmailError('Digite seu e-mail')
      setLoading(false)
      return
    }
    if (!password) {
      setPasswordError('Digite sua senha')
      setLoading(false)
      return
    }
    if (hasTEA === null) {
      Alert.alert('Atenção', 'Por favor, selecione se você tem TEA')
      setLoading(false)
      return
    }

    // Cria usuário no Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { has_tea: hasTEA } },
    })

    if (error) {
      Alert.alert('Erro ao criar conta', error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const userId = data.user.id

      // Cria perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: name.trim(),
          has_tea: hasTEA,
          avatar_url: '',
          updated_at: new Date(),
        })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        Alert.alert('Erro', 'Não foi possível criar seu perfil.')
      } else {
        console.log('Perfil criado com sucesso!', name)

        // ==== ADICIONE ISSO PARA TESTES ====
        // Busca o perfil logo após criar para ver se o nome está lá
        const { data: profileData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (fetchError) {
          console.error('Erro ao buscar perfil após criação:', fetchError)
        } else {
          console.log('Nome do usuário após criação:', profileData.username)
        }
        // ===================================
      }
    }

    Alert.alert(
      'Verifique seu e-mail',
      'Enviamos um link de confirmação. Após confirmar, entre novamente.'
    )
    setLoading(false)
  }


  function switchToSignUp() {
    setIsSignUp(true)
    // Limpa erros
    setEmailError('')
    setPasswordError('')
    setNameError('')
  }

  function switchToLogin() {
    setIsSignUp(false)
    // Limpa erros
    setEmailError('')
    setPasswordError('')
    setNameError('')
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

            {/* TELA DE LOGIN */}
            {!isSignUp && (
              <>
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
                    placeholder="Qual seu e-mail?"
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
                    placeholder="Escolha uma senha"
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
                    title="Primeiro acesso?"
                    disabled={loading}
                    onPress={switchToSignUp}
                    buttonStyle={styles.firstAccessButtonStyle}
                    titleStyle={styles.firstAccessButtonTitleStyle}
                  />
                  <Button
                    title="Entrar"
                    disabled={loading}
                    onPress={signInWithEmail}
                    buttonStyle={styles.enterButtonStyle}
                    titleStyle={styles.enterButtonTitleStyle}
                  />
                </View>
              </>
            )}

            {/* TELA DE CADASTRO */}
            {isSignUp && (
              <>
                {/* Nome */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nome de Usuário</Text>
                  <Input
                    style={{ outlineStyle: 'none' }}
                    onChangeText={(text) => {
                      setName(text)
                      if (nameError) setNameError('')
                    }}
                    value={name}
                    placeholder="Qual seu nome?"
                    autoCapitalize="words"
                    containerStyle={styles.inputContainerStyle}
                    inputContainerStyle={[
                      styles.inputContainerStyleInner,
                      nameError ? { borderColor: 'red', borderWidth: 1 } : {},
                    ]}
                    inputStyle={styles.inputStyle}
                    placeholderTextColor="#999"
                  />
                  {nameError ? (
                    <Text style={{ color: 'red', marginLeft: 10 }}>{nameError}</Text>
                  ) : null}
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
                    placeholder="Qual seu e-mail?"
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
                    placeholder="Escolha uma senha"
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

                {/* TEA */}
                <View style={styles.teaContainer}>
                  <Text style={styles.teaQuestion}>Você tem TEA?</Text>
                  <View style={styles.teaOptions}>
                    <TouchableOpacity
                      style={styles.teaOption}
                      onPress={() => setHasTEA(true)}
                    >
                      <View
                        style={[
                          styles.teaRadio,
                          hasTEA === true && styles.teaRadioSelected,
                        ]}
                      >
                        {hasTEA === true && <View style={styles.teaRadioInner} />}
                      </View>
                      <Text style={styles.teaLabel}>Sim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.teaOption}
                      onPress={() => setHasTEA(false)}
                    >
                      <View
                        style={[
                          styles.teaRadio,
                          hasTEA === false && styles.teaRadioSelectedNo,
                        ]}
                      >
                        {hasTEA === false && <View style={styles.teaRadioInner} />}
                      </View>
                      <Text style={styles.teaLabel}>Não</Text>
                    </TouchableOpacity>
                  </View>

                  {hasTEA === true && (
                    <View style={styles.teaInfo}>
                      <Text style={styles.teaInfoText}>
                        Ao selecionar "Sim" você ativará novas funções de
                        personalização do MathCore (essa opção poderá ser editada a
                        qualquer momento nas configurações do aplicativo)
                      </Text>
                    </View>
                  )}
                </View>

                {/* Botões */}
                <View style={styles.buttonContainer}>
                  <Button
                    title="Criar conta"
                    disabled={loading}
                    onPress={signUpWithEmail}
                    buttonStyle={styles.enterButtonStyle}
                    titleStyle={styles.enterButtonTitleStyle}
                  />
                </View>

                {/* Link voltar */}
                <TouchableOpacity style={styles.backLink} onPress={switchToLogin}>
                  <Text style={styles.backLinkText}>Já tenho conta</Text>
                </TouchableOpacity>
              </>
            )}
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
    marginBottom: 30,
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
  logoImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
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
    fontWeight: '500',
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
  teaContainer: {
    width: '100%',
    marginVertical: 10,
  },
  teaQuestion: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  teaOptions: {
    flexDirection: 'row',
    gap: 20,
  },
  teaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teaRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teaRadioSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  teaRadioSelectedNo: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  teaRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  teaLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  teaInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  teaInfoText: {
    fontSize: 11,
    color: '#000',
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginTop: 5,
  },
  firstAccessButtonStyle: {
    backgroundColor: '#000000ff',
    borderRadius: 25,
    height: 45,
    width: '100%',
  },
  firstAccessButtonTitleStyle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  enterButtonStyle: {
    backgroundColor: '#319e35ff',
    borderRadius: 25,
    height: 50,
    width: '100%',
  },
  enterButtonTitleStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  backLink: {
    marginTop: 15,
  },
  backLinkText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
})