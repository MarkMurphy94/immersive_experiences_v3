import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged((user) => {
            if (user) {
                router.replace('/(tabs)');  // Only redirect if user is authenticated
            }
        });
        return () => unsubscribe();
    }, []);

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const token = await response.user.getIdToken();
            await AsyncStorage.setItem('@user_token', token);
            // Also store the user ID for future reference
            await AsyncStorage.setItem('@user_id', response.user.uid);
            router.replace('/(tabs)');
        } catch (error: any) {
            console.log(error);
            Alert.alert('Login failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const token = await response.user.getIdToken();
            await AsyncStorage.setItem('@user_token', token);
            // Also store the user ID for future reference
            await AsyncStorage.setItem('@user_id', response.user.uid);
            Alert.alert('Success', 'Account created successfully!');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.log(error);
            Alert.alert('Registration failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Welcome</ThemedText>
                <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
            </ThemedView>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    autoCapitalize="none"
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#0a7ea4" />
                ) : (
                    <>
                        <TouchableOpacity style={styles.button} onPress={signIn}>
                            <ThemedText style={styles.buttonText}>Login</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={signUp}>
                            <ThemedText style={styles.buttonText}>Create Account</ThemedText>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingTop: 60,
        gap: 8,
    },
    subtitle: {
        opacity: 0.7,
    },
    form: {
        padding: 16,
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    signUpButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});