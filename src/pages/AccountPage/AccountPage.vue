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
          <div class="account-header">
            <h2>{{ username }}'s info</h2>
            <div class="button-group">
              <button
                  @click="openImportModal"
                  class="import-btn"
                  title="Import Items"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Import Items
              </button>
            </div>
          </div>
          <ul class="upcoming-list">
            <li>Your BGB username: {{ username }}</li>
            <li>Your discord user ID: {{ chatId }}</li>
            <li>Your current subscription: {{ subscriptionStatus }}</li>
            <li v-if="formattedEndDate !== 'Invalid Date'">Current billing period until: {{formattedEndDate}}</li>
            <li v-else>Current billing period until: Trial, no billing period.</li>
          </ul>
        </div>
      </div>

      <!-- Import Items Modal -->
      <ImportSkinsModal
          :visible="importModalVisible"
          title="Import Items"
          description="Enter your skin items data as a JSON array with item details:"
          :placeholder="importPlaceholder"
          v-model:importData="importData"
          :errorMessage="importError"
          :isLoading="importLoading"
          @close="closeImportModal"
          @import="importSkins"
      />
    </main>
  </div>
</template>
<script lang="ts" src="./AccountPage.ts"></script>

<style src="./AccountPage.css"></style>