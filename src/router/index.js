import { createRouter, createWebHistory } from 'vue-router'
import PageTombstones from '../components/PageTombstones.vue'
import PageSettlements from '../components/PageSettlements.vue'
import PageAbout from '../components/PageAbout.vue'


const routes = [
    {
        path: '/stones',
        component: PageTombstones,
    },
    {
        path: '/settlements',
        component: PageSettlements,
    },
    {
        path: '/about',
        component: PageAbout,
    },
    {
        path: '/',
        redirect: '/stones',
    },
]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
});

export default router;
