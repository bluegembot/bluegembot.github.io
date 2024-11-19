<template>
  <div>

    <div class="logo-container">
      <div class="logo-circle">
        <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
      </div>
    </div>
    <h2 class="main-title">Skin search</h2>

    <!-- Search Bar with Dashboard Button -->
    <div class="search-container">

      <input
          type="text"
          v-model="searchQuery"
          placeholder="Search skins by name"
          class="search-bar"
      />
      <a class="dashboard-button"> <router-link to="/dashboard">Dashboard</router-link></a>
    </div>

    <!-- Table -->
    <table v-if="displayedSkins.length > 0">
      <thead>
      <tr>
        <th></th>
        <th>Skin name</th>
        <th>Select condition</th>
        <th>Minimum float</th>
        <th>Maximum float</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(skin, index) in displayedSkins" :key="index">
        <td>
          <img
              :src="skin.imageUrl"
              alt="Skin image"
              class="skin-image"
          />
        </td>
        <td>{{ formattedSkinName(skin) }}</td> <!-- Render the formatted name here -->
        <td>
          <select
              v-model="skin.condition"
              @change="updateFloats(skin)"
          >
            <option value="Factory new">Factory new</option>
            <option value="Minimal wear">Minimal wear</option>
            <option value="Field tested">Field tested</option>
            <option value="Well worn">Well worn</option>
            <option value="Battle scarred">Battle scarred</option>
          </select>
        </td>
        <td>
          <input
              v-model.number="skin.minFloat"
              :min="Math.max(0, skin.allowedMinFloat)"
              :max="Math.min(1, skin.allowedMaxFloat)"
              type="number"
              step="0.01"
              placeholder="Min Float"
              class="float-input"
              @blur="validateFloatInput(skin, 'minFloat')"
          />
        </td>
        <td>
          <input
              v-model.number="skin.maxFloat"
              :min="Math.max(0, skin.allowedMinFloat)"
              :max="Math.min(1, skin.allowedMaxFloat)"
              type="number"
              step="0.01"
              placeholder="Max Float"
              class="float-input"
              @blur="validateFloatInput(skin, 'maxFloat')"
          />
        </td>
        <td>
          <button @click="addSkin(index)">Add Skin</button>
        </td>
      </tr>
      </tbody>
    </table>
    <p v-else class="no-results">Start typing to search for skins.</p>
  </div>
</template>
<script>
import skinsJson from "@/assets/skins.json";

export default {
  data() {
    return {
      searchQuery: "",
      skins: [], // Full dataset
      displayedSkins: [], // Currently displayed skins based on search
    };
  },
  watch: {
    searchQuery(newQuery) {
      if (newQuery.trim() === "") {
        this.displayedSkins = []; // Clear results if the search is empty
      } else {
        this.filterSkins(newQuery);
      }
    },
  },
  methods: {
    filterSkins(query) {
      // Replace spaces in the search query with dashes for comparison
      const formattedQuery = query.trim().toLowerCase().replace(/\s+/g, '-');

      // Filter skins based on the formatted search query (using dashes)
      const filtered = this.skins.filter((skin) =>
          skin.itemName.toLowerCase().includes(formattedQuery)
      );
      this.displayedSkins = filtered.slice(0, 50); // Display first 50 results
    },
    updateFloats(skin) {
      // Update minFloat and maxFloat based on the selected condition
      const floatRanges = {
        "Factory new": { minFloat: 0, maxFloat: 0.06 },
        "Minimal wear": { minFloat: 0.07, maxFloat: 0.15 },
        "Field tested": { minFloat: 0.15, maxFloat: 0.37 },
        "Well worn": { minFloat: 0.37, maxFloat: 0.44 },
        "Battle scarred": { minFloat: 0.44, maxFloat: 1 },
      };

      const selectedCondition = floatRanges[skin.condition];
      if (selectedCondition) {
        skin.minFloat = selectedCondition.minFloat;
        skin.maxFloat = selectedCondition.maxFloat;
        skin.allowedMinFloat = selectedCondition.minFloat; // Set allowed min
        skin.allowedMaxFloat = selectedCondition.maxFloat; // Set allowed max
      }
    },
    validateFloatInput(skin, field) {
      if (field === "minFloat") {
        if (skin.minFloat < skin.allowedMinFloat) {
          skin.minFloat = skin.allowedMinFloat;
        }
        if (skin.minFloat > skin.allowedMaxFloat) {
          skin.minFloat = skin.allowedMaxFloat;
        }
        if (skin.minFloat < 0) {
          skin.minFloat = 0; // Enforce global lower bound
        }
        if (skin.minFloat > 1) {
          skin.minFloat = 1; // Enforce global upper bound
        }
      } else if (field === "maxFloat") {
        if (skin.maxFloat < skin.allowedMinFloat) {
          skin.maxFloat = skin.allowedMinFloat;
        }
        if (skin.maxFloat > skin.allowedMaxFloat) {
          skin.maxFloat = skin.allowedMaxFloat;
        }
        if (skin.maxFloat < 0) {
          skin.maxFloat = 0; // Enforce global lower bound
        }
        if (skin.maxFloat > 1) {
          skin.maxFloat = 1; // Enforce global upper bound
        }
      }
    },
    addSkin(index) {
      const skin = this.displayedSkins[index];

      // Modify the itemName to include the selected condition
      const updatedSkinName = skin.itemName
          .replace('factory-new', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('minimal-wear', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('field-tested', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('battle-scarred', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('well-worn', skin.condition.toLowerCase().replace(' ', '-'));


      const payload = {
        skinName: updatedSkinName, // Updated skin name
        minFloat: skin.minFloat,
        maxFloat: skin.maxFloat,
      };

      // First, fetch the CSRF token
      fetch("https://bluegembot.duckdns.org/csrf-token", {
        method: "GET",
        credentials: "include", // Include credentials (cookies) in the request
      })
          .then((response) => response.json())
          .then((data) => {
            const csrfToken = data.csrfToken; // Get the CSRF token

            // Now send the request to add the skin
            fetch("https://bluegembot.duckdns.org/addSkin", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "csrf-token": csrfToken, // Include the CSRF token in the header
              },
              body: JSON.stringify(payload),
              credentials: "include", // Include credentials (cookies) in the request
            })
                .then((response) => response.json())
                .then((data) => {
                  alert(`Skin added successfully: ${data.message}`);
                })
                .catch((error) => {
                  console.error("Error adding skin:", error);
                  alert("Failed to add skin.");
                });
          })
          .catch((error) => {
            console.error("Error fetching CSRF token:", error);
            alert("Failed to fetch CSRF token.");
          });
    },

    // New method to format the skin name for display
    formattedSkinName(skin) {
      // Replace dashes with spaces and remove the 'factory-new' part
      return skin.itemName
          .replace(/-/g, ' ') // Replace dashes with spaces
          .replace(/factory new/g, '')
          .replace(/minimal wear/g, '')
          .replace(/field tested/g, '')
          .replace(/battle scarred/g, '')
          .replace(/well worn/g, '');
    },
  },
  created() {
    // Load the JSON data and initialize skin properties
    this.skins = skinsJson.map((skin) => ({
      ...skin,
      condition: "Factory new",
      minFloat: 0,
      maxFloat: 0.06,
      allowedMinFloat: 0, // Initial allowed min
      allowedMaxFloat: 0.06, // Initial allowed max
    }));
  },
};
</script>

<style src="./SkinSelector.css"></style>