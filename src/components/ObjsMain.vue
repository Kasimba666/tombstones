<template>
  <div>

  </div>
</template>

<script>
import ObjsList from "./ObjsList";
import ObjDetails from "./ObjDetails";
import ObjsFilters from "./ObjsFilters";
import ObjsMap from "./ObjsMap";

export default {
  components: {ObjsList, ObjDetails, ObjsFilters, ObjsMap},
  props: {geoJson: Object, scheme: Array},
  emits: ['filters'],
  data() {
    return {
      currentObj: null,
      visibleFiltersAndList: true,
      visibleDetails: false,
    }
  },
  computed: {
    objs() {
      return this.geoJson.features;
    },
    cols() {
      let tempCols = [];
      this.scheme.forEach((item) => {
        if (item.inTable === 1) {
          tempCols.push({attrName: item.attrName, titleName: item.title})
        }
      });
      return tempCols;
    },

    rows() {
      let tempRows = [];
      this.objs.forEach((item) => {
        //сформировать строку
        let row = new Object();
        this.cols.forEach((key) => {
          row[key] = item[key]
        });
        tempRows.push(row);
      })
      return tempRows;
    },

    details() {
      if (!(this.current_obj == null)) {
        let tempDetails = [];

        this.scheme.forEach((item) => {
          if (item.inDetails === 1) {
            tempDetails.push({
              attrName: item.attrName,
              titleName: item.title,
              value: this.current_obj[item.attrName]
            });
          }
        });
        return tempDetails
      }
    },
    objMap() {
      let tempFeatures = this.geoJson.features.map((feature) => {
        let tempFeature = {};
        let tempProperties = {};
        this.scheme.forEach((item) => {
          if (item.inMap === 1) {
            tempFeature[item.attrName] = feature[item.attrName];
          }

        });
        return {
          type: feature.type,
          properties: tempProperties,
        }
      });
      return {
        type: this.geoJson.type,
        name: this.geoJson.name,
        crs: this.geoJson.crs,
        features: tempFeatures,
      }
    },
  },
  methods: {},
  mounted() {
  },
}
</script>

<style lang="scss">

</style>
