import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../app/context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [new_password, setNewPassword] = useState('');
    const { onResetPassword } = useAuth();
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

    const resetPassword = async () => {
        const result = await onResetPassword!(email, new_password);
        if (result && result.error) {
            Alert.alert('Error', result.msg);
        } else {
            Alert.alert('Success', 'Password reset successful');
            navigation.navigate('Login');
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.welcomeText}>Reset Password</Text>
                <Image
                    source={{ uri: 'https://galaxies.dev/img/logos/logo-blue.png' }}
                    style={styles.logo}
                />
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholderTextColor="#888"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        value={new_password}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity style={styles.button} onPress={resetPassword}>
                        <Text style={styles.buttonText}>Reset Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.link}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 30,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    link: {
        color: '#007AFF',
        fontSize: 16,
    },
});

export default ForgotPassword;