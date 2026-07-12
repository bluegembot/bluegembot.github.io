<script setup lang="ts">
import { useRoute } from 'vue-router';
import SiteNotificationBanner from './components/General/SiteNotificationBanner.vue';

const route = useRoute();
</script>

<template>
  <SiteNotificationBanner />
  <router-view :key="route.path"></router-view>
</template>

