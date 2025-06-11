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
        <!-- Dark mode toggle as first item -->
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
      isDarkMode: true // Default to dark mode
    }
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      document.body.classList.toggle('light-mode', !this.isDarkMode);
      localStorage.setItem('darkMode', this.isDarkMode);
    }
  },
  mounted() {
    // Check for saved dark mode preference, default to true if not set
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode === null ? true : savedDarkMode === 'true';

    // Apply appropriate mode classes
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }
}
</script>

<style scoped>
/* Add these styles to your Navbar component's <style> section */

.navbar {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--accent-color);
  background-color: var(--color-background);
  color: var(--color-text);
  transition: all 0.3s ease;
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
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: var(--color-text);
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  transition: all 0.3s ease;
}

.mode-icon {
  font-size: 1.2rem;
}

.navbar-item:hover {
  background-color: rgba(46, 209, 225, 0.1);
}

.toggle-button:hover {
  background-color: rgba(46, 209, 225, 0.1);
  border-radius: 4px;
}

.is-active {
  background-color: rgba(46, 209, 225, 0.2);
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
  background-color: transparent;
  color: var(--color-text);
}

.register-button {
  border-bottom: 2px solid var(--accent-color);
  background-color: transparent;
  color: var(--color-text);
}

.login-button:hover {
  background-color: #4CAF50;
  color: white;
}

.register-button:hover {
  background-color: var(--accent-color);
  color: white;
}

/* Dark mode specific navbar adjustments */
body.dark-mode .navbar {
  background-color: var(--color-background-soft);
}

body.dark-mode .navbar-item,
body.dark-mode .toggle-button {
  color: var(--color-text);
}

body.dark-mode .login-button,
body.dark-mode .register-button {
  color: var(--color-text);
}
</style>