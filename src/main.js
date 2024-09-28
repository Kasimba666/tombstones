import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router/router.js'
import store from './store/mainStore.js'
import ElementPlus from 'element-plus'
import OpenLayersMap from "vue3-openlayers";
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app
    .use(ElementPlus)
    .use(router)
    .use(store)
    .use(OpenLayersMap)
    .mount('#app')
