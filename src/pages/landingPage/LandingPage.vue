<template>
  <div class="landing-page" ref="pageRoot">
    <div class="scroll-progress" aria-hidden="true"></div>
    <Navbar
        :rightItems="[
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' }
      ]"
    />
    <section id="hero" ref="hero">
      <div class="content-wrapper hero-content">
        <h1>Let CS2 skin listings come to you</h1>
        <p>BlueGemBot is a free, instant, and customizable Skinport and CSFloat listing tracker made for traders, collectors, and deal snipers.</p>
        <div class="hero-actions">
          <router-link to="/register" class="hero-btn hero-btn-primary">Get started free</router-link>
          <a href="#top-deals" class="hero-btn hero-btn-secondary">See today's top deals</a>
        </div>
        <p class="hero-hint">No password needed: register through Discord in under a minute.</p>
      </div>
      <a href="#features" class="scroll-cue" aria-label="Scroll down to features">
        <span class="scroll-cue-chevron" aria-hidden="true"></span>
      </a>
    </section>

    <section id="features" ref="features" class="fade-section">
      <div class="content-wrapper">
        <h2 class="sr-only">Why traders use BlueGemBot</h2>
        <div class="features">
          <div class="feature-card fast stagger-item" style="--reveal-index: 0">
            <span class="feature-emoji" aria-hidden="true">⚡</span>
            <h3 class="feature-title">Lightning Fast</h3>
            <p>Track new CS2 listings with Discord alerts and an integrated auto-opener built for fast reactions when profitable deals appear.</p>
          </div>
          <div class="feature-card secure stagger-item" style="--reveal-index: 1">
            <span class="feature-emoji" aria-hidden="true">🛡️</span>
            <h3 class="feature-title">Secure by Design</h3>
            <p>Login and registration tokens are managed through your Discord DMs with BlueGemBot, so you can avoid passwords and third-party logins.</p>
          </div>
          <div class="feature-card profitable stagger-item" style="--reveal-index: 2">
            <span class="feature-emoji" aria-hidden="true">💰</span>
            <h3 class="feature-title">Profitable</h3>
            <p>Use float, pattern, pricing, and discount signals to spot blue gem and other underpriced CS2 skin opportunities faster.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="top-deals" ref="video" class="fade-section top-deals-section">
      <div class="top-deals-heading">
        <div class="top-deals-title-row">
          <h2 class="top-deals-title">Today's top 10 deals</h2>
          <span class="live-pill"><span class="live-dot" aria-hidden="true"></span>Live</span>
        </div>
        <p class="top-deals-subtitle">Powered by BlueGemBot™</p>
      </div>

      <div class="content-wrapper" id="top-ten-deals-wrapper">
        <table id="top-ten-deals-table">

        <thead>
          <tr>
            <th>#</th>
            <th></th>
            <th>Item</th>
            <th>Condition</th>
            <th>Base price</th>
            <th>Deal price</th>
            <th>Discount</th>
            <th>Spotted</th>
          </tr>
        </thead>

          <tbody>
            <template v-if="isLoadingDeals">
              <tr v-for="n in 10" :key="`skeleton-${n}`" class="skeleton-row" aria-hidden="true">
                <td v-for="cell in 8" :key="cell"><span class="skeleton-bar"></span></td>
              </tr>
            </template>

            <template v-else>
              <tr
                v-for="(deal, index) in topDeals"
                :key="`${deal.source}-${deal.externalId}`"
                class="top-deal-row stagger-item"
                :style="{ '--reveal-index': index }"
                role="link"
                tabindex="0"
                @click="openDeal(deal.itemUrl)"
                @keydown.enter.prevent="openDeal(deal.itemUrl)"
                @keydown.space.prevent="openDeal(deal.itemUrl)"
              >
                <td data-label="Rank">
                  <span class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
                </td>

                <td data-label="Item">
                  <a
                    :href="deal.itemUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.prevent.stop="openDeal(deal.itemUrl)"
                  >
                    <img
                      :src="deal.imageUrl || skinPlaceholder"
                      @error="onImageError"
                      :alt="deal.name"
                      class="top-ten-deal-item-image"
                    >
                  </a>
                </td>

                <td data-label="Skin">
                  <a
                    :href="deal.itemUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.prevent.stop="openDeal(deal.itemUrl)"
                  >
                    {{ deal.name }}
                  </a>
                  <span class="deal-source" :class="deal.source.toLowerCase()">{{ deal.source }}</span>
                </td>

                <td data-label="Condition">
                  <span class="condition-chip">{{ getConditionFromFloat(deal.float) }}</span>
                </td>

                <td data-label="Base Price">
                  <span class="base-price">{{ formatPrice(deal.itemPrice) }}</span>
                </td>

                <td data-label="Deal Price">
                  <span class="deal-price-stack">
                    <span class="deal-price">{{ formatPrice(deal.salePrice) }}</span>
                    <span v-if="formatSavings(deal)" class="deal-savings">{{ formatSavings(deal) }}</span>
                  </span>
                </td>

                <td data-label="Discount">
                  <span class="discount-pill" :class="getDiscountHeatClass(deal.discountPercentage)">
                    <span v-if="getDiscountHeatClass(deal.discountPercentage) === 'heat-blazing'" aria-hidden="true">🔥</span>
                    {{ formatDiscount(deal.discountPercentage) }}
                  </span>
                </td>

                <td data-label="Date">{{ formatDealDate(deal.timestamp) }}</td>
              </tr>

              <tr v-if="topDeals.length === 0" class="empty-deals-row">
                <td colspan="8">
                  <span class="empty-deals-message">💤 No deals available right now — check back soon.</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <section id="testimonials" ref="testimonials" class="fade-section">
      <div class="content-wrapper">
        <h2 class="testimonial-title">Words from our subscribers</h2>
        <div class="testimonial-grid">
          <div class="testimonial-card stagger-item" style="--reveal-index: 0">
            <p class="testimonial-text">"This service has completely transformed the way I snipe deals. <br> The efficiency gains are remarkable."</p>
            <p class="testimonial-author">- @OG_MUDBONE69_ | BlueGemBot subscriber</p>
          </div>
          <div class="testimonial-card stagger-item" style="--reveal-index: 1">
            <p class="testimonial-text">"Setting up my account was smooth, and the notifications are immediate. Highly recommended!"</p>
            <p class="testimonial-author">- @lars2786 | BlueGemBot subscriber</p>
          </div>
        </div>
      </div>
    </section>

    <section id="socials" ref="socials" class="fade-section">
      <div class="content-wrapper">
        <h2>Get started with BlueGemBot for free</h2>
        <div class="social-links">
          <router-link to="/register" class="social-link register-cta">
            <span>Create your account</span>
          </router-link>
          <a href="https://discord.com/invite/kWGfK6St4m" class="social-link discord" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon :icon="['fab', 'discord']" class="social-icon" />
            <span>Join our Discord</span>
          </a>
          <a href="https://www.youtube.com/@muxeyy" class="social-link youtube" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon :icon="['fab', 'youtube']" class="social-icon" />
            <span>Watch on YouTube</span>
          </a>
        </div>
      </div>
    </section>

  </div>
  <footer id="footer" class="footer-section">
    <div class="content-wrapper">
      <div class="footer-content">
        <div class="footer-column">
          <h4>BlueGemBot</h4>
          <p>BlueGemBot is a CS2 skin listing tracker for Skinport and CSFloat, built for blue gem searches, fast alerts, and profitable deal discovery.</p>
          <p class="api-disclaimer">🔗 Connects to publicly available APIs - no scraping or automated website actions</p>
        </div>

        <div class="footer-column">
          <h4>Legal</h4>
          <ul class="footer-links">
            <li><router-link to="/TOS">Terms of Service</router-link></li>
            <li><router-link to="/privacy">Privacy Policy</router-link></li>
            <li><router-link to="/refunds">Refund Policy</router-link></li>
            <li><router-link to="/cancellation">Cancellation Policy</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4>Customer Support</h4>
          <div class="support-info">
            <div class="support-item">
              <span class="support-icon">📧</span>
              <div>
                <strong>Email Support</strong>
                <a href="mailto:bluegembot@gmail.com" class="support-email">bluegembot@gmail.com</a>
              </div>
            </div>
            <div class="support-item">
              <span class="support-icon">💬</span>
              <div>
                <strong>Discord Support</strong>
                <a href="https://discord.gg/RtV4zggY26" target="_blank" class="support-link">Create a ticket</a>
              </div>
            </div>
            <div class="business-hours">
              <small>🕒 Response usually within 24 hours on work days</small>
            </div>
          </div>
        </div>

        <div class="footer-column">
          <h4>Connect</h4>
          <div class="footer-socials">
            <a href="https://discord.com/invite/kWGfK6St4m" target="_blank" rel="noopener noreferrer" title="Join Discord">
              <font-awesome-icon :icon="['fab', 'discord']" />
            </a>
            <a href="https://www.youtube.com/@muxeyy" target="_blank" rel="noopener noreferrer" title="YouTube Channel">
              <font-awesome-icon :icon="['fab', 'youtube']" />
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 BlueGemBot. All rights reserved.</p>
        <p class="disclaimer">BlueGemBot connects to publicly available APIs and does not perform scraping or automated actions on websites.</p>
        <p class="trademark-disclaimer">BlueGemBot is not affiliated with Skinport GmbH or CSFloat. Skinport is a trademark of Skinport GmbH.</p>
        <p class="trademark-disclaimer">BlueGemBot is not affiliated with Valve corp / Steam.</p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import './LandingPage.css';
import { initLandingPage } from './LandingPage';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default defineComponent({
  name: 'LandingPage',
  components: {FontAwesomeIcon},
  setup() {
    return initLandingPage();
  }
});
</script>
