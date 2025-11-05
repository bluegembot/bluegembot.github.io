<template>
  <section>
    <!-- Main content with registration form -->
    <main>
      <h2 class="main-title">Register yourself</h2>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
        </div>
      </div>

      <form class="registration-form" @submit.prevent="handleSubmit">
        <fieldset>
          <div class="form-group">
            <label for="userName">Username</label>
            <input
                type="text"
                id="userName"
                maxlength="25"
                v-model="form.userName"
                required
                placeholder="Enter username"
            />
          </div>

          <div class="form-group">
            <label for="OTP">Your OTP</label>
            <input
                type="text"
                id="OTP"
                v-model="form.OTP"
                required
                placeholder="Enter OTP"
                pattern="\d{6}"
                minlength="6"
                maxlength="6"
            />
          </div>

          <button type="submit" class="register-button">Register</button>
          <p>/register to <a href="https://discord.gg/kWGfK6St4m">my discord bot</a> for your one time password.</p>
          <p>Already have an account? <router-link to="/login">Login</router-link></p>

          <!-- Alert message for password mismatch -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </fieldset>
      </form>
    </main>
  </section>
</template>

<script setup lang="ts">
import { useRegistrationForm } from './RegisterPage'
const { form, errorMessage, handleSubmit } = useRegistrationForm()
</script>

<style src="./RegisterPage.css"></style>
