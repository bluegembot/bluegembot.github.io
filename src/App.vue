<script setup lang="ts">
import { useRoute } from 'vue-router';
import SiteNotificationBanner from './components/General/SiteNotificationBanner.vue';

const route = useRoute();
</script>

<template>
  <SiteNotificationBanner />
  <router-view :key="route.path"></router-view>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>