<template>
  <div class="home-container">
    <div class="centered">
    <h2>{{ message }}</h2>
</div>
  
    <div v-if="isLoggedIn">
      <div class="mood-chart p-4 bg-white rounded shadow">
        <h2 class="text-xl font-semibold mb-4">Graphique des humeurs</h2>
        <div style="position: relative; width: 100%; height: 400px">
          <canvas id="moodChart"></canvas>
        </div>
        <h2 class="text-xl font-semibold mb-4 mt-8">Nombre d'entrées par jour</h2>
        <div style="position: relative; width: 100%; height: 400px">
          <canvas id="entryChart"></canvas>
        </div>
        <div v-if="loading" class="loading-indicator">Chargement...</div>
        <div v-if="error">{{ error }}</div>
      </div>

      <div class="mood-table p-4 bg-white rounded shadow" v-if="!loadingTable">
        <h2 class="text-xl font-semibold mb-4">Tableau des notes</h2>
        <table class="table-auto w-full">
          <thead>
            <tr>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Description</th>
              <th class="px-4 py-2">Note (1-5)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mood in moodsTable" :key="mood.key">
              <td class="border px-4 py-2">{{ mood.date }}</td>
              <td class="border px-4 py-2">{{ mood.description }}</td>
              <td class="border px-4 py-2">{{ mood.rate }}</td> 
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="loadingTable" class="loading-indicator">Chargement du tableau...</div>
      <div v-if="errorTable">{{ errorTable }}</div>
    </div>

    <button v-if="isLoggedIn" @click="logout" class="logout-btn">Déconnexion</button>
    <button v-else @click="redirectToLogin" class="login-btn">Se connecter</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const router = useRouter();
const message = ref('');
const username = ref('');
const isLoggedIn = ref(false);

const moods = ref([]);
const moodsTable = ref([]);
const loading = ref(true);
const loadingTable = ref(true);
const error = ref(null);
const errorTable = ref(null);

onMounted(() => {
  const token = localStorage.getItem('jwt');
  console.log('Token:', token); 

  if (token) {
    const userId = token.split('_')[1]; 
    console.log('User ID:', userId); 

    fetch(`http://localhost:1337/api/users/me?populate=role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    })
      .then(response => {
        console.log('Response:', response); 
        if (!response.ok) {
          throw new Error('Utilisateur non trouvé');
        }
        return response.json();
      })
      .then(data => {
        if (data.role.name){
          console.log('User Data:', data); 
          username.value = data.username; 
          message.value = `Bienvenue, ${username.value}!`;
          isLoggedIn.value = true; 
          fetchData();
          fetchTableData();
        } else {
          isLoggedIn.value = false;
        }  
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        message.value = 'Utilisateur non trouvé ou vous n\'êtes pas manager';
      });
  } else {
    message.value = 'Vous n\'êtes pas connecté. Veuillez vous connecter.';
  }
});

const fetchData = async () => {
  try {
    const token = localStorage.getItem('jwt');
    const response = await axios.get('http://localhost:1337/api/moods', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const moodData = response.data.data;
    const moodMap = new Map();
    const moodCountMap = new Map();

    moodData.forEach(item => {
      const dateString = item.date || new Date().toISOString().split('T')[0];
      const moodValue = item.Rate;

      if (moodMap.has(dateString)) {
        moodMap.set(dateString, moodMap.get(dateString) + moodValue);
        moodCountMap.set(dateString, moodCountMap.get(dateString) + 1);
      } else {
        moodMap.set(dateString, moodValue);
        moodCountMap.set(dateString, 1);
      }
    });

    const chartData = Array.from(moodMap, ([date, totalMood]) => {
      const count = moodCountMap.get(date);
      return {
        date,
        mood: (totalMood / count).toFixed(2),
        count: count || 0
      };
    });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 4);

    const dateArray = [];
    const moodDataMap = new Map(chartData.map(m => [m.date, m]));

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const moodInfo = moodDataMap.get(dateString) || { mood: 0, count: 0 };
      dateArray.push({
        date: dateString,
        mood: parseFloat(moodInfo.mood),
        count: moodInfo.count
      });
    }

    moods.value = dateArray;
    createMoodChart();
    createEntryChart();
  } catch (err) {
    error.value = "Erreur lors de la récupération des données";
    console.error("Erreur lors de la récupération des données : ", err);
  } finally {
    loading.value = false;
  }
};

const fetchTableData = async () => {
  try {
    const token = localStorage.getItem('jwt');
    const userId = 1; 
    const response = await axios.get(`http://localhost:1337/api/moods?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const moodData = response.data.data;

    const formattedData = moodData.map(item => ({
      key: item.id,
      date: item.date || new Date(item.createdAt).toISOString().split('T')[0],
      description: item.Description || 'Pas de description',
      rate: item.Rate 
    }));

    moodsTable.value = formattedData;
  } catch (err) {
    errorTable.value = "Erreur lors de la récupération du tableau";
    console.error("Erreur lors de la récupération des données du tableau : ", err);
  } finally {
    loadingTable.value = false;
  }
};

const createMoodChart = () => {
  const ctx = document.getElementById('moodChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: moods.value.map(mood => mood.date),
      datasets: [{
        label: 'Moyenne des humeurs',
        data: moods.value.map(mood => mood.mood),
        borderColor: 'blue',
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });
};

const createEntryChart = () => {
  const ctx = document.getElementById('entryChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: moods.value.map(mood => mood.date),
      datasets: [{
        label: 'Nombre d\'entrées',
        data: moods.value.map(mood => mood.count),
        borderColor: 'orange',
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const redirectToLogin = () => {
  router.push('/login'); 
};

const logout = () => {
  localStorage.removeItem('jwt');
  message.value = 'Vous avez été déconnecté.';
  username.value = ''; 
  isLoggedIn.value = false; 
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f5f5f5;
}

h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.centered {
    display: flex;
    justify-content: center; 
    align-items: center;    
    height: 100vh;        
}

h2 {
    margin: 0;            
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

.loading-indicator {
  text-align: center;
  font-size: 18px;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>