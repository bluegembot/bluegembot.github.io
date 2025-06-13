<template>
  <div class="payment-success">
    <div class="success-container">
      <div class="success-icon">✅</div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your subscription. Your account has been activated.</p>
      <div v-if="sessionId" class="session-info">
        <p><small>Session ID: {{ sessionId }}</small></p>
      </div>
      <div class="actions">
        <button @click="goToDashboard" class="dashboard-btn">
          Go to Dashboard
        </button>
        <button @click="goHome" class="home-btn">
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sessionId = ref('');

onMounted(() => {
  // Get session ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdParam = urlParams.get('session_id');

  if (sessionIdParam) {
    sessionId.value = sessionIdParam;
    console.log('Payment completed with session:', sessionIdParam);
  }
});

const goToDashboard = () => {
  router.push('/dashboard');
};

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* Same styles as before */
.payment-success {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.success-container {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

h1 {
  color: #059669;
  margin-bottom: 10px;
}

p {
  color: #6b7280;
  margin-bottom: 30px;
}

.session-info {
  background-color: #f8fafc;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dashboard-btn, .home-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.dashboard-btn {
  background-color: #4f46e5;
  color: white;
}

.dashboard-btn:hover {
  background-color: #4338ca;
}

.home-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.home-btn:hover {
  background-color: #e5e7eb;
}
</style>