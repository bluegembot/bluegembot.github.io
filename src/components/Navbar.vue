<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <div class="logo-circle">
        <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
      </div>
    </div>

    <div class="navbar-menu">
      <!-- Left side navbar items -->
      <div class="navbar-start">
        <template v-for="item in leftItems" :key="item.name">
          <router-link
              :to="item.path"
              class="navbar-item"
              :class="{ 'is-active': $route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
        </template>
      </div>

      <!-- Right side navbar items -->
      <div class="navbar-end">
        <!-- Regular right side items -->
        <template v-for="(item, index) in rightItems" :key="item.name">
          <router-link
              :to="item.path"
              class="navbar-item"
              :class="{
                'login-button': index === 0,
                'register-button': index === 1,
                'is-active': $route.path === item.path
              }"
          >
            {{ item.name }}
          </router-link>
        </template>
        <button @click="toggleDarkMode" class="navbar-item toggle-button">
          <span v-if="isDarkMode" class="mode-icon">☀️</span>
          <span v-else class="mode-icon">🌙</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    leftItems: {
      type: Array,
      default: () => []
    },
    rightItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isDarkMode: false
    }
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', this.isDarkMode);
    }
  },
  mounted() {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }
}
</script>

<style scoped>
.navbar {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #2ed1e1;
}

.navbar-menu {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-left: 1rem;
}

.navbar-start, .navbar-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-item {
  color: black;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-icon {
  font-size: 1.2rem;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.is-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.logo-circle {
  max-width: 80px;
  max-height: 80px;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Custom styles for login and register buttons */
.login-button {
  border-bottom: 2px solid #4CAF50;
  color: black;
  background-color: transparent;
}

.register-button {
  border-bottom: 2px solid #2ed1e1;
  color: black;
  background-color: transparent;
}

.login-button:hover {
  color: white;
  background-color: #4CAF50;
}

.register-button:hover {
  color: white;
  background-color: #2ed1e1;
}
</style>