<template>
  <div v-if="!!filtersValues[0]" class="objs-filters">
    <div v-for="(filter, f) of filters" :key="f" class="filter-block">
      <div class="label-placeholder">
        <label for="filter_`${f}`">{{ filter.title }}: </label>
      </div>
      <div class="filter-placeholder">
        <template v-if="filter.type === 'input'">
          <input id="filter_`${f}`" v-model="filtersValues[f].value"
                 @change="$emit('onSetFiltersValues', filtersValues)"
                 @click="$emit('onSetFiltersValues', filtersValues)"
          >
        </template>
        <template v-if="filter.type === 'dropdown'">
          <select id="filter_`${f}`" v-model="filtersValues[f].value"
                  @change="$emit('onSetFiltersValues', filtersValues)">
            <option :value="null">
              (все)
            </option>
            <option v-for="(item, i) of valuesDependentOnParent(filter)" :value="item.value" :key="i">
              <template v-if="true">
                {{ item.value }}
              </template>
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
  computed: {

  },
  methods: {
    initFiltersValues() {
      if (!!this.filters) {
        this.filtersValues = this.filters.map((item) => {
          return {attrName: item.attrName, type: item.type, value: null}
        });
      }
    },
    valuesDependentOnParent(f) {
      if (f.attrParent != null || this.filtersValues.filter((fV) => {if (fV.attrName === f.attrParent) {return fV} })?.[0]?.value === null) {
        let newListValues = f.listValues.filter((v) => {if (this.filtersValues.filter((fV) => { if (fV.attrName === f.attrParent) {return fV } })[0].value === v.parentValue) {return v}});
        let filterValue = this.filtersValues.filter((fV) => {if (fV.attrName === f.attrName) {return fV} })?.[0]?.value;
        //если текущее значение фильтра не null, но не попадает в диапазон допустимых значений из parent, то установить значение null
        if (filterValue != null) {
          if  (!newListValues.map((v)=>{return v.value}).includes(filterValue)) {this.filtersValues.filter((fV) => {if (fV.attrName === f.attrName) {return fV} })[0].value = null}
        }
        return newListValues != [] ? newListValues.sort((a, b) => a['value'] > b['value'] ? 1 : -1) : null;
      } else {
        return f.listValues != [] ? f.listValues.sort((a, b) => a['value'] > b['value'] ? 1 : -1) : null;
      }
    },
  },
  mounted() {
    this.initFiltersValues();
  },
}
</script>

<style lang="scss">
.objs-filters {
  width: 100%;
  padding: 10px;

  .filter-block {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: left;
    padding: 3px;

    .label-placeholder {
      width: 150px;
      height: auto;

    }

    .filter-placeholder {
      width: 200px;
      height: auto;
    }
  }

  input, select {
    width: 100%;
  }
}

</style>
