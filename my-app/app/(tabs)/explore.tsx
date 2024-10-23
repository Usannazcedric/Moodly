import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, Button, View, ActivityIndicator, TextInput, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Mood {
  id: number;
  Rate: number;
  Description: string | null;
  user: {
    id: number;
    username: string;
  };
}

export default function TabTwoScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [moods, setMoods] = useState<Mood[]>([]);

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        fetchUserData(token);
        fetchUserMoods(token);
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
      const response = await axios.post('http://10.134.198.29:1337/api/auth/local', {
        identifier: email,
        password: password,
      });

      const { jwt, user } = response.data;
      await AsyncStorage.setItem('authToken', jwt);
      setIsAuthenticated(true);
      setUsername(user.username);
      fetchUserMoods(jwt);
    } catch (error) {
      Alert.alert('Erreur', 'Identifiants incorrects.');
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erreur lors du décryptage du token:', error);
      return null;
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('http://10.134.198.29:1337/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(response.data.username);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  };

  const fetchUserMoods = async (token: string) => {
    try {
      const decodedToken = parseJwt(token);
      if (!decodedToken || !decodedToken.id) {
        throw new Error('Impossible de décrypter le token.');
      }

      const userId = decodedToken.id;

      const response = await axios.get('http://10.134.198.29:1337/api/moods?populate=*', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userMoods = response.data.data.filter((mood: Mood) => mood.user.id === userId);
      setMoods(userMoods);
    } catch (error) {
      console.error('Erreur lors de la récupération des moods:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUsername('');
      setMoods([]);
      Alert.alert('Déconnexion réussie', 'Vous avez été déconnecté.');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };


  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMoodsPeriodically = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        fetchUserMoods(token);
      }
    };

    if (isAuthenticated) {
      interval = setInterval(fetchMoodsPeriodically, 5000);
    }

    return () => clearInterval(interval); 
  }, [isAuthenticated]);

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
       <View style={styles.textContainer}>
    <ThemedText type="title" style={{ color: 'black' }}>Se connecter</ThemedText>
    <ThemedText type="title" style={{ color: 'grey', fontSize: 14, lineHeight: 18 }}>
      Partagez, discutez et améliorez
      
    </ThemedText>
    <ThemedText type="title" style={{ color: 'grey', fontSize: 14, lineHeight: 18 }}>
    ce que vous ressentez avec votre équipe.
    </ThemedText>
    
  </View>


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
        {username ? (
          <ThemedText type="subtitle">Bienvenue, {username} !</ThemedText>
        ) : (
          <ThemedText type="subtitle">Chargement...</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.moodContainer}>
        <ThemedText type="title" style={{ color: 'black' }}>Mes Humeurs</ThemedText>
        {moods.length > 0 ? (
          <FlatList
            data={moods}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.moodItem}>
                <ThemedText style={[styles.moodText, { color: 'black' }]}>
                  {`Humeur: ${item.Rate} - ${item.Description || 'Pas de description'}`}
                </ThemedText>
              </View>
            )}
          />
        ) : (
          <ThemedText style={{ color: 'black' }}>Aucune humeur enregistrée.</ThemedText>
        )}
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
  moodContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center', // Pour centrer le texte
    marginVertical: 20, // Ajoute un peu d'espace vertical
    marginBottom: 70
  },
  moodItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonContainer: {
    paddingHorizontal: 20,
  },
  loginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    height: '40%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 275,
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
