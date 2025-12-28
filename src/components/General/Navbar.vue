<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <div class="logo-circle">
        <img src="../../assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
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
/* REPLACE YOUR EXISTING NAVBAR <style scoped> SECTION WITH THIS: */

/* Prevent iOS auto-zoom - CRITICAL */
.navbar-item,
.toggle-button,
.mode-icon {
  font-size: 16px !important;
}

.navbar {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--accent-color);
  background-color: var(--color-background);
  color: var(--color-text);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden; /* Prevent horizontal overflow */
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
  font-size: 16px !important;
  white-space: nowrap;
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
  font-size: 16px !important;
  flex-shrink: 0; /* Prevent button from shrinking */
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
  flex-shrink: 0; /* Prevent logo from shrinking */
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
  /*background-color: var(--color-background-soft);*/
}

body.dark-mode .navbar-item,
body.dark-mode .toggle-button {
  color: var(--color-text);
}

body.dark-mode .login-button,
body.dark-mode .register-button {
  color: var(--color-text);
}

/* MOBILE RESPONSIVE STYLES */

/* Tablet and smaller */
@media (max-width: 1024px) {
  .navbar {
    padding: 0.75rem;
  }

  .navbar-menu {
    margin-left: 0.5rem;
  }

  .navbar-start, .navbar-end {
    gap: 0.5rem;
  }

  .navbar-item {
    padding: 0.4rem 0.8rem;
    font-size: 16px !important;
  }

  .toggle-button {
    padding: 0.4rem 0.8rem;
  }
}

/* Mobile landscape and portrait */
@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem;
    flex-wrap: wrap; /* Allow wrapping if needed */
  }

  .navbar-menu {
    margin-left: 0.25rem;
    flex: 1;
    min-width: 0; /* Allow shrinking */
  }

  .navbar-start, .navbar-end {
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .navbar-item {
    padding: 0.3rem 0.6rem;
    font-size: 16px !important;
    border-radius: 6px;
  }

  .toggle-button {
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
  }

  .logo-circle {
    max-width: 60px;
    max-height: 60px;
  }

  .mode-icon {
    font-size: 1.1rem;
  }

  /* Stack navbar items if too cramped */
  .navbar-end {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
}

/* Small mobile phones */
@media (max-width: 480px) {
  .navbar {
    padding: 0.4rem;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .navbar-menu {
    margin-left: 0;
    flex-direction: column;
    gap: 0.5rem;
  }

  .navbar-start, .navbar-end {
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .navbar-item {
    padding: 0.5rem 1rem;
    text-align: center;
    flex: 1;
    min-width: fit-content;
  }

  .toggle-button {
    padding: 0.5rem 1rem;
    align-self: center;
    min-width: fit-content;
  }

  .logo-circle {
    max-width: 50px;
    max-height: 50px;
    align-self: center;
  }

  /* Center the logo */
  .navbar-brand {
    display: flex;
    justify-content: center;
  }
}

/* Very small screens */
@media (max-width: 360px) {
  .navbar {
    padding: 0.3rem;
  }

  .navbar-item {
    padding: 0.4rem 0.6rem;
    font-size: 16px !important;
  }

  .toggle-button {
    padding: 0.4rem 0.6rem;
  }

  .logo-circle {
    max-width: 40px;
    max-height: 40px;
  }

  .mode-icon {
    font-size: 1rem;
  }
}

/* Landscape orientation for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .navbar {
    flex-direction: row;
    padding: 0.4rem;
  }

  .navbar-menu {
    flex-direction: row;
    margin-left: 0.5rem;
  }

  .navbar-start, .navbar-end {
    flex-direction: row;
    gap: 0.3rem;
  }

  .navbar-item {
    padding: 0.25rem 0.5rem;
    font-size: 14px;
  }

  .toggle-button {
    padding: 0.25rem 0.5rem;
  }

  .logo-circle {
    max-width: 55px;
    max-height: 55px;
  }
}
</style>