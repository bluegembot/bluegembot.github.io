import {createRouter, createWebHashHistory} from 'vue-router';

import UserDashboard from './pages/userDashboardPage/UserDashboardPage.vue';
import RegisterPage from '@/pages/userRegisterPage/RegisterPage.vue';
import SkinSelector from "@/pages/skinSelectionPage/SkinSelector.vue";
import UserLoginPage from "@/pages/userLoginPage/loginPage.vue";
import AccountPage from "@/pages/AccountPage/AccountPage.vue";
import AutoOpenPage from "@/pages/AutoOpenPage/AutoOpenPage.vue";
import LandingPage from "@/pages/landingPage/LandingPage.vue";
import SubscriptionsPage from "@/pages/Subscriptions/SubscriptionsPage.vue";
import TOS from "@/pages/LegalInfo/TOS.vue"
import privacy from "@/pages/LegalInfo/privacy.vue"
import refunds from "@/pages/LegalInfo/refunds.vue"
import cancellationpolicy from "@/pages/LegalInfo/Cancellation.vue"
import StripeCheckoutBasic from "@/components/Stripe/StripeCheckoutBasic.vue";
import StripeCheckoutGold from "@/components/Stripe/StripeCheckoutGold.vue";

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
  { path: '/TOS', component: TOS, meta: { requiresAuth: false } },
  { path: '/privacy', component: privacy, meta: { requiresAuth: false } },
  { path: '/refunds', component: refunds, meta: { requiresAuth: false } },
  { path: '/cancellation', component: cancellationpolicy, meta:{requiresAuth: false}},
  { path: '/register', component: RegisterPage },
  { path: '/login', component: UserLoginPage },
  { path: '/skinSelector', component: SkinSelector, meta: { requiresAuth: true } },
  { path: '/account', component: AccountPage, meta:{requiresAuth: true}},
  { path: '/autoOpen', component: AutoOpenPage, meta:{requiresAuth: true}},
  { path: '/about', component: LandingPage, meta:{requiresAuth: false}},
  { path: '/subscriptions', component: SubscriptionsPage, meta:{requiresAuth: true}},
  { path: '/checkoutBasic', component: StripeCheckoutBasic, meta:{requiresAuth: true}},
  { path: '/checkoutGold', component: StripeCheckoutGold, meta:{requiresAuth: true}}

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
    localStorage.setItem('subscriptionEndDate', authData.subscriptionEndDate)
    localStorage.setItem('wantedSources', authData.wantedSources)
    if (to.path === '/register' || to.path === '/login' || to.path === '/') {
      return next('/dashboard'); // Redirect if logged in
    }
  } else if (to.meta.requiresAuth) {
    //Remove auth data when authentication is required.
    localStorage.removeItem('username');
    localStorage.removeItem('chatId')
    localStorage.removeItem('subscriptionStatus')
    localStorage.removeItem('subscriptionEndDate')
    localStorage.removeItem('wantedSources')
    return next('/about'); // Redirect to /about if authentication is required
  }

  next(); // Proceed to the requested route
});



export default router;
