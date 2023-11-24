import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

const screenBreakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
};
export default new Vuex.Store({
    state: {
        screenBreakpoints,
        screen: {
            width: 1200,
            height: 900,
            type: 'lg',
        },
    },
    mutations: {
        setScreen(state, v){
            state.screen = v;
            console.log(v);
        },
    },
    actions: {
    },
    getters: {
        getScreen(state) {
            return state.screen;
        },
        getScreenBreakpoints(state) {
            return state.screenBreakpoints;
        },

    },
    modules: {
    },
    plugins: [createPersistedState()],
    namespaced: true,
})
