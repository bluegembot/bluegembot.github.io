<template>
  <div>
    <Navbar
        :rightItems="[
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' }
      ]"
    />
    <section id="hero" ref="hero">
      <div class="content-wrapper hero-content">
        <h1>Transform the way you snipe CS skins</h1>
        <p>BlueGemBot: the free, instant and customizable Skinport & CSFloat listing tracker</p>
      </div>
    </section>

    <section id="features" ref="features" class="fade-section">
      <div class="content-wrapper">
        <div class="features">
          <div class="feature-card fast">
            <div class="feature-icon">⚡ Lightning Fast</div>
            <p>Experience unprecedented speed and efficiency with our discord bot, and automatically open listings instantly with the integrated auto-opener.</p>
          </div>
          <div class="feature-card secure">
            <div class="feature-icon">🛡️ Secure by Design</div>
            <p>Login and registration tokens are all managed through your discord DM's with BlueGemBot, eliminating the need for passwords and 3rd party logins.</p>
          </div>
          <div class="feature-card profitable">
            <div class="feature-icon">💰 Profitable</div>
            <p>Combine the speed of BlueGemBot with your skin knowledge to cherry pick profitable deals!</p>
          </div>
        </div>
      </div>
    </section>

    <section ref="video" class="fade-section top-deals-section">      
      <div class="top-deals-heading">
        <h2 class="top-deals-title">Today's top 10 deals</h2>
        <p class="top-deals-subtitle">Powered by BlueGemBot™</p>
      </div>

      <div class="content-wrapper" id="top-ten-deals-wrapper">
        <table id="top-ten-deals-table">

        <thead>
          <tr>
            <th></th>
            <th></th>
            <th> </th>
            <th>CONDITION</th>
            <th>BASE PRICE</th>
            <th>DEAL PRICE</th>
            <th>DISCOUNT %</th>
            <th></th>
          </tr>
        </thead>

          <tbody>
            <tr
              v-for="(deal, index) in topDeals"
              :key="`${deal.source}-${deal.externalId}`"
              class="top-deal-row"
              role="link"
              tabindex="0"
              @click="openDeal(deal.itemUrl)"
              @keydown.enter.prevent="openDeal(deal.itemUrl)"
              @keydown.space.prevent="openDeal(deal.itemUrl)"
            >
              <td data-label="Rank">#{{ index + 1 }}</td>

              <td data-label="Item">
                <a
                  :href="deal.itemUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.prevent.stop="openDeal(deal.itemUrl)"
                >
                  <img
                    v-if="deal.imageUrl"
                    :src="deal.imageUrl"
                    :alt="deal.name"
                    class="top-ten-deal-item-image"
                  >
                  <span v-else class="top-ten-deal-item-image top-ten-deal-item-icon" aria-hidden="true">
                    <i class="fa-solid fa-image"></i>
                  </span>
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
              </td>

              <td data-label="Condition">{{ getConditionFromFloat(deal.float) }}</td>
              <td data-label="Base Price">{{ formatPrice(deal.itemPrice) }}</td>
              <td data-label="Deal Price">{{ formatPrice(deal.salePrice) }}</td>
              <td data-label="Discount">{{ formatDiscount(deal.discountPercentage) }}</td>
              <td data-label="Date">{{ formatDealDate(deal.timestamp) }}</td>
            </tr>

            <tr v-if="topDeals.length === 0">
              <td colspan="8">No deals available right now.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="testimonials" ref="testimonials" class="fade-section">
      <div class="content-wrapper">
        <h1 class="testimonial-title">Words from our subscribers</h1>
        <div class="testimonial-grid">
          <div class="testimonial-card">
            <p class="testimonial-text">"This service has completely transformed the way I snipe deals. <br> The efficiency gains are remarkable."</p>
            <p class="testimonial-author">- @OG_MUDBONE69_ | BlueGemBot subscriber</p>
          </div>
          <div class="testimonial-card">
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
          <p>Transform the way you snipe CS skins with our free, instant and customizable listing tracker.</p>
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
