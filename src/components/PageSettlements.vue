<template>
  <ObjsMain v-if="!!filtered"
            :geojson="filtered"
            :filters="filters"
            :scheme="schemeSettlements"
            @onSetFiltersValues="setFiltersValues"
  ></ObjsMain>
</template>

<script>
import ObjsMain from "@/components/ObjsMain"
import fromFile from "@/data/bolgar_settlements.json";


export default {
  components: {ObjsMain},
  props: [],
  data() {
    return {
      inputGeojson: null,
      filtersValues: [],
      visibleFiltersAndList: true,
      visibleDetails: false,
      schemeSettlements: [
        {attrName: 'id', title: 'id', inTable: 1, colSize: 1, inDetails: 0, inMap: 1, filterType: 'none',},
        {attrName: 'name', title: 'Наименование', inTable: 1, colSize: 3, inDetails: 1, inMap: 1, filterType: 'input',},
        {attrName: 'region', title: 'Регион', inTable: 1, colSize: 1, inDetails: 1, inMap: 0, filterType: 'dropdown',},
        {attrName: 'dating', title: 'Датировка', inTable: 1, colSize: 2, inDetails: 1, inMap: 0, filterType: 'dropdown',},
        {attrName: 'location', title: 'Местоположение', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none',},
        {attrName: 'area', title: 'Площадь', inTable: 1, colSize: 1, inDetails: 1, inMap: 0, filterType: 'range',},
        {attrName: 'typesettlement', title: 'Тип', inTable: 1, colSize: 1, inDetails: 1, inMap: 0, filterType: 'dropdown',},
        {attrName: 'form', title: 'Форма', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none',},
        {attrName: 'literature', title: 'Литература', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none',},
        {attrName: 'description', title: 'Описание', inTable: 0, colSize: 1, inDetails: 0, inMap: 0, filterType: 'none',},
        {attrName: 'type', title: 'Тип', inTable: 0, colSize: 1, inDetails: 0, inMap: 0, filterType: 'none',},
        {attrName: 'sketchfab', title: '3d', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none',},
        {attrName: 'coordinates', title: 'Координаты', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none',
        },
      ],
    }
  },
  computed: {
    filters() {
      if (!!this.inputGeojson) {
        let newFilters = [];
        this.schemeSettlements.forEach((attr) => {
          if (attr.filterType === 'input') {
            newFilters.push({
              attrName: attr.attrName,
              title: attr.title,
              type: 'input',

            });
          }
          if (attr.filterType === 'dropdown') {
            let listValues = [];
            this.inputGeojson.features.forEach(feature => {
                  if ((feature.properties[attr.attrName] != null) && (feature.properties[attr.attrName] != '') && !listValues.includes(feature.properties[attr.attrName])) {
                    listValues.push(feature.properties[attr.attrName]);
                  }
                }
            )
            newFilters.push({
              attrName: attr.attrName,
              title: attr.title,
              type: 'dropdown',
              listValues: listValues.sort()
            });
          }
        });
        return newFilters;
      }
      ;
    },
    filtered() {
      if (!!this.inputGeojson) {
        let newFeatures = [];
        this.inputGeojson.features.forEach((item) => {
          //проверить item на соответствие значениям фильтров
          let filterPass = true;
          this.filtersValues.forEach((fV) => {
            if (!(
                ((fV.type === 'dropdown') && ((fV.value === item.properties[fV.attrName]) || (fV.value == null))) ||
                ((fV.type === 'input') && (fV.value == null) || (fV.value === '')
                    || ((item.properties[fV.attrName] != null ? item.properties[fV.attrName] : '').toLowerCase().includes((fV.value != null ? fV.value : '').toLowerCase(), 0)))
            )) {
              filterPass = false;
            }
          });
          //сформировать отфильтрованный geojson
          if (filterPass) {
            newFeatures.push({
              type: item.type,
              properties: item.properties,
              geometry: item.geometry,
            });
          }
        })
        return {
          type: this.inputGeojson.type,
          name: this.inputGeojson.name,
          crs: this.inputGeojson.crs,
          features: newFeatures,
        }
      }
    },
  },
  methods: {
    loadSettlements() {
      try {
        this.inputGeojson = fromFile;
      } catch (e) {
        alert('Ошибка загрузки файла');
      }
    },
    initFiltersValues() {
      this.filtersValues = this.filters.map((item) => {
        return {attrName: item.attrName, type: item.type, value: null}
      });
    },
    setFiltersValues(v) {
      this.filtersValues = v;
      console.log(v);
    },
  },
  mounted() {
    this.loadSettlements();
    this.initFiltersValues();
  },
}
</script>

<style lang="scss">
.objs-filters-list-details {
  border: 1px solid blue;

  .filters-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    background-color: hsl(0, 0%, 90%);


    .filters {
      background-color: hsl(0, 0%, 70%);
      padding: 5px;
    }

    .list {
      background-color: hsl(0, 0%, 70%);
      padding: 5px;
    }
  }

  .details {
    width: 100%;
    height: auto;
  }
}

.objs-map {
  width: 100%;
  height: 100vh;
  background-color: lightgrey;
}

</style>
