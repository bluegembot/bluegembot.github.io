<template>
  <div>
    <section id="hero" ref="hero">
      <div class="content-wrapper hero-content">
        <h1>Transform the way you snipe CS skins</h1>
        <p>BlueGemBot: the free, instant and customizable Skinport listing tracker</p>
      </div>
    </section>

    <section id="features" ref="features" class="fade-section">
      <div class="content-wrapper">
        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Experience unprecedented speed and efficiency with our discord bot, and automatically open listings instantly with the integrated auto-opener.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h3>Secure by Design</h3>
            <p>Login and registration tokens are all managed through your discord DM's with BlueGemBot, eliminating the need for passwords and 3rd party logins.</p>
          </div>
          <div class="feature-card">
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

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Add icons to library
library.add(faDiscord, faYoutube)

export default {
  name: 'LandingPage',
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      formData: {
        name: '',
        email: '',
        message: ''
      },
      observers: []
    }
  },
  mounted() {
    // Create intersection observers for each section
    const sections = ['features', 'video', 'testimonials', 'socials'];

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    sections.forEach(sectionId => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            // Optionally unobserve after animation
            // observer.unobserve(entry.target);
          } else {
            // Remove the class when section is not in view
            entry.target.classList.remove('fade-in');
          }
        });
      }, observerOptions);

      const section = this.$refs[sectionId];
      if (section) {
        observer.observe(section);
        this.observers.push(observer);
      }
    });
  },
  beforeDestroy() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
  }
}
</script>

<style scoped>
:root {
  --accent-color: #2ed1e1;
  --bg-dark: #121212;
  --bg-darker: #0a0a0a;
  --text-light: #ffffff;
  --text-gray: #a0a0a0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-light);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-color);
}

.nav-links a:hover {
  color: var(--accent-color);
}

section {
  min-height:35vh;
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-wrapper {
  max-width: 2000px;
  width: 100%;
  margin: 0 auto;
}

#hero {
  background-color: var(--bg-darker);
  text-align: center;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.5rem;
  color: var(--text-gray);
  margin-bottom: 2rem;
}

.logo-circle {
  display: flex;
  justify-content: center;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.feature-card {
  background-color: var(--bg-darker);
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
}

.feature-card p {
  color: var(--text-gray);
}

/* Video section styles */
#video {
  background-color: var(--bg-dark);
  text-align: center;
}

#video h2 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: var(--text-light);
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.video-container iframe {
  display: block;
  width: 100%;
  border-radius: 12px;
}

#testimonials {
  background-color: var(--bg-darker);
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background-color: var(--bg-dark);
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid var(--accent-color);
}

.testimonial-text {
  font-style: italic;
  margin-bottom: 1rem;
}

.testimonial-author {
  color: var(--accent-color);
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 1rem;
  background-color: var(--bg-darker);
  border: 1px solid var(--text-gray);
  border-radius: 8px;
  color: var(--text-light);
  margin-top: 0.5rem;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 3rem;
  }

  .hero-content p {
    font-size: 1.2rem;
  }

  .video-container {
    max-width: 100%;
    padding: 0 1rem;
  }

  .video-container iframe {
    height: 300px;
  }
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.discord{
  background-color: #7289da;
}


.youtube{
  background-color: 	#FF0000;
}

.social-link:hover {
  transform: translateY(-2px);
  background-color: #3a3a3a;
}

.social-icon {
  width: 24px;
  height: 24px;
}

#socials h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 1920px;
  max-height: 1080px;
  margin: 0 auto;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

.testimonial-card{
  border: 2px solid #2ed1e1
}

.testimonial-title{
  margin-bottom: 10px;
  justify-self: center;
}

.fade-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 1.5s ease-out, transform 1.5s ease-out;
  will-change: opacity, transform;
}

.fade-section.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* Rest of your existing styles remain the same */
:root {
  --accent-color: #2ed1e1;
  --bg-dark: #121212;
  --bg-darker: #0a0a0a;
  --text-light: #ffffff;
  --text-gray: #a0a0a0;
}
</style>