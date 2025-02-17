import { createRouter, createWebHashHistory } from 'vue-router';

import UserDashboard from './pages/userDashboardPage/UserDashboardPage.vue';
import RegisterPage from '@/pages/userRegisterPage/RegisterPage.vue';
import SkinSelector from "@/pages/skinSelectionPage/SkinSelector.vue";
import UserLoginPage from "@/pages/userLoginPage/loginPage.vue";
import AccountPage from "@/pages/AccountPage/AccountPage.vue";
import AutoOpenPage from "@/pages/AutoOpenPage/AutoOpenPage.vue";
import LandingPage from "@/pages/landingPage/LandingPage.vue";
import SubscriptionsPage from "@/pages/Subscriptions/SubscriptionsPage.vue";

const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';

export const API_URL = isDevelopment
    ? 'http://localhost:3002'
    : 'https://bluegembot.duckdns.org';

// Your authentication function
async function isAuthenticated() {
  try {
    const response = await fetch(`${API_URL}/authenticateToken`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Define your routes
const routes = [
  { path: '/', component: RegisterPage, pathToRegexpOptions: { strict: true } },
  { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true } },
  { path: '/register', component: RegisterPage },
  { path: '/skinSelector', component: SkinSelector, meta: { requiresAuth: true } },
  { path: '/login', component: UserLoginPage },
  { path: '/account', component: AccountPage, meta:{requiresAuth: true}},
  {path: '/autoOpen', component: AutoOpenPage, meta:{requiresAuth: true}},
  {path: '/about', component: LandingPage, meta:{requiresAuth: false}},
  {path: '/subscriptions', component: SubscriptionsPage, meta:{requiresAuth: true}}
];

// Create the router instance using hash mode
const router = createRouter({
  history: createWebHashHistory('/'), // Switch to hash mode
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Skip authentication check for the about page
  if (to.path === '/about') {
    return next();
  }

  const authData = await isAuthenticated();

  if (authData?.username && authData?.chatId) {
    // Save username only if it exists
    localStorage.setItem('username', authData.username);
    localStorage.setItem('chatId', authData.chatId)
    localStorage.setItem('subscriptionStatus', authData.subscriptionStatus)

    if (to.path === '/register' || to.path === '/login' || to.path === '/') {
      return next('/dashboard'); // Redirect if logged in
    }
  } else if (to.meta.requiresAuth) {
    localStorage.removeItem('username'); // Remove username if not authenticated
    localStorage.removeItem('chatId')// Remove chatId if not authenticated
    localStorage.removeItem('subscriptionStatus')// Remove subscriptionStatus if not authenticated
    return next('/about'); // Redirect to /about if authentication is required
  }

  next(); // Proceed to the requested route
});



export default router;
