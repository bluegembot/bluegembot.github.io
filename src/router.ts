import { createRouter, createWebHistory } from 'vue-router'

// Async function to check if the session token is valid
async function isAuthenticated() {
  try {
    const response = await fetch('https://bluegembot.duckdns.org/authenticateToken', {
      method: 'GET',
      credentials: 'include', // Include cookies for session handling
    });

    return response.ok; // Return true if token is valid, false otherwise
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

// Define routes
const routes = [
  { path: '/', component: () => import('./pages/userRegisterPage/RegisterPage.vue') },
  { path: '/dashboard', component: () => import('./pages/userDashboardPage/UserDashboardPage.vue'), meta: { requiresAuth: true } },
  { path: '/register', component: () => import('./pages/userRegisterPage/RegisterPage.vue') },
  { path: '/skinSelector', component: () => import('./pages/skinSelectionPage/SkinSelector.vue'), meta: { requiresAuth: true } },
  { path: '/login', component: () => import('./pages/userLoginPage/LoginPage.vue') },
  { path: '/:catchAll(.*)', component: () => import('./pages/NotFoundPage.vue') }, // Replace with a proper 404 component
];

// Create the router instance
const router = createRouter({
  history: createWebHistory('/'), // Base path for deployment (adjust if necessary)
  routes,
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Navigating to:', to.path);

  const authenticated = await isAuthenticated();

  if (authenticated && ['/register', '/login', '/'].includes(to.path)) {
    next('/dashboard'); // Redirect logged-in users to the dashboard
  } else if (to.meta.requiresAuth && !authenticated) {
    next('/login'); // Redirect to login if authentication is required
  } else {
    next(); // Proceed to the requested route
  }
});

export default router;
