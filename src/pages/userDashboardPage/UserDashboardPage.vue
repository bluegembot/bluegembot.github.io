<template>
  <div>
    <main>
      <h1 class="main-title">Welcome to BGB</h1>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
        </div>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
      <div class="grid-container">

        <router-link to="/skinSelector" class="grid-item">Track new skin</router-link>
<!--        <router-link to="/settings" class="grid-item">account</router-link>-->
        <div class="grid-item">Account</div>
      </div>
    </main>
  </div>
</template>

<style src="./UserDashboardPage.css"></style>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const trackedSkins = ref([]);
    const errorMessage = ref(""); // Reactive variable for error messages

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
        alert(`Stopped tracking skin: ${skin.name}`);
      } catch (error) {
        console.error("Error stopping tracking for skin:", error);
        errorMessage.value = "Failed to stop tracking the skin. Please try again.";
      }
    };

    onMounted(fetchCsrfTokenAndUserConfig);

    return {
      trackedSkins,
      errorMessage, // Return errorMessage for use in the template
      stopTracking,
    };
  },
};
</script>

<style>
.error-message {
  display:flex;
  color: red;
  font-weight: bold;
  margin: 10px 0;
}
</style>


<style src="./UserDashboardPage.css"></style>

