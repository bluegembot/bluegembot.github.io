<template>
  <section class="auth-page">
    <Navbar
        :rightItems="[
        { name: 'Register', path: '/register' }
      ]"
    />
    <main>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
        </div>
      </div>
      <h2 class="main-title">Login to BlueGemBot</h2>

      <form class="registration-form" @submit.prevent="handleSubmit">
        <fieldset>

          <div class="form-group">

            <label for="OTP">Your login token</label>
            <input
                type="password"
                id="OTP"
                v-model="form.OTL"
                required
                placeholder="Enter login token"
                minlength="7"
                maxlength="7"
            />
          </div>

          <button type="submit" class="register-button">Login</button>
          <p>Send "/login" to <a href="https://discord.gg/kWGfK6St4m" target="_blank" rel="noopener noreferrer">the BGB discord bot</a> for your login token.</p>
          <p>Dont have an account? <router-link to="/register">Register</router-link></p>


          <!-- Alert message for password mismatch -->
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </fieldset>
      </form>
    </main>
  </section>
</template>

<script setup lang="ts">
import { useRegistrationForm } from './loginPage'
const { form, errorMessage, handleSubmit } = useRegistrationForm()
</script>

<style src="../userRegisterPage/RegisterPage.css"></style>
