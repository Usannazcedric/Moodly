import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, Button, View, Alert, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [description, setDescription] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null); 

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        const decodedToken = parseJwt(token);
        setUserId(decodedToken.id);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
      }
    };

    checkAuthToken(); // Vérification initiale

    const interval = setInterval(checkAuthToken, 5000); // Vérification toutes les 5 secondes

    return () => clearInterval(interval); // Nettoyage lors du démontage
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUserId(null);
      setDescription('');
      setSelectedMood(null);
      Alert.alert('Déconnexion réussie', 'Vous êtes maintenant déconnecté.');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleConfirmMood = async () => {
    if (selectedMood === null) {
      Alert.alert('Erreur', 'Veuillez sélectionner une humeur avant de confirmer.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez fournir une description de votre humeur.');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Erreur', 'Vous devez être connecté pour enregistrer votre humeur.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token || !userId) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }

      await axios.post('http://10.134.198.29:1337/api/moods', {
        data: {
          Rate: selectedMood,
          user: userId,
          Description: description,
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Succès', 'Votre humeur a été enregistrée avec succès !');
      setDescription('');
      setSelectedMood(null);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'humeur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de votre humeur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Image />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Moodly</ThemedText>
      </ThemedView>
      {Platform.select({
        ios: (
          <>
            <ThemedText>Comment vous sentez-vous aujourd'hui ?</ThemedText>
            <View style={styles.sliderContainer}>
              <Slider
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={selectedMood !== null ? selectedMood : 1} 
                onValueChange={(value) => setSelectedMood(value)} 
                style={styles.slider}
                minimumTrackTintColor="#87CEEB"
                maximumTrackTintColor="#A1CEDC"
              />
              <ThemedText style={styles.sliderValue}>{selectedMood || 1}</ThemedText>
            </View>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Dites-nous comment vous vous sentez..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Confirmer mon Mood"
                onPress={handleConfirmMood}
                disabled={loading || !isAuthenticated}
              />
            </View>
            {loading && <ThemedText>Envoi en cours...</ThemedText>}
            {!isAuthenticated && <ThemedText style={styles.errorText}>Veuillez vous connecter pour enregistrer votre mood.</ThemedText>}
          </>
        ),
      })}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  slider: {
    width: '80%',
    height: 40,
  },
  sliderValue: {
    fontSize: 20,
    marginTop: 10,
    color: 'orange',
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  descriptionInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 20,
    color: 'white',
  },
});
