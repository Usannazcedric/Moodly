import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, Button, View, Alert, Text, TouchableOpacity, TextInput } from 'react-native';
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
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [description, setDescription] = useState<string>(''); 
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null); 

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setIsAuthenticated(true);
          const decodedToken = parseJwt(token);
          setUserId(decodedToken.id);  
        } else {
          setIsAuthenticated(false);
          setUserId(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      }
    };

    const interval = setInterval(checkAuthToken, 5000);

    checkAuthToken();

    return () => clearInterval(interval);
  }, []);

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

      const response = await axios.post('http://10.134.198.29:1337/api/moods', {
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
            <View style={styles.moodContainer}>
              {[1, 2, 3, 4, 5].map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && styles.moodButtonSelected, 
                    selectedMood === mood && styles.moodButtonSelectedGlow,
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={[
                    styles.moodText,
                    selectedMood === mood && styles.moodTextSelected,
                  ]}>
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
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
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  moodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    marginHorizontal: 10,
  },
  moodButtonSelected: {
    backgroundColor: '#87CEEB',
  },
  moodButtonSelectedGlow: {
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  moodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  moodTextSelected: {
    color: '#FFF200', 
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
    color: 'white', // Changer la couleur du texte en blanc
  },
});
