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
        <h2>See BlueGemBot in Action</h2>
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/73wglgsOsgY?si=VGzdC_sO5VubKxLu" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
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
          <a href="https://discord.gg/gCzdeGxH" class="social-link discord" target="_blank" rel="noopener noreferrer">
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