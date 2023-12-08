<template>
  <div class="objs-cards" v-if="listMode === 'cards'">
    <template v-if="!!rows && rows.length>0">
      <div class="obj-card"
           v-for="(row, r) of rows" :key="r"
           @click="setCurrentRow(row)">
        <div :class="{current: isCurrent(row)}">
        </div>
        <template v-if="!!cols && cols.length>0">
          <div class="obj-card-element"
               :class="{title: title.attrName === 'name'}"
               :style="{fontWeight: title.attrName === 'name' ? 'bold' : 'normal'}"
               v-for="(title, i) of cols" :key="i"
          >
            <div v-if="!!arrToString(row[title.attrName])">
              {{ title.attrName === 'name' ? '' : title.titleName }}
              {{ title.attrName === 'name' ? '' : ': ' }}
              {{ arrToString(row[title.attrName]) }}
            </div>
          </div>
        </template>
      </div>
    </template>

  </div>
  <div class="objs-table" v-if="listMode === 'table'">
    <div class="obj-title">
      <div class="obj-cell title"
           :class="{right: (i === cols.length-1)}"
           :style="{width:  Math.round((title.colSize / sumSize) * 100) + '%' }"
           v-for="(title, i) of cols" :key="i">
        {{ title.titleName }}
      </div>
    </div>
    <template v-if="!!rows && rows.length>0">
      <div class="obj-row"
           :class="{last: (r === rows.length-1)}"
           v-for="(row, r) of rows" :key="r"
           :style="{backgroundColor: (r%2 === 1) ? 'hsl(0, 0%, 83%, 0.3)' : 'none'}"
           @click="setCurrentRow(row)">
        <div :class="{current: isCurrent(row)}">
        </div>
        <template v-if="!!cols && cols.length>0">
          <div class="obj-cell cell-row"
               :class="{right: (i === cols.length-1)}"
               :style="{width:  Math.round((title.colSize / sumSize) * 100) + '%' }"
               v-for="(title, i) of cols" :key="i"
          >
            {{ arrToString(row[title.attrName]) }}
          </div>
        </template>
      </div>
    </template>
  </div>
  <div class="objs-cards">
  </div>

</template>

<script>
export default {
  components: {},
  props: {
    currentRow: Object,
    rows: Array,
    cols: Array,
    listMode: String,
  },
  emits: ['clickRow'],
  data() {
    return {}
  },
  computed: {
    sumSize() {
      if (!!this.cols) {
        return this.cols.reduce((sum, item) => {
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
      //передать значение строки наверх
      this.$emit('clickRow', row);
    },
    isCurrent(row) {
      return (!!this.currentRow && (JSON.stringify(row) === JSON.stringify(this.currentRow)));
    },
    cardText(row) {
      if (!!this.cols && this.cols.length > 0) return '';
      let newCardText = '';
      return newCardText;
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
  height: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  border: 1px solid hsla(0, 0%, 50%, 0.8);
}

.obj-title {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  border-bottom: 1px solid hsla(0, 0%, 50%, 0.6);
  background-color: hsl(0, 0%, 83%, 0.3);

}

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

  &.chosen {
    background-color: rgba(0, 140, 186, 0.5);
  }

  &.last {
    border-bottom: none;
  }

}

.current {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 140, 186, 0.5);
}


.obj-cell {
  position: relative;
  //width: 100px;
  height: auto;
  //min-width: 50px;
  display: flex;

  padding: 2px;
  flex: 1 1 auto;

  border-right: 1px solid hsla(0, 0%, 50%, 0.8);

  &.title {
    justify-content: center;
    align-items: center;
    text-align: center;
    word-break: break-word;
    font-weight: bold;
  }

  &.cell-row {
    justify-content: flex-start;
    align-items: flex-start;
    text-align: left;
    word-break: break-all;
  }

  &.right {
    border-right: none;
  }
}

.objs-cards {
  position: relative;
  width: 100%;
  height: auto;
  min-width: 50px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 2px;
  flex: 1 1 auto;

  .obj-card {
    position: relative;
    width: 100%;
    height: auto;
    min-width: 50px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    flex: 1 1 auto;
    border: 1px solid gray;
    //padding: 3px;
    .obj-card-element {
      &.title {
        background-color: hsla(180, 100%, 25%, 0.1);
      }
    }

    &:hover {
      box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
    }

    &.chosen {
      background-color: rgba(0, 140, 186, 0.5);
    }
  }

}

</style>
