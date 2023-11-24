<template>
  <ObjsMain v-if="!!filtered"
            :geojson="filtered"
            :imgs="imgs"
            :filters="filters"
            :scheme="schemeObjs"
            @onSetFiltersValues="setFiltersValues"
  ></ObjsMain>
</template>

<script>
import ObjsMain from "@/components/ObjsMain"
import Objs from "@/components/ObjsMixin"
import fromFile from "@/data/Epigraphy_2023_3857.json";
import imageText from "raw-loader!@/data/images_tombstones.csv";

export default {
  components: {ObjsMain},
  props: [],
  mixins: [Objs],
  data() {
    return {
      imgs: [],
      filtersValues: [],
      inputGeojson: null,
      schemeObjs: [
        {
          attrName: 'id',
          title: 'id',
          inTable: 1,
          colSize: 1,
          inDetails: 0,
          inMap: 1,
          filterType: 'none',
          parentValueFrom: null,
        },
        {
          attrName: 'name',
          title: 'Наименование',
          inTable: 1,
          colSize: 3,
          inDetails: 1,
          inMap: 1,
          filterType: 'input',
          parentValueFrom: null,
        },
        {
          attrName: 'admin',
          title: 'Район',
          inTable: 1,
          colSize: 2,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'local',
          title: 'Нас.пункт',
          inTable: 1,
          colSize: 2,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: 'admin',
        },
        {
          attrName: 'date',
          title: 'Век',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 1,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'front',
          title: 'Фронт',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'whole',
          title: 'Полный',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'place',
          title: 'Место',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'position',
          title: 'Положение',
          inTable: 1,
          colSize: 1,
          inDetails: 1,
          inMap: 0,
          filterType: 'dropdown',
          parentValueFrom: null,
        },
        {
          attrName: 'year',
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
      //привести все имена атрибутов к lower case
      this.inputGeojson.features = this.inputGeojson.features.map((v) => {
        return {
          type: v.type,
          properties: Object.fromEntries(Object.entries(v.properties).map(([key, value]) => {
            return [key.toLowerCase(), value]
          })),
          geometry: v.geometry,
        }
      });
    },
    loadTextImages() {
      this.text = imageText;
      let lines = this.text.split(/\r\n|\r|\n/g);
      if (lines.length > 1) {
        let titles = lines.shift().split(';');
        lines.forEach((v) => {
          let img = {};
          if (v.replaceAll(' ', '') != '') {
            let line = v.split(';');
            for (let i = 0; i < line.length; i++) {
              img[titles[i].toLowerCase()] = line[i];
            }
            this.imgs.push(img);
          }
        });
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
    this.loadObjs();
    this.loadTextImages();
    this.initFiltersValues();

  },
}
</script>

<style lang="scss">


</style>

