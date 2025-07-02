<template>
  <div>
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

    <h3 v-if="searchQuery.trim() !== '' && displayedSkins.length === 0" class="not-found-text">
      Cant find the skin you are looking for? Let us know through discord.
    </h3>

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
              <button @click="applyAdvancedOptions()">Add skin with options</button>
            </div>
          </div>
        </div>
      </tr>
      </tbody>
    </table>


  </div>
</template>
<style src="./SkinSelector.css"></style>

<script lang="ts">
import { defineComponent } from 'vue';
import { useSkinSelector } from './SkinSelector';
import Slider from "@/components/SkinSelector/Slider.vue";

export default defineComponent({
  components: {
    Slider
  },
  setup() {
    return useSkinSelector();
  }
});
</script>