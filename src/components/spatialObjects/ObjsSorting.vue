<template>
  <div class="ObjsSorting" v-if="Object.keys(sortingValues).length>0">
    <div class="sorting-block">
      <label for="sorting" class="label-placeholder">Сортировка: </label>
      <el-select id="sorting"
                 v-model="sortingValues.attrName"
                 placeholder="Select"
                 size="small"
                 style="width: 160px"
                 @change="onChangeSortingValues"
      >
        <el-option
            v-for="item of scheme.filter(v=>v.sortable === 1)"
            :value="item.attrName"
            :label="item.title"
        />
      </el-select>
    <el-radio-group
        v-model="sortingValues.direction"
        size="small"
        @change="onChangeSortingValues"
    >
      <el-radio-button label="по возрастанию" value="asc" />
      <el-radio-button label="по убыванию" value="desc" />
    </el-radio-group>
    </div>
    <div class="count-block">
      <span class="count-label">Всего записей:</span>
      <span class="count-value">{{ totalCount }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ObjsSorting',
  components: {},
  props: {
    sortingValues: Object,
    scheme: Array,
    totalCount: Number,
  },
  emits: ['update:sortingValues', 'onChangeSortingValues'],
  data() {
    return {}
  },
  computed: {

  },
  methods: {
    onChangeSortingValues() {
      this.$emit('update:sortingValues');
      this.$emit('onChangeSortingValues');
    },
  },
  mounted() {
  },
}
</script>

<style lang="scss">
.ObjsSorting {
  width: 100%;
  height: auto;
  padding: 5px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;

  .sorting-block {
    display: flex;
    flex-flow: row wrap;
    justify-content: start;
    gap: 5px;
    padding: 3px;

    .label-placeholder {
      width: 70px;
      height: auto;
      display: flex;
      align-items: center;
    }

    .sorting-placeholder {
      width: 160px;
      height: auto;
    }
  }

  .count-block {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: bold;
    color: hsl(180, 100%, 25%);
  }

  select {
    background-color: hsl(180, 100%, 25%, 0.08);
    width: 100%;
    cursor: pointer;
  }
}
</style>
