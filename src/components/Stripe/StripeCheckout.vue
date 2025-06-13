<template>
  <div class="simple-checkout">
    <div class="subscription-plans">
      <h2>Choose Your Plan</h2>

      <!-- One-time Payments Section -->
      <div class="payment-section">
        <h3 class="section-title">One-Time Payments</h3>
        <p class="section-description">Pay once, access for 1 month. Supports credit card, iDEAL, and other payment methods.</p>
        <div class="plans-container">
          <div
              v-for="(plan, key) in oneTimePlans"
              :key="key"
              class="plan-card"
              :class="{ selected: selectedPlan === key }"
              @click="selectPlan(key)"
          >
            <h4>{{ plan.name }}</h4>
            <p class="price">€{{ plan.price }}</p>
            <p class="description">{{ plan.description }}</p>
            <div class="payment-methods">
              <span class="payment-badge">Credit Card</span>
              <span class="payment-badge">iDEAL</span>
              <span class="payment-badge">+More</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Section -->
      <div class="payment-section">
        <h3 class="section-title">Subscriptions</h3>
        <p class="section-description">Recurring payments for 6 months. Credit card only.</p>
        <div class="plans-container">
          <div
              v-for="(plan, key) in subscriptionPlans"
              :key="key"
              class="plan-card"
              :class="{ selected: selectedPlan === key }"
              @click="selectPlan(key)"
          >
            <h4>{{ plan.name }}</h4>
            <p class="price">€{{ plan.price }}</p>
            <p class="description">{{ plan.description }}</p>
            <div class="payment-methods">
              <span class="payment-badge">Credit Card</span>
            </div>
          </div>
        </div>
      </div>

      <button
          class="checkout-btn"
          :disabled="!selectedPlan || loading"
          @click="redirectToCheckout"
      >
        <span v-if="loading">Redirecting...</span>
        <span v-else>
          {{ getSelectedPlanType() === 'onetime' ? 'Pay Now' : 'Start Subscription' }}
        </span>
      </button>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Simple configuration
const API_BASE_URL = 'http://localhost:3002'; // Adjust to your backend port

// One-time payment plans (1 month)
const oneTimePlans = ref({
  basic_onetime: {
    name: 'Basic Plan',
    price: 12.99,
    currency: 'eur',
    description: '1 month access with essential features',
    type: 'onetime'
  },
  gold_onetime: {
    name: 'Gold Plan',
    price: 17.99,
    currency: 'eur',
    description: '1 month access with all premium features',
    type: 'onetime'
  }
});

// Subscription plans (6 months)
const subscriptionPlans = ref({
  basic: {
    name: 'Basic Plan',
    price: 9.99,
    currency: 'eur',
    description: '6 months recurring with essential features',
    type: 'subscription'
  },
  gold: {
    name: 'Gold Plan',
    price: 14.99,
    currency: 'eur',
    description: '6 months recurring with all premium features',
    type: 'subscription'
  }
});

// Reactive data
const loading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const selectedPlan = ref('');

const selectPlan = (planKey: string) => {
  selectedPlan.value = planKey;
};

const getSelectedPlanType = () => {
  if (!selectedPlan.value) return null;

  if (oneTimePlans.value[selectedPlan.value]) {
    return 'onetime';
  } else if (subscriptionPlans.value[selectedPlan.value]) {
    return 'subscription';
  }
  return null;
};

const getSelectedPlan = () => {
  if (!selectedPlan.value) return null;

  return oneTimePlans.value[selectedPlan.value] || subscriptionPlans.value[selectedPlan.value];
};

const redirectToCheckout = async () => {
  if (!selectedPlan.value) return;

  try {
    loading.value = true;
    message.value = '';

    const plan = getSelectedPlan();
    const planType = getSelectedPlanType();

    if (!plan || !planType) {
      throw new Error('Invalid plan selection');
    }

    // Create checkout session with payment type information
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Use cookies for authentication
      body: JSON.stringify({
        amount: plan.price,
        currency: plan.currency,
        subscriptionType: selectedPlan.value,
        paymentType: planType, // 'onetime' or 'subscription'
        planDetails: {
          name: plan.name,
          description: plan.description,
          duration: planType === 'onetime' ? '1 month' : '6 months'
        }
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    // Redirect to Stripe's hosted checkout page
    window.location.href = data.url;

  } catch (error) {
    console.error('Error creating checkout session:', error);
    message.value = error instanceof Error ? error.message : 'An error occurred';
    messageType.value = 'error';
    loading.value = false;
  }
};
</script>

<style scoped>
.simple-checkout {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.subscription-plans h2 {
  text-align: center;
  margin-bottom: 40px;
  color: #1f2937;
}

.payment-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.section-description {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 14px;
}

.plans-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.plan-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: white;
}

.plan-card:hover {
  border-color: #4f46e5;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.plan-card.selected {
  border-color: #4f46e5;
  background-color: #f8faff;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
}

.plan-card h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #4f46e5;
  margin: 12px 0;
}

.description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.payment-methods {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.payment-badge {
  background-color: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.checkout-btn {
  background: linear-gradient(135deg, #635bff 0%, #5a52e8 100%);
  color: white;
  border: none;
  padding: 18px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3);
}

.checkout-btn:hover {
  background: linear-gradient(135deg, #5a52e8 0%, #4c46d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 91, 255, 0.4);
}

.checkout-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
</style>