<template>
  <div>
    <div class="objs-table">
      <div class="obj-row obj-title">
        <div class="obj-cell" :class="{right: (i === titles.length-1)}"
             v-for="(title, i) of titles" :key="i">
          {{ title.titleName }}
        </div>
      </div>
      <template v-if="!!rows && rows.length>0">
        <div class="obj-row"
             :class="{last: (r == rows.length-1)}"
             v-for="(row, r) of rows" :key="r"
             :style="{backgroundColor: (r%2 === 1) ? 'hsl(0, 0%, 83%, 0.3)' : 'none'}"
             @click="setCurrentRow(row)">
          <div :class="{current: isCurrent(row)}">
          </div>
          <template v-if="!!titles && titles.length>0">
            <div class="obj-cell" :class="{right: (i === titles.length-1)}"
                 v-for="(title, i) of titles" :key="i"
            >
              {{ arrToString(row[title.attrName]) }}
            </div>
          </template>

        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    rows: Array,
    titles: Array,
  },
  emits: ['clickRow'],
  data() {
    return {
      currentRow: null,
    }
  },
  computed: {
    sumSize() {
      if (!!this.titles) {
        return this.titles.reduce((sum, item) => {
          return sum + item.colSize
        }, 0)
      }
    },
  },
  methods: {
    arrToString(arr) {
      let r = '';
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          r += item.slice(0, 1).toUpperCase() + item.slice(1) + ', '
        });
        r = r.slice(0, -2);
      } else {
        r = arr;
      }
      return r;
    },
    setCurrentRow(row) {
      this.currentRow = row;
      //передать значение строки наверх
      this.$emit('clickRow', this.currentRow);
    },
    isCurrent(row)
    {
      return (!!this.currentRow && (JSON.stringify(row) === JSON.stringify(this.currentRow)));
    },
  },
  mounted() {
  },
}
</script>

<style lang="scss">
.objs-table {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  border: 1px solid hsla(0, 0%, 50%, 0.8);


  .obj-row {
    position: relative;
    width: 100%;
    height: auto;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    border-bottom: 1px solid hsla(0, 0%, 50%, 0.6);
    cursor: pointer;

    &:hover {
      box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
    }

    &.obj-title {
      font-weight: bold;
      background-color: hsl(0, 0%, 83%, 0.3);
      text-align: center;
      word-break: break-all;
    }

    &.chosen {
      background-color: rgba(0, 140, 186, 0.5);
    }

    &.last {
      border-bottom: none;
    }

    .current {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(0, 140, 186, 0.5);
    }

    .obj-cell {
      position: relative;
      width: 100px;
      height: auto;
      padding: 2px;
      flex: 1 1 auto;
      min-width: 50px;
      word-break: break-all;
      border-right: 1px solid hsla(0, 0%, 50%, 0.8);
      text-align: left;

      &.right {
        border-right: none;
      }
    }
  }
}
</style>
