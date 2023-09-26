import SettlementsJsonFile from '@/data/bolgar_settlements.json';
export const settlementsModule = {
    state: () => ({
        raw_settlements: [],
        settlements: [],
        crs: null,
        test: 'test',
    }),
    getters:
    {
    },
    mutations: {
        setRAWSettlements (state, raw_settlements) {
            state.raw_settlements = raw_settlements;
        },
        setSettlements (state, settlements) {
            state.settlements = settlements;
        },
        setCRS (state, crs) {
            state.crs = crs;
        },
    },
    actions: {
        loadSettlements({state, commit}) {
            try {
                const response = SettlementsJsonFile;
                commit('setRAWSettlements', response);
                commit('setSettlements', response.features);
                commit('setCRS', response.crs);
                console.log(state.test);
            } catch (e) {
                alert('Ошибка загрузки файла');
            }
        },
    },
    namespaced: true,
}
