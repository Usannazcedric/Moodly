<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const message = ref('');
const username = ref('');
const isLoggedIn = ref(false); 

onMounted(() => {
  const token = localStorage.getItem('token');
  console.log('Token:', token); 

  if (token) {
    const userId = token.split('_')[1]; 
    console.log('User ID:', userId); 

    fetch(`http://localhost:1337/api/managers/${userId}`)
      .then(response => {
        console.log('Response:', response); 
        if (!response.ok) {
          throw new Error('Utilisateur non trouvé');
        }
        return response.json();
      })
      .then(data => {
        console.log('User Data:', data); 
        username.value = data.data.Username; 
        message.value = `Bienvenue, ${username.value}!`;
        isLoggedIn.value = true; 
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        message.value = 'Utilisateur non trouvé. Vous pouvez vous connecter.';
      });
  } else {
    message.value = 'Vous n\'êtes pas connecté. Veuillez vous connecter.';
  }
});

const redirectToLogin = () => {
  router.push('/login'); 
};

const logout = () => {
  localStorage.removeItem('token');
  message.value = 'Vous avez été déconnecté.';
  username.value = ''; 
  isLoggedIn.value = false; 
};
</script>

<template>
  <div class="home-container">
    <h2>{{ message }}</h2>
    
    <button v-if="isLoggedIn" @click="logout" class="logout-btn">Déconnexion</button>

    <button v-else @click="redirectToLogin" class="login-btn">Se connecter</button>
  </div>
</template>

<style scoped>
.home-container {
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

.logout-btn, .login-btn {
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.logout-btn:hover, .login-btn:hover {
  background-color: #38a169;
}
</style>
