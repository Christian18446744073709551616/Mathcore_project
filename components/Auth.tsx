import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
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
          <View style={styles.verticallySpaced}>
            <Input
              label="Email"
              leftIcon={{ type: 'font-awesome', name: 'envelope' }}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize={'none'}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Input
              label="Password"
              leftIcon={{ type: 'font-awesome', name: 'lock' }}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize={'none'}
              inputStyle={styles.inputStyle}
              labelStyle={styles.labelStyle}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              title="Sign in"
              disabled={loading}
              onPress={() => signInWithEmail()}
              buttonStyle={styles.buttonStyle}
              titleStyle={styles.buttonTitleStyle}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              title="Sign up"
              disabled={loading}
              onPress={() => signUpWithEmail()}
              buttonStyle={styles.buttonStyle}
              titleStyle={styles.buttonTitleStyle}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Occupy the full height of the screen
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  backgroundView: {
    position: 'absolute', // Position the background behind the form
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0f25', // Dark blue background
    zIndex: -1, // Ensure the background stays behind the content
  },
  scrollViewContainer: {
    justifyContent: 'center', // Ensure content stays centered
    alignItems: 'center', // Center items horizontally
    flexGrow: 1, // Allow content to grow in case the keyboard is shown
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  inputStyle: {
    backgroundColor: '#2a2a2a', // Dark background for inputs
    borderRadius: 10, // Rounded corners for input fields
    color: 'white', // White text for contrast
    paddingLeft: 10,
    fontSize: 16,
    borderWidth: 1, // Border width to make it visible
    borderColor: '#ffffff', // White border color
  },
  labelStyle: {
    color: '#00ff99', // Neon green label for futuristic look
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonStyle: {
    backgroundColor: 'black', // Transparent background for buttons
    borderRadius: 10,
    borderWidth: 2, // White border around the buttons
    borderColor: '#ffffff', // White border color
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  buttonTitleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // White text for contrast
  },
})

