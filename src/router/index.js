import { createRouter, createWebHistory } from 'vue-router'
import PageTombstones from '../components/PageTombstones.vue'
import PageSettlements from '../components/PageSettlements.vue'
import PageAbout from '../components/PageAbout.vue'


const routes = [
    {
        path: '/settlements',
        component: PageSettlements,
    },
    {
        path: '/stones',
        component: PageTombstones,
    },
    {
        path: '/about',
        component: PageAbout,
    },
    {
        path: '/',
        redirect: '/settlements',
    },
]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
});

export default router;
