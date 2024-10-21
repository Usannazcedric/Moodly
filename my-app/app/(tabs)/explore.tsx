import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, Platform, Button, View, ActivityIndicator, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://10.134.198.29:1337/api/users', {
        identifier: email,
        password: password,
      });

      const { jwt } = response.data; // jwt = token retourné par Strapi
      await AsyncStorage.setItem('authToken', jwt);
      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Erreur', 'Identifiants incorrects.');
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isAuthenticated === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <ThemedText type="title">Connexion</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Button title="Se connecter" onPress={handleLogin} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={(
        <Image
          style={styles.headerImage}
        />
      )}
    >
      <ThemedView>
        <ThemedText type="title">Mon compte</ThemedText>
      </ThemedView>

      <View style={styles.logoutButtonContainer}>
        <Button title="Déconnexion" onPress={handleLogout} />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  logoutButtonContainer: {
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  loginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    height: '30%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 325,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: 'white',
  },
});
