import { createRouter, createWebHistory } from 'vue-router'

import UserDashboard from './pages/userDashboardPage/UserDashboardPage.vue'
import MedicalProfessionalRegisterPage from '@/pages/userRegisterPage/RegisterPage.vue'
import SkinSelector from "@/pages/skinSelectionPage/SkinSelector.vue"
import UserLoginPage from "@/pages/userLoginPage/loginPage.vue"

// Async function to check if the session token is valid by making an API call
async function isAuthenticated() {
  try {
    const response = await fetch('https://bluegembot.duckdns.org/authenticateToken', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      return true; // Token is valid
    } else {
      return false; // Token is invalid or expired
    }
  } catch (error) {
    return false; // Consider it invalid if there's an error
  }
}

// Define your routes
const routes = [
  { path: '/', component: MedicalProfessionalRegisterPage, pathToRegexpOptions: { strict: true } },
  { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true } },
  { path: '/register', component: MedicalProfessionalRegisterPage },
  { path: '/skinSelector', component: SkinSelector, meta:{requiresAuth: true} },
  { path: '/login', component: UserLoginPage}
]

// Create the router instance
const router = createRouter({
  history: createWebHistory('/'),  // Set base path
  routes
});

router.beforeEach(async (to, from, next) => {
  console.log('Navigating to', to.path);  // This should log on every navigation attempt

  const authenticated = await isAuthenticated();

  if (authenticated && (to.path === '/register' || to.path === '/login' || to.path === '/')) {
    next('/dashboard'); // Redirect if logged in but trying to access /register, /login, or /
  } else if (to.meta.requiresAuth && !authenticated) {
    next('/login'); // Redirect to /login if authentication is required
  } else {
    next(); // Proceed to the requested route
  }
});
export default router
