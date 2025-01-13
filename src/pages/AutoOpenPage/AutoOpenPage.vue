<template>
  <div class="logo-container">
    <div class="logo-circle">
      <img src="@/assets/BGBLogo.jpg" alt="BGB Logo" class="logo-img" />
    </div>
  </div>
  <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  <div class="auto-opener-page">
    <h1>Auto Opener</h1>
    <label class="switch">
      <input type="checkbox" :checked="isAutoOpenerActive" @change="toggleAutoOpener" />
      <span class="slider"></span>
    </label>
    <p>
      The auto-opener is <strong>{{ isAutoOpenerActive ? "Active" : "Inactive" }}</strong>.
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted } from "vue";


const socket = ref<WebSocket | null>(null);
const reconnectTimeout = ref<number | null>(null);
const isManualDisconnect = ref<boolean>(false);
const reconnectDelay = 5000;

// Reactive variables
const isAutoOpenerActive = ref(false);
const errorMessage = ref("");

// Toggle function
const toggleAutoOpener = () => {
  try {
    isAutoOpenerActive.value = !isAutoOpenerActive.value;
    if (isAutoOpenerActive.value === true) {
      connectToWebSocket();
    } else {
      closeWebSocket();
    }
  } catch (error) {
    errorMessage.value = "An error occurred.";
  }
};

function getSessionToken() {
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_token='));
  if (sessionCookie) {
    return sessionCookie.trim().split('=')[1];
  }
  return null;
}

function connectToWebSocket() {
  if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
    console.log("WebSocket is already connected or connecting.");
    return;
  }

  const sessionToken = getSessionToken();

  if (!sessionToken) {
    console.error("No session token found in cookies");
    return;
  }

  const wsUrl = "wss://bluegembot.duckdns.org/ws";

  // Create new WebSocket connection
  socket.value = new WebSocket(wsUrl);

  // When the connection is established
  socket.value.onopen = () => {
    console.log("Connected to WebSocket server");
    console.log("WebSocket connection established at:", new Date().toISOString());
    console.log("WebSocket state:", socket.value?.readyState);

    socket.value?.send(JSON.stringify({ action: "greet", message: "Hello, server!" }));

    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value);
      reconnectTimeout.value = null;
    }

    isManualDisconnect.value = false;
  };

  // When a message is received from the server
  socket.value.onmessage = (event) => {
    const data = event.data;
    console.log("Received message:", data);
    openUrlInNewTab(data);
  };

  // When the connection is closed
  socket.value.onclose = (event) => {
    if (event.code === 4001) {
      console.error("Unauthorized: No session token provided.");
      errorMessage.value = "Authentication failed. Please log in again.";
      isAutoOpenerActive.value = false;
    } else {
      console.log("WebSocket connection closed by server");

      if (!isManualDisconnect.value) {
        attemptReconnect();
      }
    }
  };

  // When there's an error with the WebSocket connection
  socket.value.onerror = (error) => {
    console.error("WebSocket error details:", {
      readyState: socket.value?.readyState,
      url: socket.value?.url,
      protocol: socket.value?.protocol,
      error: error
    });
    errorMessage.value = "Connection error. Attempting to reconnect...";

    if (!isManualDisconnect.value) {
      attemptReconnect();
    }
  };
}

function attemptReconnect() {
  if (!reconnectTimeout.value) {
    reconnectTimeout.value = setTimeout(() => {
      console.log("Attempting to reconnect...");
      connectToWebSocket();
    }, 5000) as unknown as number; // 5 second delay before reconnecting
  }
}

// Function to close the WebSocket connection
function closeWebSocket() {
  if (socket.value) {
    console.log("Closing WebSocket connection");
    isManualDisconnect.value = true;
    socket.value.close();
    socket.value = null;
    errorMessage.value = ""; // Clear any error messages
  } else {
    console.log("No active WebSocket connection to close.");
  }
}

// Function to open a URL in a new tab
function openUrlInNewTab(url: string) {
  if (isValidUrl(url)) {
    window.open(url, "_blank");
  } else {
    console.warn("Received invalid URL:", url);
    errorMessage.value = "Received invalid URL from server";
  }
}

// Function to validate if a string is a valid URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  console.log("Page unmounted, cleaning up WebSocket connection.");
  closeWebSocket();
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
});
</script>



<style src="./AutoOpenPage.css"></style>
