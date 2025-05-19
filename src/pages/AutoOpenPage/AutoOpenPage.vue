<template>
  <Navbar
      :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
  />
  <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  <div class="auto-opener-page">
    <h1>Auto Opener</h1>
    <label class="switch">
      <input type="checkbox" :checked="isAutoOpenerActive" @change="toggleAutoOpener" />
      <span class="slider"></span>
    </label>
    <p>
      The auto-opener is <strong>{{ isAutoOpenerActive ? "Active" : "Inactive" }}</strong>.
    </p>
  </div>
</template>

<script lang="ts" src="./AutoOpenPage.ts"></script>
<style src="./AutoOpenPage.css"></style>