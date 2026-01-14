<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="actions-container">
          <button
              type="button"
              class="cancel-subscription-btn"
              @click="handleCancelSubscription"
              :disabled="isLoading"
          >
            Cancel subscription
          </button>

          <button
              type="button"
              class="delete-account-btn"
              @click="handleDeleteAccount"
              :disabled="isLoading"
          >
            Delete account
          </button>
        </div>
      </div>

      <div class="modal-footer">
      </div>
    </div>
  </div>
</template>


<script>
// import {csrfFetch} from "@/api/csrf.js";

import {csrfFetch} from "@/api/csrf.ts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

export default {
  name: "SubscriptionsModal",
  props: {
    visible: {type: Boolean, default: false},
    title: {type: String, default: "Settings"},
    settings: {
      type: Object,
      default: () => ({
        csfloatTracking: false,
        skinportTracking: true,
      }),
    },
    isLoading: {type: Boolean, default: false},
  },
  emits: ["close", "save", "message"],
  data() {
    return {
      localSettings: {...this.settings},
      csrfToken: "",
      internalLoading: false,
      errorMessage: "",
    };
  },
  computed: {
    loading() {
      return this.isLoading || this.internalLoading;
    },
  },
  watch: {
    settings: {
      handler(newSettings) {
        this.localSettings = {...newSettings};
      },
      deep: true,
    },
    visible(newVisible) {
      if (newVisible) {
        this.localSettings = {...this.settings};
        this.errorMessage = "";
      }
    },
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleSave() {
      this.$emit("save", this.localSettings);
    },

    async fetchCsrfToken() {
      const r = await fetch(`${API_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch CSRF token");
      }

      const data = await r.json();
      if (!data?.csrfToken) throw new Error("CSRF token missing in response");

      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    },

    async handleDeleteAccount() {
      this.errorMessage = "";

      const confirmed = window.confirm(
          "Are you sure you want to delete your account? This cannot be undone."
      );
      if (!confirmed) return;

      try {
        this.internalLoading = true;

        if (!this.csrfToken) {
          await this.fetchCsrfToken();
        }

        const r = await fetch(`${API_URL}/deleteUser`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": this.csrfToken,
          },
        });

        // If CSRF expired, refresh once and retry
        if (r.status === 403) {
          await this.fetchCsrfToken();

          const retry = await fetch(`${API_URL}/deleteUser`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": this.csrfToken,
            },
          });

          if (!retry.ok) {
            const err = await retry.json().catch(() => ({}));
            throw new Error(err.message || "Delete failed");
          }
        } else if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.message || "Delete failed");
        }

        // Close modal and take user out of the authenticated area
        this.$emit("close");

        // Optional: redirect to login/home
        window.location.href = "/";
      } catch (e) {
        console.error(e);
        this.errorMessage = e?.message || "Something went wrong while deleting your account.";
      } finally {
        this.internalLoading = false;
      }
    },
    async handleCancelSubscription() {
      const confirmed = window.confirm(
          "Are you sure you want to cancel your subscription? This cannot be undone."
      );
      if (!confirmed) return;

      try {
        this.internalLoading = true;

        const r = await csrfFetch(`${API_URL}/cancelSubscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const body = await r.json().catch(() => ({}));

        if (!r.ok) {
          this.$emit("message", {
            type: "error",
            text: body.message || "Cancellation failed",
          });
          return; // keep modal open so user can read it
        }

        this.$emit("message", {
          type: "success",
          text: body.message || "Subscription cancelled successfully",
        });

        this.$emit("close");
        // If you redirect here, the message on the page will disappear immediately.
        // window.location.href = "/";
      } catch (e) {
        this.$emit("message", {
          type: "error",
          text: e?.message || "Something went wrong while cancelling your subscription.",
        });
      } finally {
        this.internalLoading = false;
      }
    }
  },
};
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background-mute);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid var(--accent-color);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--accent-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-light);
  font-size: 22px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-light);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 20px;
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cancel-subscription-btn,
.delete-account-btn {
  width: 100%;
  padding: 12px 18px;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}

.cancel-subscription-btn {
  background-color: #dc2626;
}

.delete-account-btn {
  background-color: #b91c1c;
}

.cancel-subscription-btn:hover:not(:disabled),
.delete-account-btn:hover:not(:disabled) {
  filter: brightness(0.92);
  transform: translateY(-1px);
}

.cancel-subscription-btn:active:not(:disabled),
.delete-account-btn:active:not(:disabled) {
  transform: translateY(0);
  filter: brightness(0.88);
}

.cancel-subscription-btn:disabled,
.delete-account-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  filter: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--accent-color);
}

.close-btn-secondary {
  padding: 10px 18px;
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}

.close-btn-secondary:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.close-btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  filter: none;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }

  .modal-header h3 {
    font-size: 18px;
  }

  .modal-footer {
    padding: 16px;
  }

  .close-btn-secondary {
    width: 100%;
  }
}
</style>
