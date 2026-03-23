import {createRouter, createWebHistory} from 'vue-router';

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
    : 'https://api.bluegembot.com';

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
  {
    path: '/',
    component: LandingPage,
    pathToRegexpOptions: { strict: true },
    meta: {
      requiresAuth: false,
      title: 'BlueGemBot | CS2 Skinport & CSFloat Listing Tracker',
      description: 'BlueGemBot tracks CS2 skin listings from Skinport and CSFloat with fast alerts, blue gem monitoring, and deal discovery.',
      canonical: 'https://bluegembot.com/'
    }
  },
  { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true, title: 'Dashboard | BlueGemBot', description: 'BlueGemBot user dashboard.' } },
  { path: '/TOS', component: TOS, meta: { requiresAuth: false, title: 'Terms of Service | BlueGemBot', description: 'Terms of Service for BlueGemBot.', canonical: 'https://bluegembot.com/TOS' } },
  { path: '/privacy', component: privacy, meta: { requiresAuth: false, title: 'Privacy Policy | BlueGemBot', description: 'Privacy Policy for BlueGemBot.', canonical: 'https://bluegembot.com/privacy' } },
  { path: '/refunds', component: refunds, meta: { requiresAuth: false, title: 'Refund Policy | BlueGemBot', description: 'Refund Policy for BlueGemBot.', canonical: 'https://bluegembot.com/refunds' } },
  { path: '/cancellation', component: cancellationpolicy, meta:{ requiresAuth: false, title: 'Cancellation Policy | BlueGemBot', description: 'Cancellation Policy for BlueGemBot.', canonical: 'https://bluegembot.com/cancellation' }},
  { path: '/register', component: RegisterPage, meta: { title: 'Register | BlueGemBot', description: 'Create a BlueGemBot account.' } },
  { path: '/login', component: UserLoginPage, meta: { title: 'Login | BlueGemBot', description: 'Log in to BlueGemBot.' } },
  { path: '/skinSelector', component: SkinSelector, meta: { requiresAuth: true, title: 'Skin Selector | BlueGemBot', description: 'Configure tracked skins in BlueGemBot.' } },
  { path: '/account', component: AccountPage, meta:{ requiresAuth: true, title: 'Account | BlueGemBot', description: 'Manage your BlueGemBot account.' }},
  { path: '/autoOpen', component: AutoOpenPage, meta:{ requiresAuth: true, title: 'Auto Open | BlueGemBot', description: 'Configure BlueGemBot auto-open settings.' }},
  {
    path: '/about',
    component: LandingPage,
    meta:{
      requiresAuth: false,
      title: 'About BlueGemBot | CS2 Listing Tracker',
      description: 'Learn how BlueGemBot tracks CS2 listings, discounts, and blue gem opportunities.',
      canonical: 'https://bluegembot.com/about'
    }
  },
  { path: '/subscriptions', component: SubscriptionsPage, meta:{ requiresAuth: true, title: 'Subscriptions | BlueGemBot', description: 'Manage your BlueGemBot subscription.' }},
  { path: '/checkoutBasic', component: StripeCheckoutBasic, meta:{ requiresAuth: true, title: 'Basic Checkout | BlueGemBot', description: 'BlueGemBot basic plan checkout.' }},
  { path: '/checkoutGold', component: StripeCheckoutGold, meta:{ requiresAuth: true, title: 'Gold Checkout | BlueGemBot', description: 'BlueGemBot gold plan checkout.' }}

];

const router = createRouter({
  history: createWebHistory('/'),
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
    if (to.path === '/register' || to.path === '/login') {
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

router.afterEach((to) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_location: window.location.href
    });
  }
});

export default router;
