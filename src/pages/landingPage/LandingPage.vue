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
        <p>BlueGemBot: the free, instant and customizable Skinport listing tracker</p>
      </div>
    </section>

    <section id="features" ref="features" class="fade-section">
      <div class="content-wrapper">
        <div class="features">
          <div class="feature-card fast">
            <div class="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Experience unprecedented speed and efficiency with our discord bot, and automatically open listings instantly with the integrated auto-opener.</p>
          </div>
          <div class="feature-card secure">
            <div class="feature-icon">🛡️</div>
            <h3>Secure by Design</h3>
            <p>Login and registration tokens are all managed through your discord DM's with BlueGemBot, eliminating the need for passwords and 3rd party logins.</p>
          </div>
          <div class="feature-card profitable">
            <div class="feature-icon">💰</div>
            <h3>Profitable</h3>
            <p>Combine the speed of BlueGemBot with your skin knowledge to cherry pick profitable deals!</p>
          </div>
        </div>
      </div>
    </section>

    <section id="video" ref="video" class="fade-section">
      <div class="content-wrapper">
        <h2>The latest BlueGemBot update</h2>
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/8gMYTLQiZ60?si=PaGFaB8x7IVL50mS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
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
                <a href="mailto:lucaskaas2@gmail.com" class="support-email">lucaskaas2@gmail.com</a>
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
        <p class="trademark-disclaimer">BlueGemBot is not affiliated with Skinport GmbH. Skinport is a trademark of Skinport GmbH.</p>
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
