<template>
  <div>
    <main>
      <h1 class="main-title">Welcome to BGB</h1>
      <div class="logo-container">
        <div class="logo-circle">
          <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
        </div>
      </div>
      <!-- Section with Upcoming and Announcements -->
      <div class="upcoming-announcements">
        <!-- Upcoming list -->
        <div class="upcoming">
          <h2>Tracked skins</h2>
          <ul class="upcoming-list">
            <template v-if="trackedSkins.length > 0">
              <li v-for="skin in trackedSkins" :key="skin.name" class="tracked-skin-item">
                {{ skin.name }} | Min Float: {{ skin.minWear }} | Max Float: {{ skin.maxWear }}
                <button class="stop-tracking-button" @click="stopTracking(skin)">
                  Stop Tracking
                </button>
              </li>
            </template>
            <template v-else>
              <li class="no-tracking-message">Not tracking any skins at this time, add a skin to start tracking.</li>
            </template>
          </ul>
        </div>
      </div>

      <!-- Grid section -->
      <div class="grid-container">
        <router-link to="/skinSelector" class="grid-item">Track new skin</router-link>
        <router-link to="/settings" class="grid-item">account</router-link>
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

    const fetchCsrfTokenAndUserConfig = async () => {
      try {
        const csrfResponse = await fetch("http://localhost:3002/csrf-token", {
          method: "GET",
          credentials: "include",
        });

        if (!csrfResponse.ok) {
          throw new Error("Failed to fetch CSRF token");
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;

        const configResponse = await fetch(
            `http://localhost:3002/getUserConfig`,
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
        alert("Failed to load tracked skins.");
      }
    };

    const stopTracking = async (skin) => {
      try {
        const csrfResponse = await fetch("http://localhost:3002/csrf-token", {
          method: "GET",
          credentials: "include",
        });

        if (!csrfResponse.ok) {
          throw new Error("Failed to fetch CSRF token");
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;

        const deleteResponse = await fetch("http://localhost:3002/deleteSkin", {
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
        alert("Failed to stop tracking the skin.");
      }
    };

    onMounted(fetchCsrfTokenAndUserConfig);

    return {
      trackedSkins,
      stopTracking,
    };
  },
};
</script>



