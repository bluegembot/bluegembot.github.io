<template>
  <nav class="navbar">
    <div class="navbar-inner">
    <router-link to="/" class="navbar-brand" aria-label="BlueGemBot home">
      <img src="../../assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
      <span class="brand-name">Blue<span class="brand-accent">Gem</span>Bot</span>
    </router-link>

    <div class="navbar-menu">
      <!-- Section links (only rendered when present) -->
      <div v-if="leftItems.length" class="navbar-start">
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

      <!-- Actions: CTA + theme toggle (always visible, even on mobile) -->
      <div class="navbar-end">
        <template v-for="item in rightItems" :key="item.name">
          <router-link
              :to="item.path"
              class="navbar-item"
              :class="{
                'ghost-button': item.path === '/login',
                'cta-button': item.path !== '/login',
                'is-active': $route.path === item.path
              }"
          >
            {{ item.name }}
          </router-link>
        </template>
        <button
            @click="toggleDarkMode"
            class="toggle-button"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span v-if="isDarkMode" class="mode-icon">☀️</span>
          <span v-else class="mode-icon">🌙</span>
        </button>
        <button
            v-if="leftItems.length"
            @click="toggleMenu"
            class="hamburger-button"
            :class="{ 'is-open': isMenuOpen }"
            :aria-expanded="isMenuOpen"
            aria-controls="navbar-mobile-menu"
            :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
    </div>

    <!-- Section links as a dropdown panel on mobile -->
    <transition name="mobile-menu">
      <div v-if="leftItems.length && isMenuOpen" id="navbar-mobile-menu" class="mobile-menu">
        <router-link
            v-for="item in leftItems"
            :key="item.name"
            :to="item.path"
            class="mobile-menu-item"
            :class="{ 'is-active': $route.path === item.path }"
            @click="closeMenu"
        >
          {{ item.name }}
        </router-link>
      </div>
    </transition>
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
      isDarkMode: true, // Default to dark mode
      isMenuOpen: false
    }
  },
  watch: {
    $route() {
      this.closeMenu();
    }
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      document.body.classList.toggle('light-mode', !this.isDarkMode);
      localStorage.setItem('darkMode', this.isDarkMode);
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    handleEscape(event) {
      if (event.key === 'Escape') {
        this.closeMenu();
      }
    }
  },
  mounted() {
    // index.html applies the class before first paint; here we only sync local state
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode === null ? true : savedDarkMode === 'true';

    document.body.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('light-mode', !this.isDarkMode);

    window.addEventListener('keydown', this.handleEscape);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEscape);
  }
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.65rem clamp(1.25rem, 4vw, 3rem);
  border-bottom: 1px solid var(--color-border);
  background-color: color-mix(in srgb, var(--color-background-soft) 82%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--color-text);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

@supports not (background-color: color-mix(in srgb, red 50%, transparent)) {
  .navbar {
    background-color: var(--color-background-soft);
  }
}

/* Constrain the nav content so it lines up with page content on wide screens */
.navbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
}

.logo-img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--accent-soft);
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-heading);
  white-space: nowrap;
}

.brand-accent {
  color: var(--accent-color);
}

/* Brand sits alone on the left; links, CTA, and toggle form one cluster on the right */
.navbar-menu {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

.navbar-start,
.navbar-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Divider between the section links and the action area */
.navbar-start + .navbar-end {
  padding-left: 1rem;
  border-left: 1px solid var(--color-border);
}

.navbar-item {
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
}

.navbar-item:hover {
  background-color: var(--accent-soft);
  color: var(--color-heading);
}

.is-active {
  background-color: var(--accent-soft);
  color: var(--accent-color);
}

/* Primary action (Register / Upgrade / Dashboard) — most prominent element in the bar */
.cta-button {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-strong));
  color: #06222a;
  border: 1px solid transparent;
  font-weight: 700;
  box-shadow: 0 4px 14px var(--accent-glow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta-button:hover {
  color: #06222a;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

/* Secondary action (Login) */
.ghost-button {
  border: 1px solid var(--color-border-hover);
  color: var(--color-heading);
}

.ghost-button:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background-color: transparent;
}

.toggle-button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  cursor: pointer;
  padding: 0.4rem 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  transition: border-color 0.2s ease, background-color 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}

.toggle-button:hover {
  border-color: var(--accent-color);
  background-color: var(--accent-soft);
}

.mode-icon {
  font-size: 1.05rem;
}

/* Hamburger: hidden on desktop, replaces the section links on mobile */
.hamburger-button {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  padding: 0;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  align-items: center;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.hamburger-button:hover {
  border-color: var(--accent-color);
  background-color: var(--accent-soft);
}

.hamburger-line {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background-color: var(--color-heading);
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.hamburger-button.is-open .hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-button.is-open .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-button.is-open .hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Dropdown panel with the section links (mobile only) */
.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 0 0.35rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.6rem;
}

.mobile-menu-item {
  display: block;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text);
  font-size: 16px; /* prevents iOS auto-zoom */
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.mobile-menu-item:hover {
  background-color: var(--accent-soft);
  color: var(--color-heading);
}

.mobile-menu-item.is-active {
  background-color: var(--accent-soft);
  color: var(--accent-color);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* MOBILE RESPONSIVE STYLES */
@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 0.75rem;
  }

  .navbar-inner {
    gap: 0.5rem;
  }

  /* Section links collapse into the hamburger menu */
  .navbar-start {
    display: none;
  }

  .navbar-start + .navbar-end {
    padding-left: 0;
    border-left: none;
  }

  .hamburger-button {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }

  .navbar-menu {
    gap: 0.5rem;
  }

  .navbar-end {
    gap: 0.4rem;
  }

  .logo-img {
    width: 38px;
    height: 38px;
  }

  .navbar-item {
    padding: 0.45rem 0.8rem;
    font-size: 16px; /* prevents iOS auto-zoom */
  }
}

/* Only drop the brand name when it genuinely no longer fits */
@media (max-width: 520px) {
  .brand-name {
    display: none;
  }
}

@media (max-width: 360px) {
  .navbar-item {
    padding: 0.4rem 0.6rem;
  }

  .logo-img {
    width: 32px;
    height: 32px;
  }
}
</style>
