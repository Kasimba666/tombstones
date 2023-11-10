<template>
  <ObjsMain v-if="!!filtered"
            :geojson="filtered"
            :filters="filters"
            :scheme="schemeObjs"
            @onSetFiltersValues="setFiltersValues"
  ></ObjsMain>
  {{text}}
</template>

<script>
import ObjsMain from "@/components/ObjsMain"
import Objs from "@/components/Objs"
import fromFile from "@/data/Epigraphy_2023.json";
import imageText from "raw-loader!@/data/images_tombstones.csv";
// import imageText from "raw-loader!./images_tombstones.csv";

export default {
  components: {ObjsMain},
  props: [],
  mixins: [Objs],
  data() {
    return {
      text: '',
      filtersValues: [],
      inputGeojson: null,
      schemeObjs: [
        {
          attrName: 'ID',
          title: 'id',
          inTable: 1,
          colSize: 1,
          inDetails: 0,
          inMap: 1,
          filterType: 'none',
          parentValueFrom: null,
        },
        {
          attrName: 'NAME',
          title: 'Наименование',
          inTable: 1,
          colSize: 3,
          inDetails: 1,
          inMap: 1,
          filterType: 'input',
          parentValueFrom: null,
        },
        {
          attrName: 'ADMIN',
          title: 'Регион',
          inTable: 1,
          colSize: 2,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'LOCAL',
          title: 'Нас.пункт',
          inTable: 1,
          colSize: 2,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: 'ADMIN',
        },
        {
          attrName: 'DATE',
          title: 'Датировка',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'FRONT',
          title: 'Фронт',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'WHOLE',
          title: 'Полный',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'PLACE',
          title: 'Место',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'POSITION',
          title: 'Положение',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'YEAR',
          title: 'Год',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'sketchfab',
          title: '3d',
          inTable: 0,
          colSize: 0,
          inDetails: 1,
          inMap: 0,
          filterType: 'none',
          parentValueFrom: null,
        },
        {
          attrName: 'coordinates',
          title: 'Координаты',
          inTable: 0,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'none',
          parentValueFrom: null,
        },
      ],

    }
  },
  computed: {},
  methods: {
    loadObjs() {
      try {
        this.inputGeojson = fromFile;
      } catch (e) {
        alert('Ошибка загрузки файла');
      }
    },
    loadTextImages() {
      this.text = imageText;
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
    this.loadObjs();
    this.loadTextImages();
    this.initFiltersValues();

  },
}
</script>

<style lang="scss">


</style>

