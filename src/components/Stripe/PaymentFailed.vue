<!-- PaymentFailed.vue -->
<template>
  <PaymentResult type="failed" :show-session-id="isDevelopment" />
</template>

<script setup lang="ts">
import PaymentResult from "@/components/Stripe/PaymentResult.vue";

const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';
</script>