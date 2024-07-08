import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../app/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';


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
            alert('Sign Up SuccessFul');
            navigation.navigate('Login');
        }
    };

    return (
        <View style={styles.container}>
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
                />
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={register}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already have an account? Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ... styles remain the same

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 40,
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    input: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
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