<template>
  <div v-if="!!this.newFiltersValues[0]?.attrName">
    <div class="my-select-block"
         v-for="(filter, f) of filters" :key="f">
      <label for="filter_`${f}`">{{ filter.title }} : </label>
      <template v-if="filter.type === 'input'">
        <input id="filter_`${f}`" v-model="newFiltersValues[f].value"
               @change="$emit('changeFiltersValues', newFiltersValues)"
               @click="$emit('changeFiltersValues', newFiltersValues)"
        >
      </template>
      <template v-if="filter.type === 'dropdown'">
        <select id="filter_`${f}`" v-model="newFiltersValues[f].value"
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
    <div>
<!--      {{ newFiltersValues }}-->
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

</style>
