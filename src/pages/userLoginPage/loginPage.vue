<template>
  <section>
    <!-- Main content with registration form -->
    <main>
      <h2 class="main-title">Login to BlueGemBot</h2>
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
                v-model="form.userName"
                required
                placeholder="Enter username"
            />
          </div>

          <div class="form-group">

            <label for="OTP">Your login token</label>
            <input
                type="text"
                id="OTP"
                v-model="form.OTL"
                required
                placeholder="Enter login token"
                minlength="7"
                maxlength="7"
            />
          </div>

          <button type="submit" class="register-button">Login</button>
          <p>/login to my bot for your login token </p>
          <p>Dont have an account?  <a><router-link to="/register">Register</router-link></a></p>


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