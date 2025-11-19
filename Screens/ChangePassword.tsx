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
    TouchableOpacity,
    Modal,
} from 'react-native'
import { Input, Button, Icon } from '@rneui/themed'
import { supabase } from '../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient' // --- IMPORTAÇÃO ADICIONADA ---
import { useNavigation } from '@react-navigation/native' // --- IMPORTAÇÃO ADICIONADA ---

// --- DEFINIÇÃO DOS TEMAS (ALTERADO: background virou gradient) ---
const themes = {
    padrao: {
        name: 'Padrão',
        gradient: ['#2d3354', '#40466e'], // Antes era background: '#40466e'
        card: '#5b649bff',
        text: '#ffffffff',
        textSecondary: '#666666',
        inputBackground: '#f5f7ff',
        primary: '#48BB78',
        border: '#e5e7eb',
    },
    altoContraste: {
        name: 'Alto Contraste',
        gradient: ['#000000', '#1a1a1a'], // Antes era background: '#000000'
        card: '#2a2a2a',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        inputBackground: '#1a1a1a',
        primary: '#FFFF00',
        border: '#FFFFFF',
    },
    Vermelho: {
        name: 'Vermelho',
        gradient: ['#542d2dff', '#6e4040ff'], // Antes era background: '#40466e'
        card: '#bb8585ff',
        text: '#000000ff',
        textSecondary: '#666666',
        inputBackground: '#fff5f5ff',
        primary: '#bb4848ff',
        border: '#ebe5e5ff',
    },
    Laranja: {
        name: 'Laranja',
        gradient: ['#54422dff', '#6e5840ff'], // Antes era background: '#40466e'
        card: '#bba485ff',
        text: '#000000ff',
        textSecondary: '#666666',
        inputBackground: '#f5f7ff',
        primary: '#bb8548ff',
        border: '#ebe8e5ff',
    },
    Amarelo: {
        name: 'Amarelo',
        gradient: ['#54532dff', '#6e6d40ff'], // Antes era background: '#40466e'
        card: '#bbba85ff',
        text: '#000000ff',
        textSecondary: '#666666',
        inputBackground: '#f5f7ff',
        primary: '#bbaf48ff',
        border: '#e5e7eb',
    },
    Verde: {
        name: 'Verde',
        gradient: ['#2d542fff', '#4b6e40ff'], // Antes era background: '#40466e'
        card: '#85bb91ff',
        text: '#000000ff',
        textSecondary: '#666666',
        inputBackground: '#f5f7ff',
        primary: '#48BB78',
        border: '#e5e7eb',
    },
    azulClaro: {
        name: 'Azul Claro',
        gradient: ['#5b6b85', '#93a5c5'], // Antes era background: '#5b6b85'
        card: '#c5d0e6',
        text: '#1e293b',
        textSecondary: '#64748b',
        inputBackground: '#e8ecf5',
        primary: '#3B82F6',
        border: '#cbd5e1',
    },
    azulEscuro: {
        name: 'Azul Escuro',
        gradient: ['#233283ff', '#17226dff'], // Antes era background: '#40466e'
        card: '#6679e7ff',
        text: '#000000ff',
        textSecondary: '#666666',
        inputBackground: '#f5f7ff',
        primary: '#4850bbff',
        border: '#e5e7eb',
    },
    roxo: {
        name: 'Roxo',
        gradient: ['#2f1d33ff', '#55305aff'], // Antes era background: '#1d2033'
        card: '#823da1ff',
        text: '#FFFFFF',
        textSecondary: '#a0a0a0',
        inputBackground: '#5d2f72ff',
        primary: '#ca5cf6ff',
        border: '#6f4a7aff',
    },
    cinza: {
        name: 'Cinza',
        gradient: ['#808080', '#A9A9A9'], // Antes era background: '#40466e'
        card: '#8d8d8dff',
        text: '#000000ff',
        textSecondary: '#666666',
        inputBackground: '#f5f7ff',
        primary: '#383838ff',
        border: '#e5e7eb',
    },
}

