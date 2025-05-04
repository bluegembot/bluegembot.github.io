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
              <div class="multi-range">
                <!-- Discount slider -->
                <Slider
                    v-model="advancedOptions.minDiscount"
                    v-model:enabledModelValue="advancedOptions.forceDiscount"
                    checkboxLabel="Force discount"
                    inputLabel="Minimum discount in %"
                    min="0"
                    max="100"
                    minLabel="-100%"
                    maxLabel="-1%"
                    tooltipSuffix="%"
                    sliderType="discount"
                />

                <!-- Fade percentage slider - Only show if item has "fade" without "marble" or "amber" -->
                <Slider
                    v-if="shouldShowFadeSlider"
                    v-model="advancedOptions.minFadePercentage"
                    v-model:enabledModelValue="advancedOptions.forceFadePercentage"
                    checkboxLabel="Force fade percentage"
                    inputLabel="Minimum fade percentage"
                    min="0"
                    max="100"
                    minLabel="0%"
                    maxLabel="100%"
                    tooltipSuffix="%"
                    sliderType="percentage"
                />

              </div>
              <div class="modal-checkbox">
                <label for="option3">StatTrak</label>
                <input id="StatTrak" v-model="advancedOptions.statTrak" type="checkbox"/>
              </div>
              <div class="modal-checkbox">
                <label for="option4">Souvenir</label>
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
import {API_URL} from '@/config/environment';
import DiscountSlider from "@/components/Slider.vue"
import Slider from "@/components/Slider.vue";

export default {
  components: {
    Slider,
    DiscountSlider
  },
  data() {
    return {
      searchQuery: "",
      skins: [],
      displayedSkins: [],
      errorMessage: "",
      modalErrorMessage: "",
      showAdvancedMenu: false,
      advancedOptions: {
        statTrak: false,
        souvenir: false,
        minDiscount: 1,
        forceDiscount: false,
        minFadePercentage: 80,
        forceFadePercentage: false
      },
      selectedSkin: null
    };
  },
  computed: {
    shouldShowFadeSlider() {
      if (!this.selectedSkin) return false;

      const itemName = this.selectedSkin.itemName.toLowerCase();
      return itemName.includes('fade') &&
          !itemName.includes('marble') &&
          !itemName.includes('amber');
    }
  },
  watch: {
    searchQuery(newQuery) {
      if (newQuery.trim() === "") {
        this.displayedSkins = [];
      } else {
        this.filterSkins(newQuery);
      }
    },
  },
  methods: {
    filterSkins(query) {
      const formattedQuery = query.trim().toLowerCase().replace(/\s+/g, '-');
      const filtered = this.skins.filter((skin) =>
          skin.itemName.toLowerCase().includes(formattedQuery)
      );
      this.displayedSkins = filtered.slice(0, 50);
    },
    updateFloats(skin) {
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
        skin.allowedMinFloat = selectedCondition.minFloat;
        skin.allowedMaxFloat = selectedCondition.maxFloat;
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
          skin.minFloat = 0;
        }
        if (skin.minFloat > 1) {
          skin.minFloat = 1;
        }
      } else if (field === "maxFloat") {
        if (skin.maxFloat < skin.allowedMinFloat) {
          skin.maxFloat = skin.allowedMinFloat;
        }
        if (skin.maxFloat > skin.allowedMaxFloat) {
          skin.maxFloat = skin.allowedMaxFloat;
        }
        if (skin.maxFloat < 0) {
          skin.maxFloat = 0;
        }
        if (skin.maxFloat > 1) {
          skin.maxFloat = 1;
        }
      }
    },
    openMenu(skin) {
      this.selectedSkin = skin;
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

      let advancedOption = "";
      if (this.advancedOptions.souvenir) {
        advancedOption = "souvenir";
      } else if (this.advancedOptions.statTrak) {
        advancedOption = "stattrak";
      }

      this.addSkin(this.selectedSkin, advancedOption);

      this.closeMenu();
    },
    addSkin(skin, advancedOption = "") {
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
        skinName: finalSkinName,
        minFloat: skin.minFloat,
        maxFloat: skin.maxFloat,
        minDiscount: this.advancedOptions.forceDiscount ? this.advancedOptions.minDiscount : false,
        minFadePercentage: this.advancedOptions.forceFadePercentage ? this.advancedOptions.minFadePercentage : false
      };

      fetch(`${API_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      })
          .then((response) => response.json())
          .then((data) => {
            const csrfToken = data.csrfToken;

            fetch(`${API_URL}/addSkin`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "csrf-token": csrfToken,
              },
              body: JSON.stringify(payload),
              credentials: "include",
            })
                .then((response) => response.json())
                .then((data) => {
                  this.errorMessage = data.message;
                  this.messageType = "success";
                  this.clearErrorMessages()
                })
                .catch((error) => {
                  console.error("Error adding skin:", error);
                  this.errorMessage = "Failed to add skin, please try again.";
                  this.messageType = "error";
                  this.clearErrorMessages()
                });
          })
          .catch((error) => {
            console.error("Error fetching CSRF token:", error);
            this.errorMessage = "Internal server error, please try again.";
            this.messageType = "error";
            this.clearErrorMessages()
          });
    },
    clearErrorMessages() {
      setTimeout(() => {
        this.errorMessage = '';
        this.modalErrorMessage = '';
      }, 2500);
    },
    formattedSkinName(skin) {
      return skin.itemName
          .replace(/-/g, ' ')
          .replace(/factory new/g, '')
          .replace(/minimal wear/g, '')
          .replace(/field tested/g, '')
          .replace(/battle scarred/g, '')
          .replace(/well worn/g, '');
    },
  },
  created() {
    this.skins = skinsJson.map((skin) => ({
      ...skin,
      condition: "Factory new",
      minFloat: 0,
      maxFloat: 0.07,
      allowedMinFloat: 0,
      allowedMaxFloat: 0.07,
    }));
  },
};
</script>

<style src="./SkinSelector.css"></style>
