import './assets/style/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Navbar from "@/components/General/Navbar.vue"
import './assets/style/main.css'
import './assets/style/dark-mode.css'
import VueGtag from 'vue-gtag-next'

const app = createApp(App)

// Register components before mounting
app.component('Navbar', Navbar)
app.use(router)
app.use(VueGtag, {
    property: { id: 'G-D32T6VQQQE' }
})

// Mount the app last
app.mount('#app')