<template>
  <div>
    <main>
      <h1 class="main-title">Welcome to BGB, {{ username }}!</h1>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img"/>
        </div>
      </div>
      <!-- Error/Success Message -->
      <p v-if="errorMessage"
         :class="[
     messageType === 'success' ? 'success-message' : 'error-message',
     'fixed-top-message'
   ]">
        {{ errorMessage }}
      </p>
      <!-- Section with Upcoming and Announcements -->
      <div class="upcoming-announcements">
        <!-- Upcoming list -->
        <div class="upcoming">
          <h2>Tracked skins</h2>
          <ul class="upcoming-list">
            <template v-if="trackedSkins.length > 0">
              <li v-for="(skin, index) in trackedSkins" :key="skin.name" class="tracked-skin-item">
                {{ index + 1 }}. {{ skin.name }} | Min Float: {{ skin.minWear }} | Max Float: {{ skin.maxWear }}
                <button class="stop-tracking-button" @click="stopTracking(skin)">
                  Stop Tracking
                </button>
              </li>
            </template>
            <template v-else>
              <li class="no-tracking-message">
                Not tracking any skins at this time, add a skin to start tracking.
              </li>
            </template>
            <template v-else>
              <li class="no-tracking-message">
                Not tracking any skins at this time, add a skin to start tracking.
              </li>
            </template>
          </ul>
        </div>

      </div>

      <!-- Grid section -->
      <div class="grid-container-dashboard">

        <router-link to="/skinSelector" class="grid-item">Track new skin</router-link>

        <router-link to="/account" class="grid-item">Account</router-link>

        <router-link to="/autoOpen" class="grid-item">Auto Opener (OPEN BETA)</router-link>
      </div>
    </main>
  </div>
</template>

<style src="./UserDashboardPage.css"></style>


<script>
import {onMounted, ref} from "vue";

export default {
  setup() {
    const trackedSkins = ref([]);
    const errorMessage = ref(""); // Reactive variable for error messages
    const username = ref("")

    onMounted(() => {
      username.value = localStorage.getItem('username'); // Get the stored username
      console.log(username.value)
    });

    const fetchCsrfTokenAndUserConfig = async () => {
      try {
        const csrfResponse = await fetch("https://bluegembot.duckdns.org/csrf-token", {
          method: "GET",
          credentials: "include",
        });

        if (!csrfResponse.ok) {
          throw new Error("Failed to fetch CSRF token");
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;

        const configResponse = await fetch(
            `https://bluegembot.duckdns.org/getUserConfig`,
            {
              method: "GET",
              headers: {
                "csrf-token": csrfToken,
              },
              credentials: "include",
            }
        );

        if (!configResponse.ok) {
          throw new Error("Failed to fetch user config");
        }

        const configData = await configResponse.json();
        trackedSkins.value = configData.itemsOfInterest.map((item) => ({
          name: item.itemOfInterest,
          minWear: item.minWear,
          maxWear: item.maxWear,
        }));
      } catch (error) {
        console.error("Error fetching user config:", error);
        errorMessage.value = "Failed to load tracked skins. Please try again later.";
      }
    };

    const stopTracking = async (skin) => {
      try {
        const csrfResponse = await fetch("https://bluegembot.duckdns.org/csrf-token", {
          method: "GET",
          credentials: "include",
        });

        if (!csrfResponse.ok) {
          throw new Error("Failed to fetch CSRF token");
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;

        const deleteResponse = await fetch("https://bluegembot.duckdns.org/deleteSkin", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "csrf-token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({
            skinName: skin.name,
            minFloat: skin.minWear,
            maxFloat: skin.maxWear,
          }),
        });

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete skin");
        }

        // Remove the skin from the local list on success
        trackedSkins.value = trackedSkins.value.filter(
            (trackedSkin) => trackedSkin.name !== skin.name
        );
        errorMessage.value = `Stopped tracking skin: ${skin.name}`;
        clearErrorMessages(); // Clear error message after a delay
      } catch (error) {
        console.error("Error stopping tracking for skin:", error);
        errorMessage.value = "Failed to stop tracking the skin. Please try again.";
        clearErrorMessages(); // Clear error message after a delay
      }
    };

    const clearErrorMessages = () => {
      // After 1 second, fade out the message
      setTimeout(() => {
        errorMessage.value = ''; // Clear the message
      }, 2500); // Fade away after 1 second
    };

    onMounted(fetchCsrfTokenAndUserConfig);

    return {
      trackedSkins,
      errorMessage, // Return errorMessage for use in the template
      stopTracking,
      username
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


<style src="./UserDashboardPage.css"></style>
