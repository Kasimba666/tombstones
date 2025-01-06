import {createRouter, createWebHistory} from 'vue-router';
import PgAbout from '@/views/PgAbout.vue';
import ObjsDetails from '@/components/spatialObjects/ObjsDetails.vue';
import ObjsFiltersAndList from '@/components/spatialObjects/ObjsFiltersAndList.vue';

const routes = [
    {
        name: 'ObjsFiltersAndList',
        path: '/list',
        component: ObjsFiltersAndList,
    },
    {
        name: 'ObjsDetails',
        path: '/details/:id?',
        component: ObjsDetails,
    },
    {
        path: '/',
        redirect: {name: 'ObjsFiltersAndList'},
    },
    {
        name: 'PgAbout',
        path: '/about',
        component: PgAbout,
    },

]

const router = createRouter({
    routes,
    history: createWebHistory(import.meta.env.BASE_URL)
});

export default router;
