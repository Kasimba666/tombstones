import {createStore} from "vuex";
import {settlementsModule} from "@/store/settlementsModule";

export default createStore({
    modules: {
        settle: settlementsModule
    },
})
