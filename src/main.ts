

import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';

const app = createApp(App)

app.use(router)

app.mount('#app')
serviceWorkerRegistration.register(undefined); 