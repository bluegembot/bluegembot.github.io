<template>
  <div class="plan-checkout">
    <div class="checkout-container">
      <div class="plan-header">
        <h1>Basic Plan</h1>
        <p class="plan-subtitle">Essential features for getting started</p>
      </div>

      <!-- One-time Payment Option -->
      <div class="payment-section">
        <h3 class="section-title">Subscription benefits: </h3>
        <p class="section-description">- Track up to 25 skins</p>
        <p class="section-description">- Track csfloat listings</p>
        <p class="section-description">- Instant access</p>

        <div class="plan-card selected">
          <div class="plan-info">
            <h4>Basic Plan</h4>
            <p class="price">€7.49</p>
            <p class="description">Monthly access with essential features</p>
            <p class="description">Recurring payments. Payment by credit card, recurring payments will extend subscription end date.</p>
            <p class="description">Cancel anytime.</p>
            <div class="payment-methods">
              <span class="payment-badge">Credit Card</span>
            </div>
          </div>
        </div>
      </div>

      <button
          class="checkout-btn"
          :disabled="loading"
          @click="redirectToCheckout"
      >
        <span v-if="loading">Redirecting...</span>
        <span v-else>Pay Now - €7.49</span>
      </button>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { API_URL } from '@/config/environment';
import {csrfFetch} from "@/api/csrf";

// Plan configuration
const planConfig = {
  name: 'Basic Plan',
  price: 7.49,
  currency: 'eur',
  description: '1 month access with essential features',
  type: 'subscription',
  subscriptionType: 'basic'
};

// Reactive data
const loading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const redirectToCheckout = async () => {
  try {
    loading.value = true;
    message.value = '';

    const requestBody = {
      amount: planConfig.price,
      currency: planConfig.currency,
      subscriptionType: planConfig.subscriptionType,
      paymentType: planConfig.type,
      planDetails: {
        name: planConfig.name,
        description: planConfig.description,
        duration: '1 month'
      }
    };

    const response = await csrfFetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

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
.plan-checkout {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
}

.plan-header {
  text-align: center;
  margin-bottom: 40px;
}

.plan-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.plan-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.payment-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.section-description {
  color: #6b7280;
  margin-bottom: 16px;
  font-size: 14px;
}

.plan-card {
  border: 2px solid #4f46e5;
  border-radius: 12px;
  padding: 24px;
  background: #f8faff;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.2);
}

.plan-info {
  text-align: center;
}

.plan-info h4 {
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
