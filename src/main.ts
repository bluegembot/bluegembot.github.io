import './assets/style/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Navbar from "@/components/General/Navbar.vue"
import './assets/style/main.css'
import './assets/style/dark-mode.css'  // Add this line

const app = createApp(App)

// Register components before mounting
app.component('Navbar', Navbar) // Note: Component name should be 'Navbar', not 'navbar'
app.use(router)

// Mount the app last
app.mount('#app')