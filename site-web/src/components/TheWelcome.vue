<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Variables réactives
const email = ref('');
const password = ref('');
const message = ref('');
const token = ref(localStorage.getItem('token') || '');
const username = ref('');

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
      token.value = 'faketoken_' + manager.documentId;
      localStorage.setItem('token', token.value); // Stocker le token dans le local storage
      username.value = manager.mail.split('@')[0]; // Récupérer le nom d'utilisateur à partir de l'email
      message.value = 'Connexion réussie';
    } else {
      message.value = 'Email ou mot de passe incorrect';
    }
  } catch (error) {
    console.error(error);
    message.value = 'Une erreur s\'est produite lors de la connexion';
  }
};

// Vérification au montage du composant si un token est déjà présent
onMounted(async () => {
  if (token.value) {
    try {
      const response = await axios.get('http://localhost:1337/api/managers');
      const manager = response.data.data.find(
        (manager) => 'faketoken_' + manager.documentId === token.value
      );
      if (manager) {
        username.value = manager.mail.split('@')[0]; // Nom d'utilisateur
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token', error);
    }
  }
});

// Fonction de déconnexion
const logout = () => {
  localStorage.removeItem('token');
  token.value = '';
  email.value = '';
  password.value = '';
};
</script>

<template>
  <div class="login-container">
    <!-- Si l'utilisateur est connecté, afficher le message de bienvenue -->
    <div v-if="token">
      <h2>Bonjour {{ username }}</h2>
      <button @click="logout" class="logout-btn">Se déconnecter</button>
    </div>

    <!-- Sinon afficher le formulaire de connexion -->
    <div v-else>
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

      <!-- Affichage du message d'erreur ou de succès -->
      <p v-if="message" class="message">{{ message }}</p>
    </div>
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
  max-width: 400px; /* Largeur maximale fixe */
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
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

.logout-btn {
  padding: 0.75rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-btn:hover {
  background-color: #c53030;
}

.message {
  margin-top: 1.5rem;
  font-size: 1rem;
  color: green;
}
</style>
