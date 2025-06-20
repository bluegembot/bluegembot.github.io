<template>
  <div class="plan-checkout">
    <div class="checkout-container">
      <div class="plan-header">
        <h1>Gold Plan</h1>
        <p class="plan-subtitle">All premium features for power users</p>
        <div class="premium-badge">
          <span>⭐ Most Popular</span>
        </div>
      </div>

      <!-- One-time Payment Option -->
      <div class="payment-section">
        <h3 class="section-title">One-Time Payment</h3>
        <p class="section-description">Pay once, access for 1 month. Supports credit card, iDEAL, and other payment methods, recurring payments will extend subscription end date.</p>

        <div class="plan-card selected">
          <div class="plan-info">
            <h4>Gold Plan - 1 Month</h4>
            <p class="price">€12.49</p>
            <p class="description">1 month access with all premium features</p>
            <div class="payment-methods">
              <span class="payment-badge">Credit Card</span>
              <span class="payment-badge">iDEAL</span>
              <span class="payment-badge">+More</span>
            </div>
          </div>
        </div>
      </div>

      <button
          class="checkout-btn gold"
          :disabled="loading"
          @click="redirectToCheckout"
      >
        <span v-if="loading">Redirecting...</span>
        <span v-else>Pay Now - €12.49</span>
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

// Plan configuration
const planConfig = {
  name: 'Gold Plan',
  price: 12.49,
  currency: 'eur',
  description: '1 month access with all premium features',
  type: 'onetime',
  subscriptionType: 'gold_onetime'
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

    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
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
  border: 2px solid #fbbf24;
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
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.plan-subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 16px 0;
}

.premium-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
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
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.2);
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.25);
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
  color: #f59e0b;
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
  color: white;
  border: none;
  padding: 18px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: all 0.3s ease;
  font-weight: 600;
}

.checkout-btn.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.checkout-btn.gold:hover {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
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