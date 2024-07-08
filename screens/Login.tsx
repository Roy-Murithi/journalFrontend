import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useAuth } from '../app/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Home: undefined
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
    navigation: LoginScreenNavigationProp;
};

const Login = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { onLogin } = useAuth();

    const login = async () => {
        const result = await onLogin!(email, password);
        if (result && result.error) {
            alert(result.msg);
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.welcomeText}>Welcome to Journal App</Text>
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
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity style={styles.button} onPress={login}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <View style={styles.links}>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.link}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    links: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    link: {
        color: '#007AFF',
        fontSize: 16,
    },
});

export default Login;