export default function ChangePassword() {
    const navigation = useNavigation() // --- HOOK DE NAVEGAÇÃO ADICIONADO ---
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

    const [currentTheme, setCurrentTheme] = useState('padrao')
    const [showThemeModal, setShowThemeModal] = useState(false)

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('app_theme')
                if (savedTheme && themes[savedTheme as keyof typeof themes]) {
                    setCurrentTheme(savedTheme)
                }
            } catch (error) {
                console.log('Erro ao carregar tema:', error)
            }
        }
        loadTheme()
    }, [])

    const changeTheme = async (themeKey: string) => {
        setCurrentTheme(themeKey)
        setShowThemeModal(false)
        try {
            await AsyncStorage.setItem('app_theme', themeKey)
        } catch (error) {
            console.log('Erro ao salvar tema:', error)
        }
    }

    const theme = themes[currentTheme as keyof typeof themes]

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
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/
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
            {/* --- ALTERAÇÃO: View substituída por LinearGradient --- */}
            <LinearGradient
                colors={theme.gradient}
                locations={[0.65, 0.30]}
                start={{ x: 1, y: 1 }}
                end={{ x: 0.85, y: 0.4 }}
                style={styles.backgroundView}
            >
                {/* --- BOTÃO DE RETORNO ADICIONADO --- */}
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.returnButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                {/* BOTÃO DE TEMA */}
                <TouchableOpacity 
                    style={styles.themeButton}
                    onPress={() => setShowThemeModal(true)}
                >
                    <Ionicons name="color-palette" size={28} color={theme.text} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={[styles.cardContainer, { backgroundColor: theme.card, outlineStyle: 'none' }]}>
                        <Text style={[styles.titleText, { color: theme.text }]}>Alterar Senha</Text>

                        {/* SENHA ATUAL */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Senha Atual</Text>
                            <Input
                                value={currentPassword}
                                onChangeText={(t) => {
                                    setCurrentPassword(t)
                                    if (currentError) setCurrentError('')
                                }}
                                placeholder="Digite sua senha atual"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry={!showCurrent}
                                containerStyle={styles.inputContainerStyle}
                                inputContainerStyle={[
                                    styles.inputInner,
                                    { backgroundColor: theme.inputBackground },
                                    currentError ? styles.errorBorder : {},
                                ]}
                                inputStyle={[styles.inputStyle, { color: theme.text, outlineStyle: 'none' }]}
                                rightIcon={
                                    <Icon
                                        name={showCurrent ? 'eye-slash' : 'eye'}
                                        type="font-awesome"
                                        size={16}
                                        onPress={() => setShowCurrent((s) => !s)}
                                        color={theme.textSecondary}
                                    />
                                }
                            />
                            {currentError ? (
                                <Text style={styles.errorText}>{currentError}</Text>
                            ) : null}
                        </View>

                        {/* NOVA SENHA */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Nova Senha</Text>
                            <Input
                                value={newPassword}
                                onChangeText={(t) => {
                                    setNewPassword(t)
                                    if (newError) setNewError('')
                                }}
                                placeholder="Digite a nova senha"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry={!showNew}
                                containerStyle={styles.inputContainerStyle}
                                inputContainerStyle={[
                                    styles.inputInner,
                                    { backgroundColor: theme.inputBackground },
                                    newError ? styles.errorBorder : {},
                                ]}
                                inputStyle={[styles.inputStyle, { color: theme.text, outlineStyle: 'none' }]}
                                rightIcon={
                                    <Icon
                                        name={showNew ? 'eye-slash' : 'eye'}
                                        type="font-awesome"
                                        size={16}
                                        onPress={() => setShowNew((s) => !s)}
                                        color={theme.textSecondary}
                                    />
                                }
                            />
                            {newError ? <Text style={styles.errorText}>{newError}</Text> : null}
                        </View>

                        {/* CONFIRMAR SENHA */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Confirmar Nova Senha</Text>
                            <Input
                                value={confirmPassword}
                                onChangeText={(t) => {
                                    setConfirmPassword(t)
                                    if (confirmError) setConfirmError('')
                                }}
                                placeholder="Confirme a nova senha"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry={!showConfirm}
                                containerStyle={styles.inputContainerStyle}
                                inputContainerStyle={[
                                    styles.inputInner,
                                    { backgroundColor: theme.inputBackground },
                                    confirmError ? styles.errorBorder : {},
                                ]}
                                inputStyle={[styles.inputStyle, { color: theme.text, outlineStyle: 'none' }]}
                                rightIcon={
                                    <Icon
                                        name={showConfirm ? 'eye-slash' : 'eye'}
                                        type="font-awesome"
                                        size={16}
                                        onPress={() => setShowConfirm((s) => !s)}
                                        color={theme.textSecondary}
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
                                buttonStyle={[styles.primaryButton, { backgroundColor: theme.primary }]}
                                titleStyle={styles.primaryButtonTitle}
                            />
                            {loading ? <ActivityIndicator style={{ marginTop: 12 }} color={theme.primary} /> : null}
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>

            {/* MODAL DE SELEÇÃO DE TEMA */}
            <Modal
                visible={showThemeModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowThemeModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowThemeModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha um Tema</Text>
                        
                        <ScrollView style={styles.themeList}>
                            {Object.entries(themes).map(([key, themeOption]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.themeOption,
                                        { 
                                            backgroundColor: themeOption.inputBackground,
                                            borderColor: currentTheme === key ? themeOption.primary : 'transparent',
                                        }
                                    ]}
                                    onPress={() => changeTheme(key)}
                                >
                                    <Text style={[styles.themeName, { color: themeOption.text }]}>
                                        {themeOption.name}
                                    </Text>
                                    <View style={styles.colorPreview}>
                                        <View style={[styles.colorSwatch, { backgroundColor: themeOption.gradient[0] }]} />
                                        <View style={[styles.colorSwatch, { backgroundColor: themeOption.card }]} />
                                        <View style={[styles.colorSwatch, { backgroundColor: themeOption.primary }]} />
                                    </View>
                                    {currentTheme === key && (
                                        <Ionicons name="checkmark-circle" size={24} color={themeOption.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: theme.primary }]}
                            onPress={() => setShowThemeModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundView: {
        flex: 1,
    },
    // --- ESTILO DO BOTÃO DE RETORNO ADICIONADO ---
    returnButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 25,
        backgroundColor: 'rgba(94, 92, 119, 0.7)',
    },
    themeButton: {
        position: 'absolute',
        top: 50,
        right: 30,
        zIndex: 10,
        padding: 8,
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
        textAlign: 'center',
    },
    inputWrapper: { marginBottom: 12 },
    inputLabel: {
        fontWeight: '600',
        marginLeft: 8,
        marginBottom: 6,
        fontSize: 14,
    },
    inputContainerStyle: { paddingHorizontal: 0 },
    inputInner: {
        borderBottomWidth: 0,
        borderRadius: 20,
        paddingHorizontal: 14,
        height: 48,
    },
    inputStyle: { fontSize: 15 },
    errorText: { color: '#f54646ff', marginLeft: 8, marginTop: 5, fontSize: 12 },
    errorBorder: { borderColor: '#f54646ff', borderWidth: 1 },
    buttonBlock: { marginTop: 18, alignItems: 'center' },
    primaryButton: {
        width: '100%',
        borderRadius: 20,
        height: 50,
    },
    primaryButtonTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    themeList: {
        maxHeight: 350,
    },
    themeOption: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    themeName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    colorPreview: {
        flexDirection: 'row',
        gap: 6,
        marginRight: 10,
    },
    colorSwatch: {
        width: 20,
        height: 20,
        borderRadius: 4,
    },
    closeButton: {
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
    },
})