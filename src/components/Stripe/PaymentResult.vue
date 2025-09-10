<template>
  <div class="payment-result">
    <div class="result-container">
      <div class="result-icon">{{ icon }}</div>
      <h1 :class="titleClass">{{ title }}</h1>
      <p class="message">{{ message }}</p>

      <!-- Loading state -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing payment...</p>
      </div>

      <!-- Success details -->
      <div v-if="type === 'success' && !loading" class="success-details">
        <div v-if="paymentDetails" class="payment-info">
          <div class="info-row">
            <span class="label">Amount:</span>
            <span class="value">{{ formatAmount(paymentDetails.amount, paymentDetails.currency) }}</span>
          </div>
          <div v-if="paymentDetails.subscriptionType" class="info-row">
            <span class="label">Plan:</span>
            <span class="value">{{ paymentDetails.subscriptionType }}</span>
          </div>
          <div v-if="paymentDetails.nextBillingDate" class="info-row">
            <span class="label">Next billing:</span>
            <span class="value">{{ formatDate(paymentDetails.nextBillingDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Session ID (for debugging) -->
      <div v-if="sessionId && showSessionId" class="session-info">
        <details>
          <summary>Technical Details</summary>
          <p><small>Session ID: {{ sessionId }}</small></p>
          <p v-if="paymentIntentId"><small>Payment ID: {{ paymentIntentId }}</small></p>
        </details>
      </div>

      <!-- Error details -->
      <div v-if="errorMessage" class="error-details">
        <p><strong>Error:</strong> {{ errorMessage }}</p>
        <p v-if="errorCode"><small>Error Code: {{ errorCode }}</small></p>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <button
            v-for="action in actions"
            :key="action.text"
            @click="action.handler"
            :class="['action-btn', action.class]"
            :disabled="loading"
        >
          <span v-if="action.loading" class="btn-spinner"></span>
          {{ action.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';

interface PaymentDetails {
  amount: number;
  currency: string;
  subscriptionType?: string;
  nextBillingDate?: string;
}

interface Action {
  text: string;
  handler: () => void;
  class: string;
  loading?: boolean;
}

interface Props {
  type: 'success' | 'failed';
  showSessionId?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSessionId: false
});

const router = useRouter();
const loading = ref(true);
const sessionId = ref('');
const paymentIntentId = ref('');
const errorMessage = ref('');
const errorCode = ref('');
const paymentDetails = ref<PaymentDetails | null>(null);
const retryLoading = ref(false);

// Computed properties
const icon = computed(() => {
  if (loading.value) return '⏳';
  return props.type === 'success' ? '✅' : '❌';
});

const titleClass = computed(() => ({
  'success-title': props.type === 'success',
  'error-title': props.type === 'failed'
}));

const title = computed(() => {
  if (loading.value) return 'Processing Payment...';
  return props.type === 'success' ? 'Payment Successful!' : 'Payment Failed';
});

const message = computed(() => {
  if (loading.value) return 'Please wait while we confirm your payment...';

  return props.type === 'success'
      ? 'Thank you for your subscription. Your account has been activated and you can start using premium features immediately.'
      : 'We encountered an issue processing your payment. Don\'t worry, you haven\'t been charged.';
});

const actions = computed<Action[]>(() => {
  const commonActions = [
    {
      text: 'Back to Home',
      handler: goHome,
      class: 'secondary'
    }
  ];

  if (props.type === 'success') {
    return [
      {
        text: 'Go to Dashboard',
        handler: goToDashboard,
        class: 'primary'
      },
      {
        text: 'View Account',
        handler: goToAccount,
        class: 'secondary'
      },
      ...commonActions
    ];
  } else {
    return [
      {
        text: 'Try Again',
        handler: retryPayment,
        class: 'primary',
        loading: retryLoading.value
      },
      {
        text: 'Choose Different Plan',
        handler: goToSubscriptions,
        class: 'secondary'
      },
      {
        text: 'Contact Support',
        handler: contactSupport,
        class: 'support'
      },
      ...commonActions
    ];
  }
});

// API URL from your router config
const API_URL = import.meta.env.VITE_ENVIRONMENT === 'development'
    ? 'http://localhost:3002'
    : 'https://bluegembot.duckdns.org';

onMounted(async () => {
  // Get parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  sessionId.value = urlParams.get('session_id') || '';
  const errorParam = urlParams.get('error');
  const errorCodeParam = urlParams.get('error_code');

  if (errorParam) {
    errorMessage.value = decodeURIComponent(errorParam);
  }

  if (errorCodeParam) {
    errorCode.value = decodeURIComponent(errorCodeParam);
  }

  // If we have a session ID, verify the payment status with your backend
  if (sessionId.value) {
    await verifyPaymentStatus();
  } else {
    // No session ID, just show the result based on type
    loading.value = false;
  }

  // Update user's subscription status in localStorage if success
  if (props.type === 'success' && !loading.value) {
    await updateUserSubscriptionStatus();
  }
});

const verifyPaymentStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/verify-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sessionId: sessionId.value
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Success case
      paymentDetails.value = {
        amount: data.amount,
        currency: data.currency,
        subscriptionType: data.subscriptionType,
        nextBillingDate: data.nextBillingDate
      };
      paymentIntentId.value = data.paymentIntentId;
    } else {
      // Failed case or error
      errorMessage.value = data.error || 'Payment verification failed';
      if (data.errorCode) {
        errorCode.value = data.errorCode;
      }
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    // Don't overwrite existing error message if we already have one
    if (!errorMessage.value) {
      errorMessage.value = 'Unable to verify payment status';
    }
  } finally {
    loading.value = false;
  }
};

const updateUserSubscriptionStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/authenticateToken`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.subscriptionStatus) {
        localStorage.setItem('subscriptionStatus', data.subscriptionStatus);
        localStorage.setItem('subscriptionEndDate', data.subscriptionEndDate);
      }
    }
  } catch (error) {
    console.error('Error updating subscription status:', error);
  }
};

// Action handlers
const goToDashboard = () => {
  router.push('/dashboard');
};

const goHome = () => {
  router.push('/about');
};

const goToAccount = () => {
  router.push('/account');
};

const goToSubscriptions = () => {
  router.push('/subscriptions');
};

const retryPayment = async () => {
  retryLoading.value = true;

  // Small delay for UX
  await new Promise(resolve => setTimeout(resolve, 500));

  retryLoading.value = false;
  router.push('/subscriptions');
};

const contactSupport = () => {
  // Open email client or support page
  window.open('mailto:support@yourcompany.com?subject=Payment Issue&body=Session ID: ' + sessionId.value, '_blank');
};

// Utility functions
const formatAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100); // Assuming amount is in cents
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.payment-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.result-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
  padding: 48px 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-icon {
  font-size: 72px;
  margin-bottom: 24px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -15px, 0);
  }
  70% {
    transform: translate3d(0, -7px, 0);
  }
  90% {
    transform: translate3d(0, -3px, 0);
  }
}

h1 {
  margin-bottom: 16px;
  font-size: 28px;
  font-weight: 700;
}

.success-title {
  color: #059669;
}

.error-title {
  color: #dc2626;
}

.message {
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.6;
}

.loading-spinner {
  margin: 32px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-details {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.payment-info {
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #374151;
}

.value {
  font-weight: 600;
  color: #059669;
}

.session-info {
  background-color: #f8fafc;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
}

.session-info details {
  cursor: pointer;
}

.session-info summary {
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.error-details {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.error-details p {
  color: #991b1b;
  margin-bottom: 8px;
}

.error-details p:last-child {
  margin-bottom: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.primary {
  background-color: #4f46e5;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.action-btn.support {
  background-color: #f59e0b;
  color: white;
}

.action-btn.support:hover:not(:disabled) {
  background-color: #d97706;
  transform: translateY(-1px);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (min-width: 640px) {
  .actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-btn {
    flex: 0 0 auto;
    min-width: 140px;
  }
}
</style>