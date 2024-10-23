<script setup>
import { ref } from 'vue';
import axios from 'axios';

// Variables réactives
const email = ref('');
const password = ref('');
const message = ref('');
const token = ref('');

// Fonction de connexion
const login = async () => {
  try {
    // Requête pour récupérer les managers
    const response = await axios.get('http://localhost:1337/api/managers');

    // Vérification des données reçues
    const manager = response.data.data.find(
      (manager) => manager.mail === email.value && manager.Confirmed
    );

    if (manager) {
      // Générer un token fictif pour la connexion
      token.value = 'faketoken_' + manager.documentId;  // Génération de token basé sur documentId ou autre logique
      localStorage.setItem('token', token.value); // Stocker le token dans le local storage
      message.value = 'Connexion réussie'; // Afficher un message de succès
    } else {
      message.value = 'Email ou mot de passe incorrect'; // Si pas de correspondance
    }
  } catch (error) {
    console.error(error);
    message.value = 'Une erreur s\'est produite lors de la connexion'; // Message d'erreur en cas de problème avec la requête
  }
};
</script>

<template>
  <div class="login-container">
    <h2>Se connecter</h2>
    
    <form class="login-form" @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="Entrez votre email" 
          required 
        />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Entrez votre mot de passe" 
          required 
        />
      </div>

      <button type="submit" class="login-btn">Connexion</button>
    </form>

    <!-- Affichage du message -->
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.login-form {
  width: 100%;
  max-width: 40%;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
  max-width: 95.5%;
}

.form-group label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.login-btn:hover {
  background-color: #38a169;
}

.message {
  margin-top: 1.5rem;
  font-size: 1rem;
  color: green;
}
</style>