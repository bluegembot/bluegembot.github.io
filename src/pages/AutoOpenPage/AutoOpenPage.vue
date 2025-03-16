<template>

  <Navbar
      :rightItems="[
        { name: 'Dashboard', path: '/dashboard' }
      ]"
  />
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
import { WS_URL} from '@/config/environment';

const socket = ref<WebSocket | null>(null);
const reconnectTimeout = ref<number | null>(null);
const isManualDisconnect = ref<boolean>(false);

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

function connectToWebSocket() {
  if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
    return;
  }

  const wsUrl = `${WS_URL}`;

  try {
    // Explicitly set credentials mode
    socket.value = new WebSocket(wsUrl);

    // When the connection is established
    socket.value.onopen = () => {

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
      openUrlInNewTab(data);
    };

    // When the connection is closed
    socket.value.onclose = (event) => {
      console.log("WebSocket close event:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });

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
  } catch (error) {
    console.error("Error creating WebSocket:", error);
    errorMessage.value = "Failed to create WebSocket connection";
  }
}

function attemptReconnect() {
  if (!reconnectTimeout.value) {
    reconnectTimeout.value = setTimeout(() => {
      console.log("Attempting to reconnect...");
      connectToWebSocket();
    }, 7500) as unknown as number;
  }
}

// Function to close the WebSocket connection
function closeWebSocket() {
  if (socket.value) {
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
  closeWebSocket();
  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value); // Now passing the actual number instead of the Ref
    reconnectTimeout.value = null;
  }
});
</script>



<style src="./AutoOpenPage.css"></style>
