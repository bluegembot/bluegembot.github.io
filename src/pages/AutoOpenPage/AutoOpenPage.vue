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

let socket: WebSocket | null = null;
let reconnectTimeout: number | null = null;
const reconnectDelay = 5000;
let isManualDisconnect = false;

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

// Function to connect to the WebSocket server
function connectToWebSocket() {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    console.log("WebSocket is already connected or connecting.");
    return;
  }

// Use relative WebSocket URL
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}`;

  console.log('Attempting to connect to:', wsUrl);
  socket = new WebSocket(wsUrl);

  // When the connection is established
  socket.onopen = () => {
    console.log("Connected to WebSocket server");

    // Send a message to the server once the connection is open
    socket?.send(JSON.stringify({ action: "greet", message: "Hello, server!" }));

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    isManualDisconnect = false;
  };

  // When a message is received from the server
  socket.onmessage = (event) => {
    const data = event.data;
    console.log("Received message:", data);
    openUrlInNewTab(data);
  };

  // When the connection is closed
  socket.onclose = (event) => {
    if (event.code === 4001) {
      console.error("Unauthorized: No session token provided.");
      errorMessage.value = "Authentication failed. Please log in again.";
      isAutoOpenerActive.value = false;
    } else {
      console.log("WebSocket connection closed by server");

      if (!isManualDisconnect) {
        attemptReconnect();
      }
    }
  };

  // When there's an error with the WebSocket connection
  socket.onerror = (error) => {
    console.error("WebSocket error details:", {
      readyState: socket?.readyState,
      url: socket?.url,
      protocol: socket?.protocol,
      error: error
    });
    errorMessage.value = "Connection error. Attempting to reconnect...";

    if (!isManualDisconnect) {
      attemptReconnect();
    }
  };
}

// Function to attempt a reconnect after a delay
function attemptReconnect() {
  if (reconnectTimeout) return;
  console.log("Attempting to reconnect...");
  reconnectTimeout = setTimeout(() => {
    connectToWebSocket();
  }, reconnectDelay);
}

// Function to close the WebSocket connection
function closeWebSocket() {
  if (socket) {
    console.log("Closing WebSocket connection");
    isManualDisconnect = true;
    socket.close();
    socket = null;
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
