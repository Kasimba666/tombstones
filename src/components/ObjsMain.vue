<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <div class="main">
          <obj-details class="filters-list filters-and-list details" :style="{display: visibleDetails ?'block':'none'}"
                       :details="details"
                       :imgs="imgs_details"
                       @clickCloseDetails="closeDetails"
          >
          </obj-details>
          <div class="filters-list filters-and-list" :style="{display: visibleFiltersAndList ?'block':'none'}">
            <objs-filters v-if="!!this.filters"
                          :filters="filters"
                          @onSetFiltersValues="onSetFiltersValues"
            >
            </objs-filters>

            <objs-list
                :rows="rows"
                :titles="cols"
                :currentRow="currentRow"
                @clickRow="setCurrentFeatureFromObjsList"
            >
            </objs-list>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6">
        <div class="objs-map">
          <objs-map v-if="!!collectionFeaturesForMaps"
                    :collectionFeatures="collectionFeaturesForMaps"
                    :oneFeature="oneFeatureForMaps"
                    :scheme="scheme"
                    @clickPoint="setCurrentFeatureFromObjsMap">
          </objs-map>
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import ObjsList from "./ObjsList";
import ObjDetails from "./ObjDetails";
import ObjsFilters from "./ObjsFilters";
import ObjsMap from "./ObjsMap";

export default {
  components: {ObjsList, ObjDetails, ObjsFilters, ObjsMap},
  props: {geojson: Object, imgs: Array, scheme: Array, filters: Array},
  emits: ['onSetFiltersValues'],
  data() {
    return {
      currentFeature: null,
      visibleFiltersAndList: true,
      visibleDetails: false,
    }
  },
  computed: {
    cols() {
      let tempCols = [];
      this.scheme.forEach((item) => {
        if (item.inTable === 1) {
          tempCols.push({attrName: item.attrName, titleName: item.title, colSize: item.colSize})
        }
      });
      return tempCols;
    },

    rows() {
      if (this.geojson === null) return null;
        let tempRows = this.geojson.features.map((feature) => {
          let tempProperties = {};
          this.scheme.forEach((item) => {
            if (item.inTable === 1) {
              tempProperties[item.attrName] = feature.properties[item.attrName];
            }
          });
          return tempProperties
        });
        return tempRows.sort((a, b) => a['name'].localeCompare(b['name']));

    },
    currentRow(){
      if(this.currentFeature === null) return null;
      let tempProperties = {};
      this.scheme.forEach((item) => {
        if (item.inTable === 1) {
          tempProperties[item.attrName] = this.currentFeature.features[0].properties[item.attrName];
        }
      });
      return tempProperties
    },

    details() {
      if (this.currentFeature != null) {
        let tempDetails = [];

        this.scheme.forEach((item) => {
          if (item.inDetails === 1) {
            tempDetails.push({
              attrName: item.attrName,
              titleName: item.title,
              value: this.currentFeature.features[0].properties[item.attrName]
            });
          }
        });
        return tempDetails
      }
    },
    imgs_details() {
      if (!(this.currentFeature === null) && !(this.imgs === null)) {
        return this.imgs.filter((v) => {
          if (v['id'].toString() === this.currentFeature.features[0].properties['id'].toString()) {
            return v
          }
        });
      }
    },
    oneFeatureForMaps() {
      if (!!this.currentFeature) {
          let newProperties = {};
          this.scheme.forEach((item) => {
            if (item.inMap === 1) {
              newProperties[item.attrName] = this.currentFeature.features[0].properties[item.attrName];
            }
          });
        return {
          type: this.currentFeature.type,
          name: this.currentFeature.name,
          crs: this.currentFeature.crs,
          features: [{
            type: this.currentFeature.features[0].type,
            properties: newProperties,
            geometry: this.currentFeature.features[0].geometry,
          }],
        }
      } else return null
    },
    collectionFeaturesForMaps() {
      if (!!this.geojson) {
        let newFeatures = this.geojson.features.map((feature) => {
          let newProperties = {};
          this.scheme.forEach((item) => {
            if (item.inMap === 1) {
              newProperties[item.attrName] = feature.properties[item.attrName];
            }
          });
          return {
            type: feature.type,
            properties: newProperties,
            geometry: feature.geometry,
          }
        });
        return {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: newFeatures,
        }
      }
    },
  },
  methods: {
    setCurrentFeatureFromObjsMap(point) {
      // установить текущий на основе выбранного в картах
      if (!!this.geojson && !!point) {
        this.currentFeature = {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: [],
        }
      }
      this.currentFeature.features.push(this.geojson.features.filter((feature) => {
        let isEqual = true;
        Object.entries(point.features[0].properties).forEach(([key, value]) => {
          if (feature.properties[key] != value) isEqual = false;
        });
        if (isEqual) return feature;
      })[0]);
      this.visibleDetails = true
      this.visibleFiltersAndList = false;
    },
    setCurrentFeatureFromObjsList(row) {
      //найти объект в общем списке, который соответствует всем полям присланной строки
      if (!!this.geojson && !!row) {
        this.currentFeature = {
          type: this.geojson.type,
          name: this.geojson.name,
          crs: this.geojson.crs,
          features: [],
        }
        this.currentFeature.features.push(this.geojson.features.filter((feature) => {
          let isEqual = true;
          Object.entries(row).forEach(([key, value]) => {
            if (feature.properties[key] != value) isEqual = false;
          });
          if (isEqual) return feature;
        })[0]);
      }//if
      this.visibleDetails = true
      this.visibleFiltersAndList = false;
    },
     closeDetails() {
      this.visibleDetails = false;
      this.visibleFiltersAndList = true;
    },

    onSetFiltersValues(v) {
      this.$emit('onSetFiltersValues', v);
      //проверить, входит ли текущий объект в новый набор
      if (this.currentFeature != null) {
        if (this.geojson.features.length === 0) {
          this.currentFeature = null;
        } else if (!this.geojson.features.some(v => JSON.stringify(v) === JSON.stringify(this.currentFeature.features[0]))) {
          this.currentFeature = null;
        }
      }
    },
  },
  mounted() {
  },
}
</script>

<style lang="scss">
.main {
  //border: 1px solid black;

  .filters-and-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    background-color: transparent;

    .filters {
      background-color: transparent;
      padding: 5px;
      border: 1px solid red;
    }

    .list {
      background-color: transparent;
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
  height: 80vh;
  background-color: lightgrey;
}

</style>
