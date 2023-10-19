<template>
    <div  v-if="!!this.newFiltersValues[0]?.attrName">
        <div
             v-for="(filter, f) of filters" :key="f" class="filter-block">
            <div class="label-placeholder">
                <label for="filter_`${f}`">{{ filter.title }} : </label>
            </div>
            <div class="filter-placeholder">
                <template v-if="filter.type === 'input'">
                    <input id="filter_`${f}`" v-model="newFiltersValues[f].value" style="width: 200px"
                           @change="$emit('changeFiltersValues', newFiltersValues)"
                           @click="$emit('changeFiltersValues', newFiltersValues)"
                    >
                </template>
                <template v-if="filter.type === 'dropdown'">
                    <select id="filter_`${f}`" v-model="newFiltersValues[f].value" style="width: 200px"
                            @change="$emit('changeFiltersValues', newFiltersValues)">
                        <option v-bind:value="null">
                            (все)
                        </option>
                        <option v-for="(value, i) of filter.listValues" v-bind:value="value" :key="i">
                            {{ value }}
                        </option>
                    </select>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        filters: Array
    },
    emits: ['changeFiltersValues'],
    data() {
        return {
            newFiltersValues: [],
        }
    },
    computed: {},
    methods: {
        initFiltersValues() {
            this.newFiltersValues = this.filters.map((item) => {
                return {attrName: item.attrName, type: item.type, value: null}
            });
        },
    },
    mounted() {
        this.initFiltersValues();
    },
}
</script>

<style lang="scss">
.filter-block {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    //padding: 5px;
}
.label-placeholder {
    width: 150px;
    height: auto;

}
.filter-placeholder {
    width: auto;
    height: auto;

}
</style>
