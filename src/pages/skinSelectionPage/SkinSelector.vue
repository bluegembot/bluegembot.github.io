<template>
  <div>
    <!-- Existing UI -->
    <div class="logo-container">
      <div class="logo-circle">
        <img alt="BGB Logo" class="logo-img" src="@/assets/BGBLogo.jpg"/>
      </div>
    </div>
    <h2 class="main-title">Skin search</h2>
    <div class="search-container">
      <input
          v-model="searchQuery"
          class="search-bar"
          placeholder="Search skins by name"
          type="text"
      />
      <router-link to="/dashboard">
        <button class="dashboard-button">Dashboard</button>
      </router-link>
    </div>

    <!-- Error/Success Message -->
    <p v-if="errorMessage"
       :class="[
     messageType === 'success' ? 'success-message' : 'error-message',
     'fixed-top-message'
   ]">
      {{ errorMessage }}
    </p>



    <!-- Table -->
    <table v-if="displayedSkins.length > 0">
      <thead>
      <tr>
        <th></th>
        <th>Skin name</th>
        <th>Select condition</th>
        <th>Minimum float</th>
        <th>Maximum float</th>
        <th>Advanced options</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(skin, index) in displayedSkins" :key="index">
        <td>
          <img :src="skin.imageUrl" alt="Skin image" class="skin-image"/>
        </td>
        <td>{{ formattedSkinName(skin) }}</td>
        <td>
          <select v-model="skin.condition" @change="updateFloats(skin)">
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
              :max="Math.min(1, skin.allowedMaxFloat)"
              :min="Math.max(0, skin.allowedMinFloat)"
              class="float-input"
              placeholder="Min Float"
              step="0.01"
              type="number"
              @blur="validateFloatInput(skin, 'minFloat')"
          />
        </td>
        <td>
          <input
              v-model.number="skin.maxFloat"
              :max="Math.min(1, skin.allowedMaxFloat)"
              :min="Math.max(0, skin.allowedMinFloat)"
              class="float-input"
              placeholder="Max Float"
              step="0.01"
              type="number"
              @blur="validateFloatInput(skin, 'maxFloat')"
          />
        </td>
        <td>
          <button @click="openMenu(skin)">Advanced options</button>
        </td>
        <td>
          <button @click="addSkin(skin)">Add Skin</button>
        </td>

        <!-- Modal -->
        <div v-if="showAdvancedMenu" class="modal">
          <div class="modal-content">
            <p v-if="modalErrorMessage" :class="[messageType === 'success' ? 'success-message' : 'error-message']">
              {{ modalErrorMessage }}
            </p>
            <h3>Advanced Options</h3>
            <div class="modal-checkbox-container">
              <div class="modal-checkbox">
                <label for="option1">StatTrak</label>
                <input id="StatTrak" v-model="advancedOptions.statTrak" type="checkbox"/>
              </div>
              <div class="modal-checkbox">
                <label for="option2">Souvenir</label>
                <input id="Souvenir" v-model="advancedOptions.souvenir" type="checkbox"/>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="closeMenu">Close</button>
              <button @click="applyAdvancedOptions(index)">Add skin with options</button>
            </div>
          </div>
        </div>
      </tr>
      </tbody>
    </table>


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
      errorMessage: "", // Error message to display
      modalErrorMessage: "",
      showAdvancedMenu: false, // Controls visibility of the modal
      advancedOptions: {
        statTrak: false,
        souvenir: false,
      },
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
        "Factory new": {minFloat: 0, maxFloat: 0.07},
        "Minimal wear": {minFloat: 0.07, maxFloat: 0.15},
        "Field tested": {minFloat: 0.15, maxFloat: 0.38},
        "Well worn": {minFloat: 0.38, maxFloat: 0.45},
        "Battle scarred": {minFloat: 0.45, maxFloat: 1},
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
    openMenu(skin) {
      this.selectedSkin = skin;  // Store the selected skin object
      this.showAdvancedMenu = true;
    },
    closeMenu() {
      this.selectedSkin = null;
      this.showAdvancedMenu = false;
      this.modalErrorMessage = ""
    },
    applyAdvancedOptions() {
      if (this.advancedOptions.statTrak && this.advancedOptions.souvenir) {
        this.modalErrorMessage = "Cannot apply both Souvenir and StatTrak.";
        this.clearErrorMessages()
        return;
      }

      // Check if the item name contains "gloves", "hand-wraps", or "knife"
      const restrictedSouvenirKeywords = ["gloves", "hand-wraps", "knife", "karambit", "bayonet", "m9-bayonet", "shadow-daggers", "m4a1-s-fade"];
      const containsRestrictedSouvenirKeyword = restrictedSouvenirKeywords.some(keyword =>
          this.selectedSkin.itemName.toLowerCase().includes(keyword)
      );

      const restrictedStatTrakKeywords = ["heat-treated", "gloves", "dragon-lore", "medusa", "m4a1-s-fade", "hand-wraps"]
      const containsRestrictedStatTrakKeyword = restrictedStatTrakKeywords.some(keyword =>
          this.selectedSkin.itemName.toLowerCase().includes(keyword)
      );

      if (this.advancedOptions.souvenir && containsRestrictedSouvenirKeyword) {
        this.modalErrorMessage = "Souvenir cannot be applied to gloves, hand-wraps, or knives.";
        this.clearErrorMessages()
        return;
      }

      if (this.advancedOptions.statTrak && containsRestrictedStatTrakKeyword) {
        this.modalErrorMessage = "Stat trak cannot be applied to your selected skin";
        this.clearErrorMessages()
        return;
      }

      // Determine the advanced option (if any)
      let advancedOption = "";
      if (this.advancedOptions.souvenir) {
        advancedOption = "souvenir";
      } else if (this.advancedOptions.statTrak) {
        advancedOption = "stattrak";
      }

      // Pass the selected skin directly to addSkin
      this.addSkin(this.selectedSkin, advancedOption);

      this.closeMenu(); // Close the modal after applying options
    },
    addSkin(skin, advancedOption = "") {
      // Modify the itemName to include the selected condition
      let finalSkinName = skin.itemName
          .replace('factory-new', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('minimal-wear', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('field-tested', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('battle-scarred', skin.condition.toLowerCase().replace(' ', '-'))
          .replace('well-worn', skin.condition.toLowerCase().replace(' ', '-'));

      if (advancedOption) {
        finalSkinName = `${advancedOption}-${finalSkinName}`
      }

      const payload = {
        skinName: finalSkinName, // Updated skin name
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
                  this.errorMessage = data.message; // Set the success message
                  this.messageType = "success"; // Set the message type to success
                  this.clearErrorMessages()
                })
                .catch((error) => {
                  console.error("Error adding skin:", error);
                  this.errorMessage = "Failed to add skin, please try again.";
                  this.messageType = "error"; // Set the message type to error
                  this.clearErrorMessages()
                });
          })
          .catch((error) => {
            console.error("Error fetching CSRF token:", error);
            this.errorMessage = "Internal server error, please try again.";
            this.messageType = "error"; // Set the message type to error
            this.clearErrorMessages()
          });
    },

    clearErrorMessages(){
      // After 1 second, fade out the message
      setTimeout(() => {
        this.errorMessage = ''; // Clear the message
        this.modalErrorMessage = '';
      }, 2500); // Fade away after 1 second
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
      maxFloat: 0.07,
      allowedMinFloat: 0, // Initial allowed min
      allowedMaxFloat: 0.07, // Initial allowed max
    }));
  },
};
</script>

<style src="./SkinSelector.css"></style>
