<template>
  <div>
    <Navbar
        :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
    />
    <main>
      <h1 class="main-title">Account information</h1>
      <p v-if="errorMessage"
         :class="[
           messageType === 'success' ? 'success-message' : 'error-message',
           'fixed-top-message'
         ]">
        {{ errorMessage }}
      </p>

      <!-- Section with Upcoming and Announcements -->
      <div class="upcoming-announcements">
        <div class="upcoming">
          <h2>{{ username }}'s info</h2>
          <ul class="upcoming-list">
            <li>Your BGB username: {{ username }}</li>
            <li>Your discord user ID: {{ chatId }}</li>
            <li>Your current subscription: {{ subscriptionStatus }}</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" src="./AccountPage.ts"></script>
<style src="./AccountPage.css"></style>