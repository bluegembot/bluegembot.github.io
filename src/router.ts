import { createRouter, createWebHashHistory } from 'vue-router';

import UserDashboard from './pages/userDashboardPage/UserDashboardPage.vue';
import RegisterPage from '@/pages/userRegisterPage/RegisterPage.vue';
import SkinSelector from "@/pages/skinSelectionPage/SkinSelector.vue";
import UserLoginPage from "@/pages/userLoginPage/loginPage.vue";
import AccountPage from "@/pages/AccountPage/AccountPage.vue";
import AutoOpenPage from "@/pages/AutoOpenPage/AutoOpenPage.vue";

// Async function to check if the session token is valid by making an API call
async function isAuthenticated() {
  try {
    const response = await fetch('https://bluegembot.duckdns.org/authenticateToken', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.username)
      return data; // Return the full response including "username"
    } else {
      return null;
    }
  } catch (error) {
    return null; // Return null if there's an error
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
  {path: '/autoOpen', component: AutoOpenPage}
];

// Create the router instance using hash mode
const router = createRouter({
  history: createWebHashHistory('/'), // Switch to hash mode
  routes,
});

router.beforeEach(async (to, from, next) => {
  console.log('Navigating to', to.path); // Log on every navigation attempt

  const authData = await isAuthenticated();
  console.log('Auth Data:', authData); // Log the authentication data

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
    return next('/login'); // Redirect to /login if authentication is required
  }

  next(); // Proceed to the requested route
});



export default router;
