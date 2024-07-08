import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../app/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

type Props = {
    navigation: SignUpScreenNavigationProp;
};

const SignUp = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { onRegister } = useAuth();

    const register = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const result = await onRegister!(email, firstName, lastName, password);
        if (result.error) {
            Alert.alert('Error', result.msg);
        } else {
            Alert.alert('Success', 'Sign Up Successful');
            navigation.navigate('Login');
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.welcomeText}>Create an Account</Text>
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
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholderTextColor="#888"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
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
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity style={styles.button} onPress={register}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Already have an account? Log In</Text>
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

export default SignUp;