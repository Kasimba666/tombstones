<template>
    <div  v-if="!!filtersValues[0]">
        <div
             v-for="(filter, f) of filters" :key="f" class="filter-block">
            <div class="label-placeholder">
                <label for="filter_`${f}`">{{ filter.title }} : </label>
            </div>
            <div class="filter-placeholder">
                <template v-if="filter.type === 'input'">
                    <input id="filter_`${f}`" v-model="filtersValues[f].value" style="width: 200px"
                           @change="$emit('onSetFiltersValues', filtersValues)"
                           @click="$emit('onSetFiltersValues', filtersValues)"
                    >
                </template>
                <template v-if="filter.type === 'dropdown'">
                    <select id="filter_`${f}`" v-model="filtersValues[f].value" style="width: 200px"
                            @change="$emit('onSetFiltersValues', filtersValues)">
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
    emits: ['onSetFiltersValues'],
    data() {
        return {
            filtersValues: [],
        }
    },
    computed: {},
    methods: {
      initFiltersValues() {
        if (!!this.filters) {
          this.filtersValues = this.filters.map((item) => {
            return {attrName: item.attrName, type: item.type, value: null}
          });
          // console.log('newFiltersValues: ', this.filtersValues);
        }
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
