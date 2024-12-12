<template>
  <div>
    <main>
      <h1 class="main-title">Account information</h1>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img"/>
        </div>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <!-- Section with Upcoming and Announcements -->
      <div class="upcoming-announcements">
        <!-- Upcoming list -->
        <div class="upcoming">
          <h2>{{username}}'s info</h2>
          <ul class="upcoming-list">
            <li>Your BGB username: {{username}}</li>
            <li>Your discord chat ID: {{chatId}}</li>
            <li>Your current subscription: {{subscriptionStatus}}</li>
          </ul>
        </div>

      </div>

      <!-- Grid section -->
      <div class="grid-container">

        <router-link to="/skinSelector" class="grid-item">Track new skin</router-link>
        <!--        <router-link to="/settings" class="grid-item">account</router-link>-->
        <router-link to="/dashboard"><div class="grid-item">Dashboard</div></router-link>
      </div>
    </main>
  </div>
</template>

<style src="./AccountPage.css"></style>

<script>
import {onMounted, ref} from "vue";

export default {
  setup() {
    const username = ref("")
    const chatId = ref("")
    const subscriptionStatus = ref("")
    onMounted(() => {
      username.value = localStorage.getItem('username'); // Get the stored username
      chatId.value = localStorage.getItem('chatId'); // Get the stored chatId
      subscriptionStatus.value = localStorage.getItem('subscriptionStatus'); // Get the stored subscriptionStatus
    });

    return {
      username,
      chatId,
      subscriptionStatus
    };
  },
};
</script>

<style>
.error-message {
  display: flex;
  color: red;
  font-weight: bold;
  margin: 10px 0;
}
</style>


<style src="./AccountPage.css"></style>