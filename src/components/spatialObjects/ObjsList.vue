<template>
  <div class="ObjsList">
    <!-- Режим "Мозаика" (по макету) -->
    <div class="objs-mosaic" v-if="modeList === 'mosaic'">
      <template v-if="!!rows && rows.length>0">
        <div class="obj-mosaic-card"
             v-for="(row, r) of rows" :key="r"
             @click="setCurrentRow(row)">
          <div :class="{current: isCurrent(row)}">
          </div>
          <div class="obj-mosaic-img"
               :style="!!row.imgs ? {backgroundImage: `url(${row.imgs.small})`} : {}">
            <div class="obj-mosaic-img-empty" v-if="!row.imgs">Нет фото</div>
          </div>
          <div class="obj-mosaic-body">
            <div class="obj-mosaic-name">{{ row.name }}</div>
            <div class="obj-mosaic-addr">
              <span class="pin">📍</span>
              <span>{{ objAddress(row) }}</span>
            </div>
            <template v-for="(title, i) of viewCols" :key="i">
              <div class="obj-mosaic-row" v-if="hasValue(row, title)">
                <span class="label">{{ viewAttrTitle(title) }}</span>
                <span class="value">
                  <i class="obj-dot" :class="conditionClass(row, title)" v-if="!!conditionClass(row, title)"></i>
                  {{ displayValue(row, title) }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- Режим "Список" (по макету) -->
    <div class="objs-list" v-if="modeList === 'list'">
      <template v-if="!!rows && rows.length>0">
        <div class="obj-list-header">
          <div class="obj-list-col-name">Наименование</div>
          <div class="obj-list-cols">
            <div class="obj-list-col"
                 v-for="(title, i) of viewCols" :key="i"
            >{{ viewAttrTitle(title) }}</div>
          </div>
        </div>
        <div class="obj-list-rows">
          <div class="obj-list-row"
               v-for="(row, r) of rows" :key="r"
               @click="setCurrentRow(row)">
            <div :class="{current: isCurrent(row)}">
            </div>
            <div class="obj-list-thumb"
                 :style="!!row.imgs ? {backgroundImage: `url(${row.imgs.small})`} : {}">
            </div>
            <div class="obj-list-body">
              <div class="obj-list-name">{{ row.name }}</div>
              <div class="obj-list-addr">
                <span class="pin">📍</span>
                <span>{{ objAddress(row) }}</span>
              </div>
            </div>
            <div class="obj-list-meta">
              <div class="obj-list-cell" v-for="(title, i) of viewCols" :key="i">
                <span class="label">{{ viewAttrTitle(title) }}</span>
                <span class="value">
                  <i class="obj-dot" :class="conditionClass(row, title)" v-if="!!conditionClass(row, title)"></i>
                  {{ displayValue(row, title) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="objs-cards" v-if="modeList === 'cards'">
      <template v-if="!!rows && rows.length>0">
        <div class="obj-card"
             v-for="(row, r) of rows" :key="r"
             @click="setCurrentRow(row)">
          <div :class="{current: isCurrent(row)}">
          </div>
          <div class="obj-card-title">
            {{ row.name }}
          </div>
          <div class="obj-card-body">
            <template v-if="!!cols && cols.length>0">
              <div class="obj-card-image"
                   v-if="(!!row.imgs && row.imgs.small!='')"
                   :style="{backgroundImage: `url(${row.imgs.small})`}">
              </div>
              <div class="obj-card-attributes">
                <div class="obj-card-attribute"
                     v-for="(title, i) of cols" :key="i"
                >
                  <template v-if="!!arrToString(row[title.attrName] && title.attrName != 'name')">
                    {{ title.titleName }}
                    {{ true ? ': ' : '' }}
                    {{ arrToString(row[title.attrName]) }}
                  </template>
                </div>
              </div>
            </template>

          </div>
        </div>
      </template>

    </div>
    <div class="objs-table" v-if="modeList === 'table'">
      <div class="obj-title">
        <div class="obj-cell title"
             :class="{right: (i === cols.length-1)}"
             :style="{width:  Math.round((title.colSize / sumColSize) * 100) + '%' }"
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
                 :style="{width:  Math.round((title.colSize / sumColSize) * 100) + '%' }"
                 v-for="(title, i) of cols" :key="i"
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
    // currentRow: Object,
    currentID: String,
    rows: Array,
    cols: Array,
    modeList: String, // 'mosaic' - мозаика, 'list' - список, 'table' - таблица, 'cards' - прежний режим карточек
  },
  emits: ['clickRow'],
  data() {
    return {}
  },
  computed: {
    sumColSize() {
      if (!!this.cols) {
        return this.cols.reduce((sum, item) => {
          return sum + item.colSize
        }, 0)
      }
    },
    //атрибуты для режимов "Мозаика"/"Список" (по макету: Век, Год, Размеры, Состояние)
    viewCols() {
      if (!this.cols) return [];
      let preferred = ['date', 'year', 'sizes', 'save_rank'];
      return preferred
          .map((attrName) => this.cols.find((col) => col.attrName === attrName))
          .filter((col) => !!col);
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
      this.$emit('clickRow', row.id);
    },
    isCurrent(row) {
      return row.id === this.currentID;
    },
    //адрес объекта: нас. пункт, район, регион (по макету)
    objAddress(row) {
      let parts = [];
      if (!!row.local) parts.push(row.local);
      if (!!row.admin) parts.push(/район/i.test(row.admin) ? row.admin : `${row.admin} район`);
      if (!!row.subject) parts.push(row.subject);
      return parts.join(', ');
    },
    //заголовок атрибута для режимов "Мозаика"/"Список" (по макету)
    viewAttrTitle(col) {
      let overrides = {sizes: 'Размеры', save_rank: 'Состояние'};
      return overrides[col.attrName] || col.titleName;
    },
    //значение атрибута для отображения (по макету)
    displayValue(row, col) {
      let val = row[col.attrName];
      if (val == null || val === '') return '—';
      if (Array.isArray(val)) return val.length > 0 ? this.arrToString(val) : '—';
      if (col.attrName === 'date' && /^\d+$/.test('' + val)) {
        return `${this.toRoman(parseInt(val, 10))} в.`;
      }
      if (col.attrName === 'sizes' && /^\d+x\d+x\d+$/i.test('' + val)) {
        return ('' + val).split(/[xX]/).join(' × ') + ' см';
      }
      if (col.attrName === 'save_rank') {
        let n = parseInt(val, 10);
        if (!isNaN(n) && n >= 1 && n <= 5) return `${n} / 5`;
      }
      return '' + val;
    },
    //есть ли значение для отображения
    hasValue(row, col) {
      return this.displayValue(row, col) !== '—';
    },
    //класс точки состояния: obj-dot-1 ... obj-dot-5
    conditionClass(row, col) {
      if (col.attrName !== 'save_rank') return '';
      let n = parseInt(row[col.attrName], 10);
      return (!isNaN(n) && n >= 1 && n <= 5) ? `obj-dot-${n}` : '';
    },
    //число в римские цифры (по макету: 16 -> XVI в.)
    toRoman(num) {
      let digits = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let result = '';
      let rest = num;
      digits.forEach((digit) => {
        while (rest >= digit[0]) {
          result += digit[1];
          rest -= digit[0];
        }
      });
      return result;
    },


  },
  mounted() {
  },
}
</script>

<style lang="scss">
.ObjsList {
  width: 100%;
  //height: 80dvh;
  //overflow-x: scroll;
  .objs-table {
    position: relative;
    width: 100%;
    //width: 2000px;
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
    transition-duration: 0.5s;

    &:hover {
      box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
      transition-duration: 0.5s;
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
    height: auto;
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
      transition-duration: 0.5s;
      //padding: 3px;

      &:hover {
        box-shadow: 0 0 10px 3px rgba(0, 140, 186, 0.5);
        transition-duration: 0.5s;
      }

      &.chosen {
        background-color: rgba(0, 140, 186, 0.5);
      }

      .obj-card-title {
        font-weight: bold;
        background-color: hsla(180, 100%, 25%, 0.1);
        padding: 3px;
      }

      .obj-card-body {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        padding: 3px;

        .obj-card-image {
          flex: 1 1 auto;
          width: 80px;
          height: 120px;
          background-color: white;
          border-radius: 2px;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;

        }

        .obj-card-attributes {
          display: flex;
          flex-flow: column wrap;
          justify-content: flex-start;
          align-items: flex-start;
          padding: 3px;

          obj-card-attribute {
            //display: flex;
            //flex-flow: column wrap;
            //justify-content: flex-start;

          }
        }
      }

      .obj-card-element {
        &.title {
          background-color: hsla(180, 100%, 25%, 0.1);
        }
      }

    }

  }

  /* ===== Мозаика (по макету) ===== */
  .objs-mosaic {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 10px;

    .obj-mosaic-card {
      position: relative;
      min-width: 0;
      display: flex;
      flex-flow: column nowrap;
      border: 1px solid hsla(0, 0%, 0%, 0.06);
      border-radius: 6px;
      overflow: hidden;
      background-color: hsl(0, 0%, 100%, 0.96);
      box-shadow: 0 2px 8px hsla(0, 0%, 0%, 0.06);
      cursor: pointer;
      transition: box-shadow 0.2s ease, transform 0.2s ease;

      &:hover {
        box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
        transform: translateY(-2px);
      }

      .obj-mosaic-img {
        position: relative;
        flex: 0 0 auto;
        height: 240px;
        background-color: hsl(38, 25%, 92%);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .obj-mosaic-img-empty {
          font-size: 10px;
          color: hsl(0, 0%, 60%);
        }
      }

      .obj-mosaic-body {
        padding: 8px 10px 10px;
      }

      .obj-mosaic-name {
        font-family: 'Century Schoolbook', Georgia, serif;
        font-size: 14px;
        font-weight: bold;
        line-height: 1.2;
        color: hsl(0, 0%, 10%);
        margin-bottom: 4px;
        word-break: break-word;
      }

      .obj-mosaic-addr {
        display: flex;
        gap: 4px;
        font-size: 11px;
        line-height: 1.35;
        color: hsl(0, 0%, 40%);
        margin-bottom: 6px;

        .pin {
          flex: 0 0 auto;
          color: hsl(38, 40%, 39%);
        }
      }

      .obj-mosaic-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 6px;
        font-size: 11px;
        padding: 2px 0;

        .label {
          flex: 0 0 auto;
          color: hsl(0, 0%, 60%);
        }

        .value {
          text-align: right;
          color: hsl(0, 0%, 10%);
          word-break: break-word;
        }
      }
    }
  }

  /* ===== Список (по макету) ===== */
  .objs-list {
    position: relative;
    width: 100%;
    background-color: hsl(0, 0%, 100%, 0.94);
    border: 1px solid hsla(0, 0%, 0%, 0.06);
    border-radius: 6px;
    overflow: hidden;

    .obj-list-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      padding-left: 76px;
      background-color: hsl(218, 17%, 35%);
      color: hsl(0, 0%, 100%);
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.3px;
      text-transform: uppercase;

      .obj-list-col-name {
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .obj-list-cols {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }

      .obj-list-col {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:nth-child(1) {
          flex: 0 0 70px;
        }

        &:nth-child(2) {
          flex: 0 0 100px;
        }

        &:nth-child(3) {
          flex: 0 0 130px;
        }

        &:nth-child(4) {
          flex: 0 0 80px;
        }
      }
    }

    .obj-list-rows {
      display: flex;
      flex-flow: column nowrap;
    }

    .obj-list-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-bottom: 1px solid hsla(0, 0%, 0%, 0.06);
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:nth-child(even) {
        background-color: hsla(210, 33%, 98%, 0.6);
      }

      &:hover {
        background-color: hsla(218, 90%, 95%, 0.7);
      }

      &:last-child {
        border-bottom: none;
      }

      .obj-list-thumb {
        flex: 0 0 56px;
        width: 56px;
        height: 56px;
        border: 1px solid hsla(0, 0%, 0%, 0.06);
        border-radius: 4px;
        background-color: hsl(38, 25%, 92%);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }

      .obj-list-body {
        flex: 1 1 auto;
        min-width: 0;

        .obj-list-name {
          font-family: 'Century Schoolbook', Georgia, serif;
          font-size: 13px;
          font-weight: bold;
          line-height: 1.2;
          color: hsl(210, 79%, 46%);
          margin-bottom: 2px;
          word-break: break-word;
        }

        .obj-list-addr {
          display: flex;
          gap: 4px;
          font-size: 11px;
          line-height: 1.3;
          color: hsl(0, 0%, 40%);

          .pin {
            flex: 0 0 auto;
            color: hsl(38, 40%, 39%);
          }
        }
      }

      .obj-list-meta {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }

      .obj-list-cell {
        display: flex;
        flex-flow: column nowrap;
        gap: 1px;
        min-width: 0;
        font-size: 11px;

        &:nth-child(1) {
          flex: 0 0 70px;
        }

        &:nth-child(2) {
          flex: 0 0 100px;
        }

        &:nth-child(3) {
          flex: 0 0 130px;
        }

        &:nth-child(4) {
          flex: 0 0 80px;
        }

        .label {
          font-size: 9px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          color: hsl(0, 0%, 60%);
        }

        .value {
          color: hsl(0, 0%, 10%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  /* ===== Точка состояния (баллы) ===== */
  .obj-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    vertical-align: middle;

    &.obj-dot-5 {
      background-color: hsl(138, 25%, 39%);
    }

    &.obj-dot-4 {
      background-color: hsl(89, 46%, 48%);
    }

    &.obj-dot-3 {
      background-color: hsl(39, 51%, 53%);
    }

    &.obj-dot-2 {
      background-color: hsl(28, 56%, 52%);
    }

    &.obj-dot-1 {
      background-color: hsl(10, 39%, 47%);
    }
  }

  /* ===== Узкие экраны: строки списка переносятся, шапка скрывается ===== */
  @media (max-width: 1023px) {
    .objs-list {
      .obj-list-header {
        display: none;
      }

      .obj-list-row {
        flex-wrap: wrap;

        .obj-list-body {
          flex: 1 1 calc(100% - 66px);
        }

        .obj-list-meta {
          flex: 1 1 100%;
          padding-left: 66px;
          flex-wrap: wrap;
          row-gap: 4px;

          .obj-list-cell {
            margin-right: 10px;

            &:nth-child(1),
            &:nth-child(2),
            &:nth-child(3),
            &:nth-child(4) {
              flex: 0 0 auto;
              min-width: 70px;
            }
          }
        }
      }
    }
  }
}
</style>
