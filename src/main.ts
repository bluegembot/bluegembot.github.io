import './assets/style/main.css'

import { createApp, provide } from 'vue'
import App from './App.vue'
import router from './router'
import { injectionKeys } from './injectionKeys'
import { AuthenticationService } from './services/AuthenticationService'

const app = createApp(App)

app.provide(injectionKeys.AuthenticationServiceKey, new AuthenticationService())

app.use(router).mount('#app')
