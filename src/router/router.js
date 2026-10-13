import {createRouter, createWebHistory} from 'vue-router';
import PgAbout from '@/views/PgAbout.vue';
import PgPublications from '@/views/PgPublications.vue';
import PgNotFound from '@/views/PgNotFound.vue';
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
    {
        name: 'PgPublications',
        path: '/publications',
        component: PgPublications,
    },
    {
        //открытие папки с pdf в браузере (без имени файла) — ведём на страницу публикаций
        path: '/assets/publications',
        redirect: {name: 'PgPublications'},
    },
    {
        //catch-all: любая несуществующая страница вместо пустого экрана и warn в консоли
        name: 'PgNotFound',
        path: '/:pathMatch(.*)*',
        component: PgNotFound,
    },

]

const router = createRouter({
    routes,
    history: createWebHistory(import.meta.env.BASE_URL),
    //восстановление позиции прокрутки при переходах "назад"/"вперёд"
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || {top: 0};
    },
});

export default router;
