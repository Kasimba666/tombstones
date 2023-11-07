<template>
  <ObjsMain v-if="!!filtered"
            :geojson="filtered"
            :filters="filters"
            :scheme="schemeObjs"
            @onSetFiltersValues="setFiltersValues"
  ></ObjsMain>
</template>

<script>
import ObjsMain from "@/components/ObjsMain"
import Objs from "@/components/Objs"
import fromFile from "@/data/bolgar_settlements.json";


export default {
  components: {ObjsMain},
  props: [],
  mixins: [Objs],
  data() {
    return {
      filtersValues: [],

      inputGeojson: null,

      schemeObjs: [
        {attrName: 'id', title: 'id', inTable: 1, colSize: 1, inDetails: 0, inMap: 1, filterType: 'none', parentValueFrom: null,},
        {attrName: 'name', title: 'Наименование', inTable: 1, colSize: 3, inDetails: 1, inMap: 1, filterType: 'input', parentValueFrom: null,},
        {attrName: 'region', title: 'Регион', inTable: 1, colSize: 1, inDetails: 1, inMap: 0, filterType: 'dropdown', parentValueFrom: null,},
        {attrName: 'dating', title: 'Датировка', inTable: 1, colSize: 2, inDetails: 1, inMap: 0, filterType: 'dropdown', parentValueFrom: null,},
        {attrName: 'location', title: 'Местоположение', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none', parentValueFrom: null,},
        {attrName: 'area', title: 'Площадь', inTable: 1, colSize: 1, inDetails: 1, inMap: 0, filterType: 'range', parentValueFrom: null,},
        {attrName: 'typesettlement', title: 'Тип', inTable: 1, colSize: 1, inDetails: 1, inMap: 0, filterType: 'dropdown', parentValueFrom: null,},
        {attrName: 'form', title: 'Форма', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none', parentValueFrom: null,},
        {attrName: 'literature', title: 'Литература', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none', parentValueFrom: null,},
        {attrName: 'description', title: 'Описание', inTable: 0, colSize: 1, inDetails: 0, inMap: 0, filterType: 'none', parentValueFrom: null,},
        {attrName: 'type', title: 'Тип', inTable: 0, colSize: 1, inDetails: 0, inMap: 0, filterType: 'none', parentValueFrom: null,},
        {attrName: 'sketchfab', title: '3d', inTable: 0, colSize: 1, inDetails: 1, inMap: 0, filterType: 'none', parentValueFrom: null,},
        {attrName: 'coordinates', title: 'Координаты', inTable: 0, colSize: 1, inDetails: 0, inMap: 0, filterType: 'none', parentValueFrom: null,},
      ],
    }
  },
  computed: {

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
    },
  },
  mounted() {
    this.loadSettlements();
    this.initFiltersValues();
  },
}
</script>

<style lang="scss">

</style>
