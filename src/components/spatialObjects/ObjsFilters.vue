<template>
  <div class="ObjsFilters" v-if="filtersValues.length>0" :class="{heightLimited: this.screen.type === 'xl'}">
    <div v-for="(filter, f) of filters" :key="f" class="filter-block">
      <div class="label-placeholder">
        <label for="filter_`${f}`">{{ filter.title }}: </label>
      </div>
      <div class="filter-placeholder">
        <template v-if="filter.type === 'input'">
          <el-input id="filter_`${f}`"
              v-model="filtersValues[f].value"
              style="width: 160px"
              size="small"
              @change="onChangeFiltersValues"
              @input="onChangeFiltersValues"
          />
        </template>
        <template v-if="filter.type === 'select'">
          <el-select id="filter_`${f}`"
              v-model="filtersValues[f].value"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              placeholder="(все)"
              size="small"
              style="width: 160px"
              @change="onChangeFiltersValues"
              :max-collapse-tags="1"
          >
            <el-option
                v-for="(item, i) of valuesDependentOnParent(filter)"
                :key="i"
                :label="item.value"
                :value="item.value"
            />
          </el-select>
        </template>
        <template v-if="filter.type === 'range'">
<!--          {{filter.listValues[0]}}-{{filter.listValues[1]}} : {{filtersValues[f].value.notNull}} {{filtersValues[f].value.range}}-->
            <el-checkbox v-model="filtersValues[f].value.notNull" label="учитывать" size="small" @change="onChangeFiltersValues"/>
          <div class="input-items">
              <div>
                <el-input-number
                    v-model="filtersValues[f].value.range[0]"
                    style="width: 80px"
                    size="small"
                    controls-position="right"
                    :min="filter.listValues[0]"
                    :max="filter.listValues[1]"
                    :disabled="!filtersValues[f].value.notNull"
                    @change="onChangeFiltersValues"
                />
                <el-input-number
                    v-model="filtersValues[f].value.range[1]"
                    style="width: 80px"
                    size="small"
                    controls-position="right"
                    :min="filter.listValues[0]"
                    :max="filter.listValues[1]"
                    :disabled="!filtersValues[f].value.notNull"
                    @change="onChangeFiltersValues"
                />
              </div>
          <el-slider
              v-model="filtersValues[f].value.range"
              range
              size="small"
              :min="filter.listValues[0]"
              :max="filter.listValues[1]"
              :disabled="!filtersValues[f].value.notNull"
              @change="onChangeFiltersValues"
          />
          </div>
        </template>
      </div>
    </div>
  </div>

</template>

<script>

import {useScreen} from "@/composables/useScreen";
import {mapMutations, mapState} from "vuex";

export default {
  name: 'ObjsFilters',
  components: {},
  props: {
    filtersValues: Array,
    filters: Array,
  },
  emits: ['update:filtersValues', 'onChangeFiltersValues'],
  data() {
    return {
    }
  },
  setup() {
    const {screen, screenBreakpoints} = useScreen();
    return {
      screen,
      screenBreakpoints
    }
  },
  computed: {
  },
  methods: {

    valuesDependentOnParent(f) {
      let parentFv = this.filtersValues.filter((fV) => {if (fV.attrName === f.attrParent) {return fV} })?.[0];
      let parentValue = parentFv ? parentFv.value : null;
      let allSelected = !parentValue || parentValue.length === 0;

      if (f.attrParent != null && !allSelected) {
        let newListValues = f.listValues.filter((v) => {
          return parentValue.includes(v.parentValue);
        });
        let filterFv = this.filtersValues.filter((fV) => {if (fV.attrName === f.attrName) {return fV} })?.[0];
        //если текущее значение фильтра не пусто, но не попадает в диапазон допустимых значений из parent, то очистить
        if (filterFv && filterFv.value.length > 0) {
          let validValues = newListValues.map((v)=>{return v.value});
          let newVal = filterFv.value.filter(v => validValues.includes(v));
          if (newVal.length !== filterFv.value.length) {
            filterFv.value = newVal;
          }
        }
        return newListValues.length > 0 ? newListValues.sort((a, b) => a['value'] > b['value'] ? 1 : -1) : [];
      } else {
        return f.listValues.length > 0 ? f.listValues.sort((a, b) => a['value'] > b['value'] ? 1 : -1) : [];
      }
    },

    onChangeFiltersValues() {
      this.$emit('update:filtersValues');
      this.$emit('onChangeFiltersValues');
    },
  },
  mounted() {
  },
}
</script>

<style lang="scss">
.ObjsFilters {
  width: 100%;
  height: auto;
  padding: 5px;
  display: flex;
  flex-flow: column wrap;
  justify-content: start;

  &.heightLimited {
    height: 420px;
  };

  .filter-block {
    width: 270px;
    display: flex;
    flex-flow: row wrap;
    justify-content: left;
    gap: 5px;
    padding: 3px;

    .label-placeholder {
      width: 90px;
      height: auto;
      text-align: left;
      display: flex;
      align-items: center;
    }

    .filter-placeholder {
      width: 160px;
      height: auto;
    }
  }

  //input, select {
  //  //width: 150px;
  //  background-color: hsl(180, 100%, 25%, 0.08);
  //  width: 100%;
  //  cursor: pointer;
  //}

}

</style>