import React, { useState } from 'react';
import { Image, StyleSheet, Platform, Button, View, ActivityIndicator, Text } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';

interface Employee {
  id: number;
  username: string; 
  mail: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    console.log('fetchEmployees called'); // Ajoutez ceci pour vérifier l'appel

    setLoading(true);
    setError(null); 

    try {
      const response = await axios.get('http://10.134.198.29:1337/api/employees');
      console.log('oui')
      const data = response;
      console.log('Données des employés:', data);

          } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion. Veuillez vérifier l\'adresse IP et le réseau.');
    } finally {
      setLoading(false);

    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Salut les copains !</ThemedText>
      </ThemedView>
      {Platform.select({
        ios: (
          <ThemedText>
            ici il va y avoir le truc de choix d'humeur, j'attends le design de l'app et apres je fetch la db 
          </ThemedText>
        ),
      })}

      <View style={styles.buttonContainer}>
        <Button title="Tester API Strapi" onPress={fetchEmployees} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {/* {employees.length > 0 && (
        <View>
          {employees.map((employee) => (
            <View key={employee.id} style={styles.employeeContainer}>
              <Text style={styles.usernameText}>{employee.username}</Text>
              <Text style={styles.mailText}>{employee.mail}</Text>
            </View>
          ))}
        </View>
      )} */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  employeeContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  usernameText: {
    fontWeight: 'bold',
  },
  mailText: {
    color: '#555',
  },
});
