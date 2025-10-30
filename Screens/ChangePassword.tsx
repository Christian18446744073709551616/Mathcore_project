import React, { useState, useEffect } from 'react'
import {
    Alert,
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    ActivityIndicator,
} from 'react-native'
import { Input, Button, Icon } from '@rneui/themed'
import { supabase } from '../lib/supabase'

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const [currentError, setCurrentError] = useState('')
    const [newError, setNewError] = useState('')
    const [confirmError, setConfirmError] = useState('')
    const [userEmail, setUserEmail] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        async function loadUser() {
            const { data, error } = await supabase.auth.getUser()
            if (!error && isMounted) setUserEmail(data.user?.email ?? null)
        }
        loadUser()
        return () => {
            isMounted = false
        }
    }, [])

    function resetErrors() {
        setCurrentError('')
        setNewError('')
        setConfirmError('')
    }

    function validatePasswordStrength(password: string) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/ // mesmas regras do cadastro
        return regex.test(password)
    }

    function validateLocal() {
        resetErrors()
        let ok = true
        if (!currentPassword) {
            setCurrentError('Informe a senha atual.')
            ok = false
        }
        if (!newPassword) {
            setNewError('Informe a nova senha.')
            ok = false
        } else if (newPassword.length < 6) {
            setNewError('A senha deve ter ao menos 6 caracteres.')
            ok = false
        } else if (!validatePasswordStrength(newPassword)) {
            setNewError(
                'A senha deve conter letra maiúscula, minúscula, número e símbolo.'
            )
            ok = false
        }
        if (confirmPassword !== newPassword) {
            setConfirmError('As senhas não coincidem.')
            ok = false
        }
        return ok
    }

    async function handleChangePassword() {
        if (!validateLocal()) return
        if (!userEmail) {
            Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.')
            return
        }

        setLoading(true)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: currentPassword,
        })
        if (signInError) {
            setLoading(false)
            setCurrentError('Senha atual incorreta.')
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        })

        setLoading(false)
        if (updateError) {
            const msg = updateError.message.toLowerCase()
            if (msg.includes('password')) {
                setNewError('Senha inválida ou não atende aos requisitos.')
            } else {
                Alert.alert('Erro', updateError.message)
            }
            return
        }

        Alert.alert('Sucesso', 'Senha alterada com sucesso!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.backgroundView}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={[styles.cardContainer, { outlineStyle: 'none' }]}>
                        <Text style={styles.titleText}>Alterar Senha</Text>

                        {/* SENHA ATUAL */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Senha Atual</Text>
                            <Input
                                value={currentPassword}
                                onChangeText={(t) => {
                                    setCurrentPassword(t)
                                    if (currentError) setCurrentError('')
                                }}
                                placeholder="Digite sua senha atual"
                                secureTextEntry={!showCurrent}
                                containerStyle={styles.inputContainerStyle}
                                inputContainerStyle={[
                                    styles.inputInner,
                                    currentError ? styles.errorBorder : {},
                                ]}
                              inputStyle={[styles.inputStyle, {outlineStyle: 'none'},]}
                                rightIcon={
                                    <Icon
                                        name={showCurrent ? 'eye-slash' : 'eye'}
                                        type="font-awesome"
                                        size={16}
                                        onPress={() => setShowCurrent((s) => !s)}
                                        color="#333"
                                    />
                                }
                            />
                            {currentError ? (
                                <Text style={styles.errorText}>{currentError}</Text>
                            ) : null}
                        </View>

                        {/* NOVA SENHA */}
                        <View style={[styles.inputWrapper]}>
                            <Text style={styles.inputLabel}>Nova Senha</Text>
                            <Input
                                value={newPassword}
                                onChangeText={(t) => {
                                    setNewPassword(t)
                                    if (newError) setNewError('')
                                }}
                                placeholder="Digite a nova senha"
                                secureTextEntry={!showNew}
                                containerStyle={styles.inputContainerStyle}
                                inputContainerStyle={[
                                   
                                    styles.inputInner,
                                    newError ? styles.errorBorder : {},
                                ]}
                                inputStyle={[styles.inputStyle, {outlineStyle: 'none'},]}
                                rightIcon={
                                    <Icon
                                        name={showNew ? 'eye-slash' : 'eye'}
                                        type="font-awesome"
                                        size={16}
                                        onPress={() => setShowNew((s) => !s)}
                                        color="#333"
                                    />
                                }
                            />
                            {newError ? <Text style={styles.errorText}>{newError}</Text> : null}
                        </View>

                        {/* CONFIRMAR SENHA */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
                            <Input
                                value={confirmPassword}
                                onChangeText={(t) => {
                                    setConfirmPassword(t)
                                    if (confirmError) setConfirmError('')
                                }}
                                placeholder="Confirme a nova senha"
                                secureTextEntry={!showConfirm}
                                containerStyle={styles.inputContainerStyle}
                                inputContainerStyle={[
                                    styles.inputInner,
                                    confirmError ? styles.errorBorder : {},
                                ]}
                                inputStyle={[styles.inputStyle, {outlineStyle: 'none'},]}
                                rightIcon={
                                    <Icon
                                        name={showConfirm ? 'eye-slash' : 'eye'}
                                        type="font-awesome"
                                        size={16}
                                        onPress={() => setShowConfirm((s) => !s)}
                                        color="#333"
                                    />
                                }
                            />
                            {confirmError ? (
                                <Text style={styles.errorText}>{confirmError}</Text>
                            ) : null}
                        </View>

                        {/* BOTÃO */}
                        <View style={styles.buttonBlock}>
                            <Button
                                title="Salvar Alterações"
                                onPress={handleChangePassword}
                                disabled={loading}
                                buttonStyle={styles.primaryButton}
                                titleStyle={styles.primaryButtonTitle}
                            />
                            {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundView: {
        flex: 1,
        backgroundColor: '#40466e',
    },
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#858dbbff',
        borderRadius: 25,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        color: '#ffffffff',
        textAlign: 'center',
    },
    inputWrapper: { marginBottom: 12 },
    inputLabel: {
        color: '#f0f0f0',
        marginLeft: 8,
        marginBottom: 6,
        fontSize: 14,
    },
    inputContainerStyle: { paddingHorizontal: 0 },
    inputInner: {
        borderBottomWidth: 0,
        backgroundColor: '#f5f7ff',
        borderRadius: 20,
        paddingHorizontal: 14,
        height: 48,
    },
    inputStyle: { fontSize: 15, color: '#111827' },
    errorText: { color: '#ff6b6b', marginLeft: 8, marginTop: 5, fontSize: 12 },
    errorBorder: { borderColor: '#ff6b6b', borderWidth: 1 },
    buttonBlock: { marginTop: 18, alignItems: 'center' },
    primaryButton: {
        width: '100%',
        borderRadius: 20,
        height: 50,
        backgroundColor: '#48BB78',
    },
    primaryButtonTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#fff',
    },
})
