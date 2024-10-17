import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, Platform, Button, View, ActivityIndicator, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken'); 
      setIsAuthenticated(false); 
      console.log('Déconnexion réussie');
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
          placeholder="Identifiant"
          value={username}
          onChangeText={setUsername} 
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
        />
        <Button
          title="Se connecter"
          onPress={async () => {
            
            await AsyncStorage.setItem('authToken', 'dummy-token'); 
            setIsAuthenticated(true); 
          }}
        />
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
      {Platform.select({
        ios: (
          <ThemedText>
            Ici on va fetch les infos du type depuis la DB 
          </ThemedText>
        ),
      })}

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
    backgroundColor: 'black',
  },
});
