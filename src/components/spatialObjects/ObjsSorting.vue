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
    <div class="export-block">
      <el-button size="small" type="primary" @click="onExportXLSX">
        <el-icon><Download /></el-icon>
        Экспорт XLSX
      </el-button>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'ObjsSorting',
  components: {},
  props: {
    sortingValues: Object,
    scheme: Array,
    totalCount: Number,
    rows: Array,
    cols: Array,
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
    onExportXLSX() {
      if (!this.rows || this.rows.length === 0) {
        this.$message?.warning?.('Нет данных для экспорта');
        return;
      }
      // Build header row from cols
      const headers = this.cols.map(c => c.titleName);
      // Add coordinate columns
      headers.push('Долгота (Lon)');
      headers.push('Широта (Lat)');

      // Build data rows
      const data = this.rows.map(row => {
        const rowData = this.cols.map(c => {
          let val = row[c.attrName];
          // Handle arrays
          if (Array.isArray(val)) {
            return val.join(', ');
          }
          return val ?? '';
        });
        // Add coordinates if present
        let lon = '';
        let lat = '';
        if (row._coordinates && row._coordinates.length >= 2) {
          lon = row._coordinates[0];
          lat = row._coordinates[1];
        }
        rowData.push(lon);
        rowData.push(lat);
        return rowData;
      });

      // Create workbook
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Объекты');

      // Auto-size columns
      const colWidths = headers.map((h, i) => {
        let maxLen = h.length;
        data.forEach(row => {
          const cellLen = String(row[i] ?? '').length;
          if (cellLen > maxLen) maxLen = cellLen;
        });
        return { wch: Math.min(maxLen + 2, 50) };
      });
      ws['!cols'] = colWidths;

      // Trigger download
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `objects_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
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
