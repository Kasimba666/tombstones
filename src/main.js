import "bootstrap/dist/css/bootstrap.css"
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "bootstrap/dist/js/bootstrap.js"

// createApp(App).mount('#app')


const app = createApp(App)
app
    .use(router)
    .use(store)
    .mount('#app')
