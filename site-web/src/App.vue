<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Accueil</RouterLink>
      <RouterLink to="/register">Création de compte</RouterLink>
      <RouterLink to="/login">Connexion</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #696969; /* Couleur de fond si nécessaire */
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

nav {
  width: 100%;
  font-size: 16px;
  text-align: center;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  text-decoration: none;
  color: var(--color-text);
}

nav a.router-link-exact-active {
  font-weight: bold;
  color: #42b883; /* Couleur pour le lien actif */
}

nav a:hover {
  color: #38a169; /* Couleur lors du survol */
}

@media (min-width: 1024px) {
  nav {
    font-size: 1rem;
  }
}
</style>
