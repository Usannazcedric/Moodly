<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading">Login</slot>
      </h3>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="Enter your email" />

        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Enter your password" />

        <button class="login-btn">Login</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item {
  margin-top: 2rem;
}



.form-group {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.2rem;
}

.form-group input {
  padding: 0.6rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.login-btn {
  padding: 0.8rem 1.2rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #38a169;
}


</style>
