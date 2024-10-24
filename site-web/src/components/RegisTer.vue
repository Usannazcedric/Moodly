<template>
    <div class="register-container">
      <h2>Créer un compte employé</h2>
  
      <form class="register-form" @submit.prevent="register">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="Entrez un nom d'utilisateur" 
            required 
          />
        </div>
  
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Entrez un email" 
            required 
          />
        </div>
  
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Entrez un mot de passe" 
            required 
          />
        </div>
  
        <div class="form-group">
          <label for="team">Sélectionnez une équipe</label>
          <select v-model="selectedTeam">
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.Name }} <!-- Correction ici -->
            </option>
          </select>
        </div>
  
        <button type="submit" class="register-btn">Créer le compte</button>
        <p class="message">{{ message }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const username = ref('');
  const password = ref('');
  const selectedTeam = ref(null);
  const message = ref('');
  const teams = ref([]);
  const router = useRouter();
  
  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/teams');
      teams.value = response.data.data; // Récupération correcte des équipes depuis l'API
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error);
    }
  };
  
  const register = async () => {
  try {
    const jwt = localStorage.getItem('jwt');

    if (!jwt) {
      message.value = 'Vous devez être connecté en tant que Manager pour créer un compte.';
      return;
    }

    const response = await axios.post('http://localhost:1337/api/auth/local/register', {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    if (response.data.jwt) {
      const userId = response.data.user.id;

      const managerResponse = await axios.get('http://localhost:1337/api/users/me?populate=role', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (managerResponse.data.role.name === 'Manager') {
        await axios.put(`http://localhost:1337/api/users/${userId}`, {
          role: 2, // Assigne le rôle 'Public'
          team: selectedTeam.value ? selectedTeam.value : null, // Assigne l'équipe sélectionnée à l'utilisateur
        }, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        console.log('Assignation de l\'équipe:', selectedTeam.value);

        message.value = 'Compte employé créé avec succès avec le rôle Public et l’équipe sélectionnée !';

      } else {
        message.value = "Vous n'avez pas les droits nécessaires pour créer un compte.";
      }
    }
  } catch (error) {
    console.error(error);
    message.value = "Erreur lors de la création du compte. Veuillez vérifier les informations.";
  }
};
  
  onMounted(fetchTeams);
  </script>
  
  <style scoped>
  .register-container {
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
  
  .register-form {
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
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .register-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .register-btn:hover {
    background-color: #38a169;
  }
  
  .message {
    margin-top: 1.5rem;
    font-size: 1rem;
    color: green;
  }
  </style>
  