<template>
  <div v-if="!!this.myFiltersValues[0]?.attrName">
    <div class="my-select-block"
         v-for="(filter, f) of filters" :key="f">
      <label for="filter_`${f}`">{{ filter.title }} : </label>
      <select id="filter_`${f}`" v-model="myFiltersValues[f].value">
        <option v-for="(value, i) of filter.listValues" :value="value" :key="i">
          {{ value }}
        </option>
      </select>
    </div>
    <div>
      {{ myFiltersValues }}
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    filters: Array
  },
  // emits: [''],
  data() {
    return {
      myFiltersValues: [],
    }
  },
  computed: {},
  methods: {
    initFiltersValues() {
      this.myFiltersValues = this.filters.map((item) => {
        return {attrName: item.attrName, value: null}
      });
    },
  },
  mounted() {
    this.initFiltersValues();
  },
}
</script>

<style lang="scss">

</style>
