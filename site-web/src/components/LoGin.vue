<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import axios from 'axios';

const email = ref('');
const password = ref('');
const message = ref('');
const router = useRouter(); 

const login = async () => {
  try {
    const response = await axios.get('http://localhost:1337/api/managers');
    const managers = response.data.data;

    const manager = managers.find(
      (m) => m.mail === email.value && m.Confirmed
    );

    if (manager) {
      const token = 'token_' + manager.id;
      localStorage.setItem('token', token);
      message.value = `Connexion réussie ! Bienvenue, ${manager.Username}.`;
    } else {
      message.value = 'Identifiants incorrects ou compte non confirmé.';
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    message.value = 'Erreur lors de la connexion. Veuillez réessayer.';
  }
};

const logout = () => {
  // Suppression du token du local storage
  localStorage.removeItem('token');
  message.value = 'Déconnexion réussie.';
};

const goToHome = () => {
  // Redirection vers la page d'accueil
  router.push('/'); // Assurez-vous que cela correspond à votre route d'accueil
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
      <p class="message">{{ message }}</p>
    </form>

    <button @click="logout" class="logout-btn">Déconnexion</button>
    <button @click="goToHome" class="home-btn">Retour à l'accueil</button>
  </div>
</template>



<style scoped>
.logout-btn, .home-btn {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.logout-btn:hover, .home-btn:hover {
  background-color: #38a169;
}
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